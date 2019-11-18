pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FairCharger.sol";

contract TestPaymentChannel {
  function testInitialBalanceUsingDeployedContract() public{
    FairCharger meta = FairCharger(DeployedAddresses.FairCharger());

    uint expected = 10000;

    Assert.equal(meta.balanceOf(msg.sender), expected, "Owner should have 10000 MetaCoin initially");
  }

  function testInitialBalanceWithNewMetaCoin() public{
    FairCharger meta = new FairCharger();

    uint expected = 10000;

    Assert.equal(meta.balanceOf(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  }

  function testTransferFrom() public {
    /*FairCharger meta = FairCharger(DeployedAddresses.FairCharger());
    
    uint transferAmount = 1000;*/


  }
}