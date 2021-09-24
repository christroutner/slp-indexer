/*
  Unit tests for indexer genesis.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')
// const BigNumber = require('bignumber.js')
const cloneDeep = require('lodash.clonedeep')

const Send = require('../../../../src/adapters/indexer/send')
const MockLevel = require('../../mocks/indexer/leveldb-mock')
const sendMockDataLib = require('../../mocks/indexer/send-mock')

describe('#Indexer-Send', () => {
  let uut
  let sandbox
  let sendMockData

  beforeEach(() => {
    const addrDb = new MockLevel()
    const tokenDb = new MockLevel()
    const txDb = new MockLevel()

    sendMockData = cloneDeep(sendMockDataLib)

    uut = new Send({ addrDb, tokenDb, txDb })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#subtractTokensFromInputAddr', () => {
    it('should subtract the input UTXOs from the address', async () => {
      const data = {
        slpData: sendMockData.mockSlpData01,
        txData: sendMockData.mockTxData01
      }

      // Mock database entry.
      const addrObj = sendMockData.mockAddrDbData01
      sandbox.stub(uut.addrDb, 'get').resolves(addrObj)
      // console.log(`addrObj before test: ${JSON.stringify(addrObj, null, 2)}`)

      const result = await uut.subtractTokensFromInputAddr(data)
      assert.equal(result, true)

      // console.log(`addrObj after test: ${JSON.stringify(addrObj, null, 2)}`)

      // utxos array should have gone from 3 elements to 2 elements.
      assert.equal(addrObj.utxos.length, 2)

      // balances array should have gone form 2 elements to 1 element.
      assert.equal(addrObj.balances.length, 1)
    })
  })

  describe('#subtractBalanceFromSend', () => {
    // This example comes from the first SEND tx on the BCH blockchain. It
    // send the entire amount, so not only does it subtract the balance, it
    // deletes the element in the balance array, since the balance is zero.
    it('should subtract a balance, and remove balance element if zero', () => {
      const utxoToDelete = {
        txid: '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35',
        vout: 1,
        type: 'token',
        qty: '10000000',
        tokenId:
          '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35'
      }

      const addrObj = sendMockData.mockAddrDbData01

      const result = uut.subtractBalanceFromSend(addrObj, utxoToDelete)
      assert.equal(result, true)

      // console.log('addrObj end: ', addrObj)

      assert.equal(addrObj.balances.length, 1)
    })

    // TODO: Add another test case like above, but use a SEND transaction
    // that does not delete the element in the balances array.
  })

  describe('#addTokensFromOutput', () => {
    it('should update address DB with output balance to new addresses', async () => {
      const data = {
        slpData: sendMockData.mockSlpData01,
        txData: sendMockData.mockTxData01,
        blockHeight: 543409
      }

      // Force code path for new address.
      sandbox.stub(uut.addrDb, 'get').rejects(new Error('no address here'))

      const result = await uut.addTokensFromOutput(data)

      assert.equal(result, true)
    })

    // TODO: Create test case like above, but use code path for existing address.
  })

  describe('#updateBalanceFromSend', () => {
    it('should add balance for new token', () => {
      const addrObj = {
        utxos: [
          {
            txid: '874306bda204d3a5dd15e03ea5732cccdca4c33a52df35162cdd64e30ea7f04e',
            vout: 2,
            type: 'token',
            qty: '5000000',
            tokenId:
              '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35'
          }
        ],
        txs: [
          {
            txid: '874306bda204d3a5dd15e03ea5732cccdca4c33a52df35162cdd64e30ea7f04e',
            height: 543409
          }
        ],
        balances: []
      }

      const slpData = sendMockData.mockSlpData01
      const amountIndex = 1

      const result = uut.updateBalanceFromSend(addrObj, slpData, amountIndex)

      assert.equal(result, true)

      // console.log('addrObj after test: ', addrObj)

      // Balances array should have one element after this test.
      assert.equal(addrObj.balances.length, 1)

      // Ensure expected properties in the balances element.
      assert.property(addrObj.balances[0], 'tokenId')
      assert.property(addrObj.balances[0], 'qty')

      // Ensure expected values
      assert.equal(
        addrObj.balances[0].tokenId,
        '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35'
      )
      assert.equal(addrObj.balances[0].qty, '5000000')
    })

    // TODO: Add test case for address that already has a balance for the token.
  })
})
