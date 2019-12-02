pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FairCharger.sol";

contract TestPaymentChannel {

  function testInitialBalanceUsingDeployedContract() public{
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());

    uint expected = 10000;

    Assert.equal(charger.balanceOf(msg.sender), expected, "Owner should have 10000 MetaCoin initially");
  }

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

  function testTransferSender() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    uint256 amount = 1000;

    address receiver = 0x820Fc7728d51992421E096317849C4d9b143ae8B;
    uint256 receiverBalance = charger.balanceOf(receiver);
    uint256 expected = receiverBalance + amount;

    charger.transfer(receiver, amount);
    Assert.equal(charger.balanceOf(receiver), expected, "Sender didnt received the Payment of 10.");
  }

}