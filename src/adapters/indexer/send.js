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
      // console.log(`send.processTx() data: ${JSON.stringify(data, null, 2)}`)
      // const { slpData } = data

      // console.log('slpData: ', slpData)
      // console.log('slpData.amounts: ', slpData.amounts)

      // Subtract the input UTXOs and balances from input addresses.
      await this.subtractTokensFromInputAddr(data)

      // Add the output UTXOs to output addresses
      await this.addTokensFromOutput(data)
    } catch (err) {
      console.error('Error in genesis.processTx()')
      throw err
    }
  }

  // Update the addresses in the database recieving the outputs of the tx.
  async addTokensFromOutput (data) {
    try {
      // console.log(`data: ${JSON.stringify(data, null, 2)}`)
      const { slpData, txData, blockHeight } = data

      // Loop through each output in slpData
      for (let i = 0; i < slpData.amounts.length; i++) {
        const recvrAddr = txData.vout[1 + i].scriptPubKey.addresses[0]

        // Get address from the database, or create a new address object if it
        // doesn't exist in the database.
        let addr
        try {
          // Address exists in the database
          addr = await this.addrDb.get(recvrAddr)
          console.log('addr exists in the database: ', addr)
        } catch (err) {
          // New address.
          addr = this.util.getNewAddrObj()
        }

        const utxo = {
          txid: txData.txid,
          vout: 1 + i,
          type: 'token',
          qty: slpData.amounts[i].toString(),
          tokenId: slpData.tokenId
        }
        addr.utxos.push(utxo)
        // this.util.addWithoutDuplicate(utxo, addr.utxos)

        // Add the txid to the transaction history.
        const txObj = {
          txid: txData.txid,
          height: blockHeight
        }
        this.util.addWithoutDuplicate(txObj, addr.txs)

        // Update balances
        this.updateBalanceFromSend(addr, slpData, i)

        // Save address to the database.
        await this.addrDb.put(recvrAddr, addr)
      }

      return true
    } catch (err) {
      console.error('Error in addTokensFromOutput()')
      throw err
    }
  }

  // Update the balance for the given address with the given token data.
  updateBalanceFromSend (addrObj, slpData, amountIndex) {
    try {
      // console.log('addrObj: ', addrObj)
      // console.log('slpData: ', slpData)
      // console.log('amountIndex: ', amountIndex)

      const tokenId = slpData.tokenId
      const qty = slpData.amounts[amountIndex]

      const tokenExists = addrObj.balances.filter((x) => x.tokenId === tokenId)
      // console.log('tokenExists: ', tokenExists)

      // If the token does not exist in the address object from the database.
      if (!tokenExists.length) {
        // Balance for this token does not exist in the address. Add it.
        addrObj.balances.push({ tokenId, qty: qty.toString() })
        return true
      }

      // Token exists in the address object, update the balance.
      for (let i = 0; i < addrObj.balances; i++) {
        const thisBalance = addrObj.balances[i]

        if (thisBalance.tokenId !== tokenId) continue

        // bignumber.js addition.
        thisBalance.qty = qty.plus(thisBalance.qty).toString()

        return true
      }

      // This code path shouldn't execute.
      return false
    } catch (err) {
      console.error('Error in updateBalanceFromSend()')
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

        // Save the updated address data to the database.
        await this.addrDb.put(thisVin.address, addrData)
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
