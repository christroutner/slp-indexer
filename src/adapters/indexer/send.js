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
      const { slpData, txData } = data
      console.log(`Processing txid: ${txData.txid}`)
      console.log('slpData: ', slpData)

      // Loop through each input.
      for (let i = 0; i < txData.vin.length; i++) {
        const thisVin = txData.vin[i]
        console.log(`thisVin: ${JSON.stringify(thisVin, null, 2)}`)

        // If there are no tokens in this input, then skip it.
        if (!thisVin.tokenQty) continue

        // Get the DB entry for this address.
        const addrData = await this.addrDb.get(thisVin.address)
        console.log('addrData: ', addrData)

        // Get the UTXO entry that matches the current input.
        const utxoToDelete = addrData.utxos.filter(
          (x) => x.txid === thisVin.txid && x.vout === thisVin.vout
        )
        console.log('utxoToDelete: ', utxoToDelete)

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
        console.log('addrData: ', addrData)

        // Subtract the token balance
        // this.subtractBalanceFromSend(addrData, utxoToDelete)
      }

      // const inputTx = await this.txDb.get()
    } catch (err) {
      console.error('Error in subtractTokensFromInputAddr()')
      throw err
    }
  }

  // Update the balance for the given address with the given token data.
  subtractBalanceFromSend (addrObj, slpData) {
    try {
      console.log('addrObj: ', addrObj)
      console.log('slpData: ', slpData)

      // const tokenId = slpData.tokenId
      // const qty = slpData.qty
      //
      // const tokenExists = addrObj.balances.filter((x) => x.tokenId === tokenId)
      // // console.log('tokenExists: ', tokenExists)
      //
      // if (!tokenExists.length) {
      //   // Balance for this token does not exist in the address. Add it.
      //   addrObj.balances.push({ tokenId, qty })
      //   return true
      // }
      //
      // // Token exists in the address object, update the balance.
      // for (let i = 0; i < addrObj.balances; i++) {
      //   const thisBalance = addrObj.balances[i]
      //
      //   if (thisBalance.tokenId !== tokenId) continue
      //
      //   // bignumber.js addition.
      //   thisBalance.qty = qty.plus(thisBalance.qty)
      //
      //   return true
      // }
      //
      // // This code path shouldn't execute.
      // return false
    } catch (err) {
      console.error('Error in indexer/utils.js/updateBalance()')
      throw err
    }
  }
}

module.exports = Send
