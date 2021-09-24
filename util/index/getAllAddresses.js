/*
  Utility tool to retrieve all token keys in the token DB.
*/

const level = require('level')

const addrDb = level(`${__dirname.toString()}/../../leveldb/addrs`, {
  valueEncoding: 'json'
})

async function getAddrs () {
  try {
    const stream = addrDb.createReadStream()

    stream.on('data', function (data) {
      console.log(data.key, ' = ', data.value)
    })
  } catch (err) {
    console.error(err)
  }
}
getAddrs()
