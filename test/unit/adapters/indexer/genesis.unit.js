/*
  Unit tests for indexer genesis.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')
const BigNumber = require('bignumber.js')

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
      sandbox.stub(uut, 'updateBalanceFromGenesis').returns()

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
      sandbox.stub(uut, 'updateBalanceFromGenesis').returns()

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

  describe('#updateBalanceFromGenesis', () => {
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

      const result = uut.updateBalanceFromGenesis(addrObj, slpData)
      // console.log('result: ', result)

      assert.equal(result, true)
      assert.equal(addrObj.balances.length, 1)
    })
  })
})
