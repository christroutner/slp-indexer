/*
  Main class library for the SLP indexing functionality.
*/

const level = require('level')
// const BCHJS = require('@psf/bch-js')
// const BigNumber = require('bignumber.js')

const dirName = `${__dirname.toString()}/../../../leveldb/addrs`
console.log(dirName)

const addrDb = level(dirName, { valueEncoding: 'json' })

// const txDb = level('../../../leveldb/txs', { valueEncoding: 'json' })
// const tokenDb = level('../../../leveldb/tokens', { valueEncoding: 'json' })

class SlpIndexer {
  async start () {
    try {
      console.log('starting indexer...')
      await addrDb.put('animal', { type: 'grizzly' })
    } catch (err) {
      console.log('Error in indexer: ', err)
      // Don't throw an error. This is a top-level function.
    }
  }
}

module.exports = SlpIndexer
