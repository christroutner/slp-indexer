/*
  Main class library for the SLP indexing functionality.
*/

class SlpIndexer {
  async start () {
    try {
      console.log('starting indexer...')
    } catch (err) {
      console.log('Error in indexer: ', err)
      // Don't throw an error. This is a top-level function.
    }
  }
}

module.exports = SlpIndexer
