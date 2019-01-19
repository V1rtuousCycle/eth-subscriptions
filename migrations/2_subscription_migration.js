const WETH = artifacts.require('WETH9');
const Subsciption = artifacts.require('Subscription');

module.exports = (deployer, networks, accounts) => {
    deployer.deploy(WETH).then(wethInstance => {
        return deployer.deploy(Subsciption, accounts[1], wethInstance.address, 1, 5, 1);
    })
};