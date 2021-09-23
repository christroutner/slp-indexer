/*
  A class library for processing Genesis SLP transactions
*/

const IndexerUtils = require('./utils')

class Genesis {
  constructor (localConfig = {}) {
    // LevelDBs
    this.addrDb = localConfig.addrDb
    this.tokenDb = localConfig.tokenDb

    this.util = new IndexerUtils()
  }

  async processTx (data) {
    try {
      // const { slpData, blockHeight, txData } = data

      await this.addTokenToDB(data)

      await this.addReceiverAddress(data)

      await this.addBatonAddress(data)
    } catch (err) {
      console.error('Error in genesis.processTx()')
      throw err
    }
  }

  // Add the address to the database, for the address recieving the tokens
  // created by the Genesis transaction.
  async addReceiverAddress (data) {
    try {
      const { slpData, txData, blockHeight } = data

      const recvrAddr = txData.vout[1].scriptPubKey.addresses[0]

      // Update/add reciever address.
      let addr
      try {
        // Address exists in the database
        addr = await this.addrDb.get(recvrAddr)
        // console.log('addr exists in the database: ', addr)
      } catch (err) {
        // New address.
        addr = this.util.getNewAddrObj()
      }

      const utxo = {
        txid: txData.txid,
        vout: 1,
        type: 'token',
        qty: slpData.qty.toString()
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
      this.updateBalanceFromGenesis(addr, slpData)

      // Save address to the database.
      await this.addrDb.put(recvrAddr, addr)

      return addr
    } catch (err) {
      console.error('Error in genesis.addReceiverAddress()')
      throw err
    }
  }

  // Add the address to the database, for the address recieving the minting
  // baton.
  async addBatonAddress (data) {
    try {
      const { slpData, txData, blockHeight } = data

      // Exit if the mint baton is null.
      if (slpData.mintBatonVout === null) return

      const recvrAddr =
        txData.vout[slpData.mintBatonVout].scriptPubKey.addresses[0]

      // Update/add reciever address.
      let addr
      try {
        // Address exists in the database
        addr = await this.addrDb.get(recvrAddr)
        // console.log('addr exists in the database: ', addr)
      } catch (err) {
        // New address.
        addr = this.util.getNewAddrObj()
      }

      const utxo = {
        txid: txData.txid,
        vout: slpData.mintBatonVout,
        type: 'baton'
      }
      addr.utxos.push(utxo)

      // Add the txid to the transaction history.
      const txObj = {
        txid: txData.txid,
        height: blockHeight
      }
      this.util.addWithoutDuplicate(txObj, addr.txs)

      // Save address to the database.
      await this.addrDb.put(recvrAddr, addr)

      return addr
    } catch (err) {
      console.error('Error in genesis.addBatonAddress()')
      throw err
    }
  }

  // Process a GENESIS transaction by adding the new token to the token database.
  async addTokenToDB (data) {
    try {
      const { slpData, blockHeight } = data

      // Add the new token to the token database.
      const token = {
        type: slpData.tokenType,
        ticker: slpData.ticker,
        name: slpData.name,
        tokenId: slpData.tokenId,
        documentUri: slpData.documentUri,
        documentHash: slpData.documentHash,
        decimals: slpData.decimals,
        mintBatonIsActive: false,
        tokensInCirculationBN: slpData.qty,
        tokensInCirculationStr: slpData.qty.toString(),
        blockCreated: blockHeight
      }

      // Handle case if minting baton was created.
      if (slpData.mintBatonVout !== null) {
        token.mintBatonIsActive = true
      }

      // Store the token data in the database.
      await this.tokenDb.put(slpData.tokenId, token)

      return true
    } catch (err) {
      console.error('Error in genesis.addTokenToDB()')
      throw err
    }
  }

  // Update the balance for the given address with the given token data.
  updateBalanceFromGenesis (addrObj, slpData) {
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

module.exports = Genesis
