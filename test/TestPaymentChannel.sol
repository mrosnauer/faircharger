pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FairCharger.sol";

contract TestPaymentChannel {

  function testReturnName() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    string memory expected = "FairCharger";
    Assert.equal(charger.name(), expected, "Name of Application should be FairCharger");
  }

  function testDecimals() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    uint expected = 2;
    Assert.equal(charger.decimals(), expected, "It should cut 2 decimals");
  }

  function testSymbol() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    string memory expected = "Fair";
    Assert.equal(charger.symbol(), expected, "Symbol should be Fair");
  }

}