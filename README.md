# slp-indexer

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

This is a prototype SLP indexer using LevelDB to store the data.

## Current State of Development

The indexer currently indexes GENESIS and SEND transactions. These libraries are available in the [src/adapters/indexer](./src/adapters/indexer) folder, and their are unit tests for all the libraries.

Next development steps would be:

- Add indexing for MINT transactions.
- Then the indexer simply needs to run until it runs into issues, and each new issue should lead to a cycle of refactoring and unit test writing.

## Architecture

This indexer leverages [bch-js](https://github.com/Permissionless-Software-Foundation/bch-js), which in turn leverages the [slp-parser](https://www.npmjs.com/package/slp-parser), for the indexing. To run the indexer, you should have a fully-synced BCHN full node, and [bch-api](https://github.com/Permissionless-Software-Foundation/bch-api) configured to talk to it.

The data is stored in four different [LevelDB](https://www.npmjs.com/package/level) databases (indexes):

- Address database - Tracks UTXOs, balances, and transaction history for each address.
- Transaction database - Retains a copy of the hydrated transactions used in the indexing.
- Token - Tracks stats on each token.
- Status - Tracks the syncing status of the app.

As the app crawls each transaction in each block, it updates the above databases. This key-value lookup is **much** more performant than SLPDB.
