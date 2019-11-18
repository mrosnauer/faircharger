pragma solidity >=0.4.25 <0.6.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/FairCharger.sol";

contract TestPaymentChannel {

  mapping (address => uint256) private _balances;
  mapping (address => mapping (address => uint256)) private _allowances;

  function testInitialBalanceUsingDeployedContract() public{
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());

    uint expected = 10000;

    Assert.equal(charger.balanceOf(msg.sender), expected, "Owner should have 10000 MetaCoin initially");
  }

  function testInitialBalanceWithNewContract() public{
    FairCharger charger = new FairCharger();

    uint expected = 10000;

    Assert.equal(charger.balanceOf(tx.origin), expected, "Owner should have 10000 MetaCoin initially");
  }

  function testReturnName() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    string memory expected = "FairCharger";
    Assert.equal(charger.name(), expected, "Name of Application is FairCharger");
  }

  function testDecimals() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    uint expected = 2;
    Assert.equal(charger.decimals(), expected, "Cut 2 decimals");
  }

  function testPaymentChannelDuration() public {
   /* FairCharger charger = FairCharger(DeployedAddresses.FairCharger());

    address payable recipient = 0x820Fc7728d51992421E096317849C4d9b143ae8B;

    uint duration = 10;

    uint expectedDuration = block.timestamp + duration;*/

   // charger.SimplePaymentChannel(recipient,duration);
    //Assert.equal(expiration, expectedDuration, "Arsch mit Soß");
  }

  function testSymbol() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    string memory expected = "Fair";
    Assert.equal(charger.symbol(), expected, "Symbol is Fair");
  }

  function testTransferSender() public {
    FairCharger charger = FairCharger(DeployedAddresses.FairCharger());
    uint256 amount = 1000;
    _balances[msg.sender] = charger.balanceOf(msg.sender);
    uint256 expected = _balances[msg.sender] - amount;
    charger.transfer(amount);
    Assert.equal(charger.balanceOf(msg.sender), expected, "Sender received the Payment of 10.");
  }

}