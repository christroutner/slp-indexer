/*
  A class library for processing Send SLP transactions

  Strategy for analyzing send transactions:
  - Subtract the quantities of those tokens from the address holding them.
  - Validate the transaction with slp-validate. If invalid, exit processing.
  - Add the token output quantities to each output address.
*/

const IndexerUtils = require('./utils')
const BigNumber = require('bignumber.js')

class Send {
  constructor (localConfig = {}) {
    // TODO: Throw error if database handles are not passed in with localConfig

    // LevelDBs
    this.addrDb = localConfig.addrDb
    this.tokenDb = localConfig.tokenDb
    this.txDb = localConfig.txDb

    this.util = new IndexerUtils()
  }

  async processTx (data) {
    try {
      // const { slpData, blockHeight, txData } = data

      await this.subtractTokensFromInputAddr(data)

      await this.addTokensFromOutput(data)

      // await this.addTokenToDB(data)

      // await this.addReceiverAddress(data)

      // await this.addBatonAddress(data)
    } catch (err) {
      console.error('Error in genesis.processTx()')
      throw err
    }
  }

  async addTokensFromOutput (data) {
    try {
      // const { slpData } = data
      // Loop through each output in slpData
      // for (let i = 0; i < slpData.amounts.length; i++) {
      //   // Update/add reciever address.
      //   let addr
      //   try {
      //     // Address exists in the database
      //     addr = await this.addrDb.get(recvrAddr)
      //     console.log('addr exists in the database: ', addr)
      //   } catch (err) {
      //     // New address.
      //     addr = this.util.getNewAddrObj()
      //   }
      //
      //   const utxo = {
      //     txid: txData.txid,
      //     vout: 1,
      //     type: 'token',
      //     qty: slpData.qty.toString()
      //   }
      //   addr.utxos.push(utxo)
      //   // this.util.addWithoutDuplicate(utxo, addr.utxos)
      //
      //   // Add the txid to the transaction history.
      //   this.util.addWithoutDuplicate(txData.txid, addr.txs)
      //
      //   // Update balances
      //   this.util.updateBalance(addr, slpData)
      //
      //   // Save address to the database.
      //   await this.addrDb.put(recvrAddr, addr)
      // }
    } catch (err) {
      console.error('Error in addTokensFromOutput()')
      throw err
    }
  }

  // Update the address entry in the database, to reflect the spent inputs.
  async subtractTokensFromInputAddr (data) {
    try {
      const { txData } = data
      // console.log(`Processing txid: ${txData.txid}`)
      // console.log('slpData: ', slpData)

      // Loop through each input.
      for (let i = 0; i < txData.vin.length; i++) {
        const thisVin = txData.vin[i]
        // console.log(`thisVin: ${JSON.stringify(thisVin, null, 2)}`)

        // If there are no tokens in this input, then skip it.
        if (!thisVin.tokenQty) continue

        // Get the DB entry for this address.
        const addrData = await this.addrDb.get(thisVin.address)
        // console.log('addrData: ', addrData)

        // Get the UTXO entry that matches the current input.
        const utxoToDelete = addrData.utxos.filter(
          (x) => x.txid === thisVin.txid && x.vout === thisVin.vout
        )
        // console.log('utxoToDelete: ', utxoToDelete)

        // This shouldn't happen, but catch a potential corner case.
        if (!utxoToDelete.length) {
          throw new Error(
            'Could not find UTXO in address to delete when processing TX inputs.'
          )
        }

        // Delete the UTXO that was just spent.
        addrData.utxos = this.util.removeUtxoFromArray(
          utxoToDelete[0],
          addrData.utxos
        )
        // console.log('addrData after utxo delete: ', addrData)

        // Subtract the token balance
        this.subtractBalanceFromSend(addrData, utxoToDelete[0])
        // console.log('addrData after subtractBalanceFromSend: ', addrData)
      }

      return true
      // const inputTx = await this.txDb.get()
    } catch (err) {
      console.error('Error in subtractTokensFromInputAddr()')
      throw err
    }
  }

  // Update the balance for the given address with the given token data.
  subtractBalanceFromSend (addrObj, utxoToDelete) {
    try {
      // console.log('addrObj: ', addrObj)
      // console.log('utxoToDelete: ', utxoToDelete)

      // Subtract the balance of the utxoToDelete from the balance for that token.
      for (let i = 0; i < addrObj.balances.length; i++) {
        const thisBalance = addrObj.balances[i]

        if (thisBalance.tokenId === utxoToDelete.tokenId) {
          const currentBalance = new BigNumber(thisBalance.qty)
          const amountToSubtract = new BigNumber(utxoToDelete.qty)

          const difference = currentBalance.minus(amountToSubtract)

          thisBalance.qty = difference.toString()

          // If the balance is zero, remove that entry from the address data.
          if (difference.isZero()) {
            addrObj.balances.splice(i, 1)
          }

          break // Exit the loop
        }
      }

      return true
    } catch (err) {
      console.error('Error in indexer/utils.js/updateBalance()')
      throw err
    }
  }
}

module.exports = Send
