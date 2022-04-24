pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import './libraries/Helpers.sol';

contract MultiSender is Ownable {
  using SafeMath for uint256;

  struct Payment {
    address _to;
    uint256 _amount;
  }

  uint256 FEE_PER_ADDRESSES;
  address FEE_ADDRESS;
  int256 FEE_BASIS;

  constructor(
    address _feeAddress,
    uint256 _fee,
    int256 _feeBasis
  ) {
    FEE_ADDRESS = _feeAddress;
    FEE_PER_ADDRESSES = _fee;
    FEE_BASIS = _feeBasis;
  }

  function calcFee(uint256 length) public view returns (uint256) {
    return length.mul(FEE_PER_ADDRESSES).div(uint256(FEE_BASIS));
  }

  function multisend(Payment[] memory _payments, address _token) external payable returns (bool) {
    uint256 _fee = calcFee(_payments.length);

    if (_token == address(0)) {
      uint256 _totalPaymentAmount = 0;

      for (uint256 i = 0; i < _payments.length; i++)
        _totalPaymentAmount = _totalPaymentAmount.add(_payments[i]._amount);

      require(msg.value >= _totalPaymentAmount.add(_fee), 'MUST_INCLUDE_FEE or INSUFFICIENT_AMOUNT');

      for (uint256 i = 0; i < _payments.length; i++)
        require(Helpers._safeTransferETH(_payments[i]._to, _payments[i]._amount), 'COULD_NOT_TRANSFER_ETHER');
    } else {
      require(msg.value >= _fee, 'MUST_INCLUDE_FEE');

      uint256 _totalPaymentAmount = 0;

      for (uint256 i = 0; i < _payments.length; i++)
        _totalPaymentAmount = _totalPaymentAmount.add(_payments[i]._amount);

      require(IERC20(_token).allowance(_msgSender(), address(this)) >= _totalPaymentAmount, 'NO_ALLOWANCE');

      for (uint256 i = 0; i < _payments.length; i++)
        require(
          Helpers._safeTransferFrom(_token, _msgSender(), _payments[i]._to, _payments[i]._amount),
          'COULD_NOT_TRANSFER_TOKEN'
        );
    }

    return true;
  }
}
