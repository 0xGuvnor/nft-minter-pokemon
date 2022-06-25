// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

error Pokedex__PokemonPerGenerationDoesNotMatch();
error Pokedex__PriceTooLow();
error Pokedex__MaxSupplyReached();
error Pokedex__RangeOutOfBounds();
error Pokemon__URIAlreadyAssigned();
error Pokedex__NoETHInContract();
error Pokedex__TransactionFailed();

contract Pokedex is VRFConsumerBaseV2, ERC721, ERC721URIStorage, Pausable, AccessControl {
    struct Pokemon {
        uint256 generation;
        uint256 id; /* official Pokemon id */
        uint256 tokenId;
        bool isURIAssigned;
    }

    ////////////
    // roles //
    ///////////
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant URI_ASSIGNER_ROLE = keccak256("URI_ASSIGNER_ROLE");

    /////////////////////
    // state variables //
    /////////////////////
    uint256 public _tokenCounter;
    uint256 public maxSupply;
    uint256 public immutable mintFee;
    // Pokemon generation -> array of individual Pokemon in a given generation
    mapping(uint256 => uint256[]) public pokemonGenerationCount;
    mapping(uint256 => address) public requestIdToOwner;
    mapping(uint256 => Pokemon) public tokenIdToPokemon;
    // Gen 1 (index 0) rarity -> 5%, Gen 2 (index 1) -> 10% etc...
    uint256[5] private generationRarity = [10, 25, 45, 70, 100]; /* UPDATE WHEN YOU CHANGE # OF GENERATIONS! */
    uint256 public pokemonGenerations;

    //////////////////
    // VRF settings //
    //////////////////
    VRFCoordinatorV2Interface private immutable COORDINATOR;
    uint64 private subscriptionId;
    bytes32 private keyHash;
    uint32 private callbackGasLimit;
    uint16 private constant requestConfirmations = 3;
    uint32 private constant numWords = 2;

    event TokenURIAssigned(uint256 indexed tokenId);

    constructor(
        uint256 _maxSupply,
        address _vrfCoordinatorAddress,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint256 _mintFee,
        uint256 _numOfGenerations,
        uint256[] memory _numPerGeneration
    ) VRFConsumerBaseV2(_vrfCoordinatorAddress) ERC721("Pokedex", "POKEMON") {
        if (_numPerGeneration.length != _numOfGenerations)
            revert Pokedex__PokemonPerGenerationDoesNotMatch();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(URI_ASSIGNER_ROLE, msg.sender);

        maxSupply = _maxSupply;
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinatorAddress);
        subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        callbackGasLimit = _callbackGasLimit;
        mintFee = _mintFee;
        pokemonGenerations = _numOfGenerations;

        // populating arrays for number of pokemon in each generation
        for (uint256 i = 0; i < _numOfGenerations; i++) {
            for (uint256 j = 0; j < _numPerGeneration[i]; j++) {
                pokemonGenerationCount[i].push(j);
            }
        }
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function requestMint(uint256 _quantity) external payable whenNotPaused {
        if (msg.value < (mintFee * _quantity)) revert Pokedex__PriceTooLow();
        if ((_tokenCounter + _quantity) >= maxSupply) revert Pokedex__MaxSupplyReached();

        for (uint256 i = 0; i < _quantity; i++) {
            // sends a request to Chainlink VRF for random numbers
            uint256 requestId = COORDINATOR.requestRandomWords(
                keyHash,
                subscriptionId,
                requestConfirmations,
                callbackGasLimit,
                numWords
            );
            requestIdToOwner[requestId] = msg.sender;
        }
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords)
        internal
        override
    {
        uint256 tokenId = _tokenCounter;
        address nftOwner = requestIdToOwner[_requestId];
        _tokenCounter++;

        uint256 pokemonGeneration = _chooseGeneration(_randomWords[0]);
        uint256 pokemonChosen = _choosePokemon(pokemonGeneration, _randomWords[1]);

        tokenIdToPokemon[tokenId].generation = pokemonGeneration;
        tokenIdToPokemon[tokenId].id = pokemonChosen;
        tokenIdToPokemon[tokenId].tokenId = tokenId;

        _safeMint(nftOwner, tokenId);
    }

    function setTokenURI(uint256 _tokenId, string calldata _uri)
        external
        onlyRole(URI_ASSIGNER_ROLE)
    {
        // URI can't be reassigned once it has been set
        if (tokenIdToPokemon[_tokenId].isURIAssigned) revert Pokemon__URIAlreadyAssigned();

        _setTokenURI(_tokenId, _uri);
        tokenIdToPokemon[_tokenId].isURIAssigned = true;
        emit TokenURIAssigned(_tokenId);
    }

    function _chooseGeneration(uint256 _randomWord) internal view returns (uint256) {
        uint256 rng = _randomWord % generationRarity[generationRarity.length - 1]; /* get a random number between 0 and 99 */
        for (uint256 i = 0; i < generationRarity.length; i++) {
            if (rng < generationRarity[i]) {
                return i;
            }
        }
        revert Pokedex__RangeOutOfBounds();
    }

    function _choosePokemon(uint256 _pokemonGeneration, uint256 _randomWord)
        internal
        returns (uint256)
    {
        // get rng based on pokemen generation's count, extract the pokemon index and remove from array
        uint256 rng = _randomWord % pokemonGenerationCount[_pokemonGeneration].length;
        uint256 chosenPokemon = pokemonGenerationCount[_pokemonGeneration][rng];

        // remove this pokemon from being able to be chosen again from the array
        _removeItemInArray(pokemonGenerationCount[_pokemonGeneration], rng);

        return chosenPokemon;
    }

    /**
     * @dev to remove a specific index element from the array by copying the last value
     * of the array to the specified index and popping the last element
     */
    function _removeItemInArray(uint256[] storage arr, uint256 _index) internal {
        arr[_index] = arr[arr.length - 1];
        arr.pop();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function getPokemonLeftByGenerationArray(uint256 _generation)
        external
        view
        returns (uint256[] memory)
    {
        return pokemonGenerationCount[_generation];
    }

    function getPokemonLeftByGenerationCount(uint256 _generation) external view returns (uint256) {
        return pokemonGenerationCount[_generation].length;
    }

    function getPokemonDetails(uint256 _tokenId) external view returns (uint256, uint256) {
        return (tokenIdToPokemon[_tokenId].generation, tokenIdToPokemon[_tokenId].id);
    }

    function withdrawETH(address _to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        if (balance == 0) revert Pokedex__NoETHInContract();

        (bool success, ) = _to.call{value: balance}("");
        if (!success) revert Pokedex__TransactionFailed();
    }

    receive() external payable {}

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
