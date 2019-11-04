const Migrations = artifacts.require("Migrations");
const FairCharger = artifacts.require("FairCharger");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(FairCharger);
};
