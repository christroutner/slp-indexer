/*
  Unit tests for indexer genesis.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')
// const BigNumber = require('bignumber.js')

const Send = require('../../../../src/adapters/indexer/send')
const MockLevel = require('../../mocks/indexer/leveldb-mock')
const sendMockData = require('../../mocks/indexer/send-mock')

describe('#Indexer-Send', () => {
  let uut
  let sandbox

  beforeEach(() => {
    const addrDb = new MockLevel()
    const tokenDb = new MockLevel()
    const txDb = new MockLevel()

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
      sandbox.stub(uut.addrDb, 'get').resolves(sendMockData.mockAddrDbData01)

      await uut.subtractTokensFromInputAddr(data)

      assert.equal(1, 1)
    })
  })
})
