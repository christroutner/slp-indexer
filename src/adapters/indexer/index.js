/*
  Main class library for the SLP indexing functionality.

  Testing notes:
  - First Genesis tx occurs in block 543376

*/

const level = require('level')
const BCHJS = require('@psf/bch-js')
// const BigNumber = require('bignumber.js')

const Genesis = require('./genesis')

// const dirName = `${__dirname.toString()}/../../../leveldb/addrs`
// console.log(dirName)

const addrDb = level(`${__dirname.toString()}/../../../leveldb/addrs`, {
  valueEncoding: 'json'
})
const txDb = level(`${__dirname.toString()}/../../../leveldb/txs`, {
  valueEncoding: 'json'
})
const tokenDb = level(`${__dirname.toString()}/../../../leveldb/tokens`, {
  valueEncoding: 'json'
})
const statusDb = level(`${__dirname.toString()}/../../../leveldb/status`, {
  valueEncoding: 'json'
})

class SlpIndexer {
  constructor () {
    this.bchjs = new BCHJS({ restURL: 'http://192.168.0.36:3000/v5/' })
    this.genesis = new Genesis({ addrDb, tokenDb })
  }

  async start () {
    try {
      console.log('starting indexer...\n')

      // Get the current sync status.
      let status
      try {
        status = await statusDb.get('status')
      } catch (err) {
        // New database, so there is no status. Create it.
        status = {
          startBlockHeight: 543376,
          syncedBlockHeight: 543376
        }

        await statusDb.put('status', status)
      }
      // console.log('status: ', status)
      console.log(
        `Indexer is currently synced to height ${status.syncedBlockHeight}`
      )

      // Get the current block height
      const biggestBlockHeight = await this.bchjs.Blockchain.getBlockCount()
      console.log('Current chain block height: ', biggestBlockHeight)

      // Loop through the block heights and index every block.
      for (
        let blockHeight = status.syncedBlockHeight;
        // blockHeight < biggestBlockHeight;
        blockHeight < status.syncedBlockHeight + 5;
        blockHeight++
      ) {
        // Get the block hash for the current block height.
        const blockHash = await this.bchjs.Blockchain.getBlockHash(blockHeight)
        // console.log("blockHash: ", blockHash);

        // Now get the actual data stored in that block.
        const block = await this.bchjs.Blockchain.getBlock(blockHash)
        // console.log("block: ", block);
        console.log(' ')

        // Transactions in the block.
        const txs = block.tx

        // Scan each transaction in the block.
        for (let i = 0; i < txs.length; i++) {
          const tx = txs[i]
          console.log('Inspecting tx: ', tx)

          try {
            const slpData = await this.bchjs.SLP.Utils.decodeOpReturn(tx)
            console.log('slpData: ', slpData)

            console.log('height: ', blockHeight)

            const txData = await this.bchjs.Transaction.get(tx)
            console.log('txData: ', txData)

            const dataToProcess = {
              slpData,
              blockHeight,
              txData
            }

            await this.processData(dataToProcess)
          } catch (err) {
            /* exit quietly */
            // console.log(err);
          }
          console.log(' ')
        }
      }
    } catch (err) {
      console.log('Error in indexer: ', err)
      // Don't throw an error. This is a top-level function.

      // For debugging purposes, exit if there is an error.
      process.exit(0)
    }
  }

  async processData (data) {
    try {
      const { slpData, txData } = data

      // For now, skip tokens that are not of type 1 (fungable SLP)
      if (slpData.tokenType !== 1) return

      console.log(`txData: ${JSON.stringify(txData, null, 2)}`)

      // Add the transaction to the database.
      await txDb.put(txData.txid, txData)

      if (slpData.txType.includes('GENESIS')) {
        await this.genesis.processTx(data)
        console.log(`Genesis tx processed: ${txData.txid}`)
      } else if (slpData.txType.includes('MINT')) {
        console.log('Mint tx')
      } else if (slpData.txType.includes('SEND')) {
        console.log('Send tx')
      }
    } catch (err) {
      console.error('Error in processData(): ', err)
      throw err
    }
  }
}

module.exports = SlpIndexer
