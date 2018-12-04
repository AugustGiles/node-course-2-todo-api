const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

let message = 'this is a strings'
let hash = SHA256(message).toString();
// hashing is a one way algorithm that will always produce the same result given the same value
// the hash is what is stored in the db, and we will actively hash a password given on login to compare to the db
console.log(hash)

// this is what JWT's are for!

// let data = {
//   id: 4
// };
// let token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
//
// let resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString()
//
// if (resultHash === token.hash) {
//   console.log('Data was not changed')
// } else {
//   console.log('Data was changed. Do no trust.')
// }

// ==========================================
// JWTS
// takes data and makes hash returning token
  // jwt.sign
// takes token and secrett, makes sure it wasn't tampered with
  // jwt.verify

let data = {
  id: 10
}

// this is what we send when user signs in
let token = jwt.sign(data, '123abc')
console.log(token)

let decoded = jwt.verify(token, '123abc')
console.log(decoded)
