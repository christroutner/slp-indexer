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
      const { slpData, txData } = data

      const recvrAddr = txData.vout[1].scriptPubKey.addresses[0]

      // Update/add reciever address.
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
        vout: 1
      }
      addr.utxos.push(utxo)
      // this.util.addWithoutDuplicate(utxo, addr.utxos)

      // Add the txid to the transaction history.
      this.util.addWithoutDuplicate(txData.txid, addr.txs)

      // Update balances
      this.util.updateBalance(addr, slpData)

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
      const { slpData, txData } = data

      // Exit if the mint baton is null.
      if (slpData.mintBatonVout === null) return

      const recvrAddr =
        txData.vout[slpData.mintBatonVout].scriptPubKey.addresses[0]

      // Update/add reciever address.
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
        vout: slpData.mintBatonVout
      }
      addr.utxos.push(utxo)

      // Add the txid to the transaction history.
      this.util.addWithoutDuplicate(txData.txid, addr.txs)

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
}

module.exports = Genesis
