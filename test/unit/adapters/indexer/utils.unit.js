/*
  Unit tests for indexer util.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')

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
})
