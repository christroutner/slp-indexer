/*
  A class library for processing Send SLP transactions

  Strategy for analyzing send transactions:
  - Subtract the quantities of those tokens from the address holding them.
  - Validate the transaction with slp-validate. If invalid, exit processing.
  - Add the token output quantities to each output address.
*/

const IndexerUtils = require('./utils')

class Send {
  constructor (localConfig = {}) {
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

  async subtractTokensFromInputAddr (data) {
    try {
      const { txData } = data

      // Loop through each input.
      for (let i = 0; i < txData.vin.length; i++) {
        const thisVin = txData.vin[i]

        // If there are no tokens in this input, then skip it.
        if (!thisVin.tokenQty) continue

        // Get the DB entry for this address.
        // const addrData = await this.addrDb.get(thisVin.address)

        // Delete the UTXO that was just spent.

        // Subtract the token balance
      }

      // const inputTx = await this.txDb.get()
    } catch (err) {
      console.error('Error in subtractTokensFromInputAddr()')
      throw err
    }
  }
}

module.exports = Send
