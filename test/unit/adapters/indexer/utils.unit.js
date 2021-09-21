/*
  Unit tests for indexer util.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')
const BigNumber = require('bignumber.js')

const IndexerUtils = require('../../../../src/adapters/indexer/utils')
// const IPFSMock = require('../mocks/ipfs-mock')

describe('#Indexer-Utils', () => {
  let uut
  let sandbox

  beforeEach(() => {
    uut = new IndexerUtils()

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#addWithoutDuplicate', () => {
    it('should add a new entry to the array', () => {
      const array = []
      const elem = 'a'

      uut.addWithoutDuplicate(elem, array)

      // console.log('array: ', array)

      assert.equal(array.includes('a'), true)
    })

    it('should not add a new entry if it already exists in the array', () => {
      const array = ['a']
      const elem = 'a'

      uut.addWithoutDuplicate(elem, array)

      // console.log('array: ', array)
      assert.equal(array.length, 1)
    })
  })

  describe('#getNewAddrObj', () => {
    it('should return an address object', () => {
      const result = uut.getNewAddrObj()

      assert.property(result, 'utxos')
      assert.property(result, 'txs')
    })
  })

  describe('#updateBalance', () => {
    it('should add a new token balance', () => {
      const addrObj = {
        balances: []
      }

      const slpData = {
        tokenType: 1,
        txType: 'GENESIS',
        ticker: '',
        name: '',
        tokenId:
          '545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4',
        documentUri: '',
        documentHash: '',
        decimals: 0,
        mintBatonVout: 2,
        qty: new BigNumber({ s: 1, e: 6, c: [1000000] })
      }

      const result = uut.updateBalance(addrObj, slpData)
      // console.log('result: ', result)

      assert.equal(result, true)
      assert.equal(addrObj.balances.length, 1)
    })

    // TODO: I need a send TX to test this.
    // it('should increment the balance of an address')

    // TODO: I need a send TX to test this.
    // it('should decrement the balance of an address')
  })
})
