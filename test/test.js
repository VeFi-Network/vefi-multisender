const Multisender = artifacts.require('Multisender');
const MockToken = artifacts.require('MockToken');
const { expectRevert } = require('@openzeppelin/test-helpers');
const BigNumber = web3.BigNumber;

require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should();

contract('Multisender', ([account1, account2, account3]) => {
  let multisender;
  let token;

  before(async () => {
    multisender = await Multisender.new(account3, web3.utils.toWei('0.003'), 10);
    token = await MockToken.new('Mock Token', 'MKTK', 5);
  });
});
