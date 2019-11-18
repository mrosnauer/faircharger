pragma solidity >=0.4.24 <0.6.0;

contract FairCharger {
  mapping (address => uint256) private _balances;
  mapping (address => mapping (address => uint256)) private _allowances;
  uint256 private _totalSupply;

  event Transfer(address indexed from, address indexed recipient, uint256 amount);
  event Approval(address indexed owner, address indexed spender, uint256 amount);

  constructor() public {
    _totalSupply = 10000;
    _balances[msg.sender] = _totalSupply;
  }

  /**
    Payment Channels.
   */
   address owner = msg.sender;
    address payable public sender;     // The account sending payments.
    address payable public recipient;  // The account receiving the payments.
    uint256 public expiration; // Timeout in case the recipient never closes.

    function SimplePaymentChannel(address payable _recipient, uint256 duration)
        public
        payable
    {
        sender = msg.sender;
        recipient = _recipient;
        expiration = now + duration;
    }

    function isValidSignature(uint256 amount, bytes memory signature)
        internal
        view
        returns (bool)
    {
        bytes32 message = prefixed(keccak256(abi.encodePacked(this, amount)));

        // Check that the signature is from the payment sender.
        return recoverSigner(message, signature) == sender;
    }

    // The recipient can close the channel at any time by presenting a signed
    // amount from the sender. The recipient will be sent that amount, and the
    // remainder will go back to the sender.
    function close(uint256 amount, bytes memory signature) public {
        require(msg.sender == recipient);
        require(isValidSignature(amount, signature));

        recipient.transfer(amount);
        selfdestruct(sender);
    }

    // The sender can extend the expiration at any time.
    function extend(uint256 newExpiration) public {
        require(msg.sender == sender);
        require(newExpiration > expiration);

        expiration = newExpiration;
    }

    // If the timeout is reached without the recipient closing the channel, then
    // the ether is released back to the sender.
    function claimTimeout() public {
        require(now >= expiration);
        selfdestruct(sender);
    }

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8, bytes32, bytes32)
    {
        require(sig.length == 65);

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        uint8 v;
        bytes32 r;
        bytes32 s;

        (v, r, s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    // Builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }
  /*
    Payment Channel end. 
  */

  function name() public pure returns (string memory) {
    return "FairCharger";
  }

  function symbol() public pure returns (string memory) {
    return "Fair";
  }

  function decimals() public pure returns (uint8) {
    return 2;
  }

  function totalSupply() public view returns (uint256) {
    return _totalSupply;
  }

  function balanceOf(address account) public view returns (uint256) {
    return _balances[account];
  }

  function transfer(uint256 amount) public returns (bool) {
    require(_balances[msg.sender] - amount >= 0, "Sender does not have enough coins");
    _balances[msg.sender] -= amount;
    _balances[recipient] += amount;
    emit Transfer(msg.sender, recipient, amount);
    return true;
  }

  function approve(address spender, uint256 amount) public returns (bool) {
    _allowances[msg.sender][spender] = amount;
    emit Approval(msg.sender, spender, amount);
    return true;
  }

  function allowance(address spender) public view returns (uint256) {
    return _allowances[owner][spender];
  }

  function transferFrom(address from, uint256 amount) public returns (bool) {
    require(_allowances[from][msg.sender] >= amount, "Allowance does not suffice");
    require(_balances[from] - amount >= 0, "Sender does not have enough coins");
    _balances[from] -= amount;
    _balances[recipient] += amount;
    _allowances[from][msg.sender] -= amount;
    emit Transfer(from, recipient, amount);

    return true;
  }
}
