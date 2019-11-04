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

    mapping(uint256 => bool) usedNonces;

    function claimPayment(uint256 amount, uint256 nonce, bytes memory signature) public {
        require(!usedNonces[nonce]);
        usedNonces[nonce] = true;

        // this recreates the message that was signed on the client
        bytes32 message = prefixed(keccak256(abi.encodePacked(msg.sender, amount, nonce, this)));

        require(recoverSigner(message, signature) == owner);

        msg.sender.transfer(amount);
    }

    /// destroy the contract and reclaim the leftover funds.
    function kill() public {
        require(msg.sender == owner);
        selfdestruct(msg.sender);
    }

    /// signature methods.
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (uint8 v, bytes32 r, bytes32 s)
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        pure
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

  /*
    Payment Cahnnel end. 
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

  function transfer(address recipient, uint256 amount) public returns (bool) {
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

  function transferFrom(address from, address recipient, uint256 amount) public returns (bool) {
    require(_allowances[from][msg.sender] >= amount, "Allowance does not suffice");
    require(_balances[from] - amount >= 0, "Sender does not have enough coins");
    _balances[from] -= amount;
    _balances[recipient] += amount;
    _allowances[from][msg.sender] -= amount;
    emit Transfer(from, recipient, amount);

    return true;
  }
}
