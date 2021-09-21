/*
  A utility library for doing common tasks with respect to indexing.
*/

class IndexerUtils {
  // Generate a new schema/template for an address object. This structure will
  // be populated with data.
  getNewAddrObj () {
    try {
      const addr = {
        utxos: [],
        txs: []
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
}

module.exports = IndexerUtils
