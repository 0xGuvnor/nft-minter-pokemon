
module.exports = async ({deployments, getNamedAccounts}) => {
    const {deploy, log} = deployments;
    const {deployer} = await getNamedAccounts();
    log("====================================================================");
}

module.exports.tags =['all']