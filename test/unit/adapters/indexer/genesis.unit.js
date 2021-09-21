/*
  Unit tests for indexer genesis.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')

const Genesis = require('../../../../src/adapters/indexer/genesis')
const MockLevel = require('../../mocks/indexer/leveldb-mock')
const genesisMockData = require('../../mocks/indexer/genesis-mock')

describe('#Indexer-Genesis', () => {
  let uut
  let sandbox

  beforeEach(() => {
    const addrDb = new MockLevel()
    const tokenDb = new MockLevel()

    uut = new Genesis({ addrDb, tokenDb })

    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('#addTokenToDB', () => {
    it('should add a new token to the DB', async () => {
      const data = {
        slpData: genesisMockData.genesisParse,
        blockHeight: 543376,
        txData: genesisMockData.genesisTx
      }

      // Mock dependencies
      sandbox.stub(uut.util, 'updateBalance').returns()

      const result = await uut.addTokenToDB(data)

      assert.equal(result, true)
    })
  })

  describe('#addReceiverAddress', () => {
    it('should add a new address to the database', async () => {
      const data = {
        slpData: genesisMockData.genesisParse,
        blockHeight: 543376,
        txData: genesisMockData.genesisTx
      }

      // Force code path for new address.
      sandbox.stub(uut.addrDb, 'get').rejects(new Error('test error'))

      const result = await uut.addReceiverAddress(data)
      // console.log('result: ', result)

      assert.property(result, 'utxos')
      assert.property(result, 'txs')
    })

    it('should update an existing address', async () => {
      const data = {
        slpData: genesisMockData.genesisParse,
        blockHeight: 543376,
        txData: genesisMockData.genesisTx
      }

      // Force code path for existing address.
      sandbox.stub(uut.addrDb, 'get').resolves(genesisMockData.mockAddr)

      // Mock dependencies
      sandbox.stub(uut.util, 'updateBalance').returns()

      const result = await uut.addReceiverAddress(data)
      // console.log('result: ', result)

      // TODO: Figure out better assertions.
      assert.property(result, 'utxos')
      assert.property(result, 'txs')
    })
  })

  describe('#addBatonAddress', () => {
    it('should add a new address to the database', async () => {
      const data = {
        slpData: genesisMockData.genesisParse,
        blockHeight: 543376,
        txData: genesisMockData.genesisTx
      }

      // Force code path for new address.
      sandbox.stub(uut.addrDb, 'get').rejects(new Error('test error'))

      const result = await uut.addBatonAddress(data)
      // console.log('result: ', result)

      assert.property(result, 'utxos')
      assert.property(result, 'txs')
    })

    it('should update an existing address', async () => {
      const data = {
        slpData: genesisMockData.genesisParse,
        blockHeight: 543376,
        txData: genesisMockData.genesisTx
      }

      // Force code path for existing address.
      sandbox.stub(uut.addrDb, 'get').resolves(genesisMockData.mockAddr)

      const result = await uut.addBatonAddress(data)
      // console.log('result: ', result)

      // TODO: Figure out better assertions.
      assert.property(result, 'utxos')
      assert.property(result, 'txs')
    })
  })
})
