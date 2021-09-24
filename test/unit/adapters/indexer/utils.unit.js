/*
  Unit tests for indexer util.js library
*/

const assert = require('chai').assert
const sinon = require('sinon')
// const BigNumber = require('bignumber.js')

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
      const elem = { txid: 'a', height: 1234 }

      uut.addWithoutDuplicate(elem, array)

      // console.log('array: ', array)

      assert.property(array[0], 'txid')
      assert.property(array[0], 'height')

      assert.equal(array[0].txid, 'a')
      assert.equal(array[0].height, 1234)
    })

    it('should not add a new entry if it already exists in the array', () => {
      const array = []
      const elem = { txid: 'a', height: 1234 }
      array.push(elem)

      uut.addWithoutDuplicate(elem, array)

      console.log('array: ', array)

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

  describe('#removeObjFromArray', () => {
    it('should remove a given utxo from the array', () => {
      const array = []
      array.push(
        { txid: 'value1', vout: 1 },
        { txid: 'value3', vout: 2 },
        { txid: 'value5', vout: 3 }
      )

      const objToRemove = { txid: 'value3', vout: 2 }

      const result = uut.removeUtxoFromArray(objToRemove, array)
      // console.log('result: ', result)

      assert.equal(result.length, 2)
      assert.equal(result[0].txid, 'value1')
      assert.equal(result[1].txid, 'value5')
    })

    it('should delete using real data', () => {
      const array = [
        {
          txid: '4f035d656ed5b6e94a884c88c09a8d2dee9c7e97901cce3adec966115e2a1ba5',
          vout: 1,
          type: 'token',
          qty: '100'
        },
        {
          txid: '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35',
          vout: 1,
          type: 'token',
          qty: '10000000'
        },
        {
          txid: '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35',
          vout: 2,
          type: 'baton'
        }
      ]

      const utxoToDelete = {
        txid: '323a1e35ae0b356316093d20f2d9fbc995d19314b5c0148b78dc8d9c0dab9d35',
        vout: 1,
        type: 'token',
        qty: '10000000'
      }

      const result = uut.removeUtxoFromArray(utxoToDelete, array)
      // console.log('result: ', result)

      assert.equal(result.length, 2)
      assert.equal(result[0].vout, 1)
      assert.equal(result[1].vout, 2)
    })
  })
})
