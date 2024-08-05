const SupplyChainTracker = artifacts.require("SupplyChainTracker");

module.exports = function(deployer) {
  deployer.deploy(SupplyChainTracker);
};