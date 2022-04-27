const Multisender = artifacts.require('MultiSender');
const MockToken = artifacts.require('MockToken');
const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const BigNumber = web3.BigNumber;

require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should();

contract('Multisender', ([account1, account2, account3, account4]) => {
  let multisender;
  let token;

  before(async () => {
    multisender = await Multisender.new(account3, web3.utils.toWei('0.003'), 10);
    token = await MockToken.new('Mock Token', 'MKTK', web3.utils.toWei('600000000'));
    await token.transfer(account4, web3.utils.toWei('600000000'));
  });

  it('should calculate fee correctly', async () => {
    const fee = await multisender.calcFee(30);
    fee.toString().should.be.bignumber.equal(web3.utils.toWei('0.009'));
  });

  it('should revert if caller is not the owner', async () => {
    await expectRevert(multisender.setFeeAddress(account2, { from: account2 }), 'Ownable: caller is not the owner');
  });

  it('should multisend without error if fee is included', async () => {
    await token.approve(multisender.address, web3.utils.toWei('300000000'), { from: account4 });
    await multisender.multisend(
      [
        { _to: account1, _amount: web3.utils.toWei('100000000') },
        { _to: account2, _amount: web3.utils.toWei('100000000') },
        { _to: account3, _amount: web3.utils.toWei('100000000') }
      ],
      token.address,
      { from: account4, value: web3.utils.toWei('0.0009') }
    );

    const balance = await token.balanceOf(account1);

    balance.toString().should.be.bignumber.equal(web3.utils.toWei('100000000'));
  });

  it('should multisend ether', async () => {
    expectEvent(
      await multisender.multisend(
        [
          { _to: account1, _amount: web3.utils.toWei('0.0005') },
          { _to: account2, _amount: web3.utils.toWei('0.0005') },
          { _to: account3, _amount: web3.utils.toWei('0.0005') }
        ],
        '0x0000000000000000000000000000000000000000',
        { from: account4, value: web3.utils.toWei((0.0005 * 3 + 0.0009).toPrecision(4)) }
      ),
      'Multisend'
    );
  });
});
