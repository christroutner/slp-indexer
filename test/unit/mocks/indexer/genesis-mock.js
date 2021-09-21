/*
  Mock data for unit tests. This data focuses on Genesis data.
*/

const BigNumber = require('bignumber.js')

const genesisParse = {
  tokenType: 1,
  txType: 'GENESIS',
  ticker: '',
  name: '',
  tokenId: '545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4',
  documentUri: '',
  documentHash: '',
  decimals: 0,
  mintBatonVout: 2,
  qty: new BigNumber({ s: 1, e: 6, c: [1000000] })
}

const genesisTx = {
  txid: '545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4',
  hash: '545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4',
  version: 1,
  size: 305,
  locktime: 543375,
  vin: [
    {
      txid: 'aa39a17013626c1915f0cb3dd3df23fc8af6db19627c25b5e75b91477428d409',
      vout: 0,
      scriptSig: {
        asm: '304402203767bb87ee6af22e2874b4a2ff8335e9940199fdcaed87d153727ccd96e7561d0220577627e12a1d89e156e995bc2757c5274b22ac2ba40f8881a7d37dac58dad65b[ALL|FORKID] 02a86167c6336394e792b99b1de782a1349e96cc5745d3cf0b7e8337c152144b8e',
        hex: '47304402203767bb87ee6af22e2874b4a2ff8335e9940199fdcaed87d153727ccd96e7561d0220577627e12a1d89e156e995bc2757c5274b22ac2ba40f8881a7d37dac58dad65b412102a86167c6336394e792b99b1de782a1349e96cc5745d3cf0b7e8337c152144b8e'
      },
      sequence: 4294967294,
      address: 'bitcoincash:qzdgvkett8qvu598wvc8rqa3fpcpmcr6lu7mhuu5cj',
      value: 0.00177204
    }
  ],
  vout: [
    {
      value: 0,
      n: 0,
      scriptPubKey: {
        asm: 'OP_RETURN 5262419 1 47454e45534953 0 0 0 0 0 2 00000000000f4240',
        hex: '6a04534c500001010747454e455349534c004c004c004c00010001020800000000000f4240',
        type: 'nulldata'
      }
    },
    {
      value: 0.00000546,
      n: 1,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 ac16ddc733b2a329abf6c0b33a430a67f1e3f670 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914ac16ddc733b2a329abf6c0b33a430a67f1e3f67088ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['bitcoincash:qzkpdhw8xwe2x2dt7mqtxwjrpfnlrclkwqqv5nmx6e']
      }
    },
    {
      value: 0.00000546,
      n: 2,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 ac16ddc733b2a329abf6c0b33a430a67f1e3f670 OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914ac16ddc733b2a329abf6c0b33a430a67f1e3f67088ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['bitcoincash:qzkpdhw8xwe2x2dt7mqtxwjrpfnlrclkwqqv5nmx6e']
      }
    },
    {
      value: 0.00175806,
      n: 3,
      scriptPubKey: {
        asm: 'OP_DUP OP_HASH160 def596594a003253eded011084ea20456c2eb0ae OP_EQUALVERIFY OP_CHECKSIG',
        hex: '76a914def596594a003253eded011084ea20456c2eb0ae88ac',
        reqSigs: 1,
        type: 'pubkeyhash',
        addresses: ['bitcoincash:qr00t9jefgqry5lda5q3pp82ypzkct4s4c08s46x2t']
      }
    }
  ],
  hex: '010000000109d4287447915be7b5257c6219dbf68afc23dfd33dcbf015196c621370a139aa000000006a47304402203767bb87ee6af22e2874b4a2ff8335e9940199fdcaed87d153727ccd96e7561d0220577627e12a1d89e156e995bc2757c5274b22ac2ba40f8881a7d37dac58dad65b412102a86167c6336394e792b99b1de782a1349e96cc5745d3cf0b7e8337c152144b8efeffffff040000000000000000256a04534c500001010747454e455349534c004c004c004c00010001020800000000000f424022020000000000001976a914ac16ddc733b2a329abf6c0b33a430a67f1e3f67088ac22020000000000001976a914ac16ddc733b2a329abf6c0b33a430a67f1e3f67088acbeae0200000000001976a914def596594a003253eded011084ea20456c2eb0ae88ac8f4a0800',
  blockhash: '000000000000000000bb8ecc62498a9b3c13daa584f22764f349340d541c558f',
  confirmations: 162958,
  time: 1534254136,
  blocktime: 1534254136,
  isValidSLPTx: false,
  tokenTxType: 'GENESIS',
  tokenId: '545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4',
  tokenTicker: '',
  tokenName: '',
  tokenDecimals: 0,
  tokenUri: '',
  tokenDocHash: ''
}

const mockAddr = {
  utxos: [
    {
      txid: '545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4',
      vout: 1
    }
  ],
  txs: ['545cba6f72a08cbcb08c7d4e8166267942e8cb9a611328805c62fa538e861ba4']
}

module.exports = {
  genesisParse,
  genesisTx,
  mockAddr
}
