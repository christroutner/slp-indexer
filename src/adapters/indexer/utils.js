/*
  A utility library for doing common tasks with respect to indexing.
*/

// const BigNumber = require('bignumber.js')

class IndexerUtils {
  // Generate a new schema/template for an address object. This structure will
  // be populated with data.
  getNewAddrObj () {
    try {
      const addr = {
        utxos: [],
        txs: [],
        balances: []
      }

      return addr
    } catch (err) {
      console.error('Error in getNewAddrObj()')
      throw err
    }
  }

  // Will add a new entry to an array, but only if the entry does not already
  // exist in the array.
  // Canonical use case: Adding transactions to an array
  addWithoutDuplicate (entry, array) {
    try {
      if (array.includes(entry)) return

      array.push(entry)
    } catch (err) {
      console.error('Error in indexer/util.js/addWithoutDuplicate')
    }
  }

  // Finds a UTXO element within an array of UTXOs. Returns a new array with
  // the targeted UTXO deleted.
  removeUtxoFromArray (utxoObj, array) {
    try {
      const newArray = array.filter(
        (x) => x.txid !== utxoObj.txid || x.vout !== utxoObj.vout
      )
      // console.log('newArray: ', newArray)

      return newArray
    } catch (err) {
      console.error('Error in removeObjFromArray()')
      throw err
    }
  }
}

module.exports = IndexerUtils
