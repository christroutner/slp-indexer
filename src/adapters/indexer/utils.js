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

  // Update the balance for the given address with the given token data.
  updateBalance (addrObj, slpData) {
    try {
      // console.log('addrObj: ', addrObj)
      // console.log('slpData: ', slpData)

      const tokenId = slpData.tokenId
      const qty = slpData.qty

      const tokenExists = addrObj.balances.filter((x) => x.tokenId === tokenId)
      // console.log('tokenExists: ', tokenExists)

      if (!tokenExists.length) {
        // Balance for this token does not exist in the address. Add it.
        addrObj.balances.push({ tokenId, qty })
        return true
      }

      // Token exists in the address object, update the balance.
      for (let i = 0; i < addrObj.balances; i++) {
        const thisBalance = addrObj.balances[i]

        if (thisBalance.tokenId !== tokenId) continue

        // bignumber.js addition.
        thisBalance.qty = qty.plus(thisBalance.qty)

        return true
      }

      // This code path shouldn't execute.
      return false
    } catch (err) {
      console.error('Error in indexer/utils.js/updateBalance()')
      throw err
    }
  }
}

module.exports = IndexerUtils
