const { SHA256 } = require('crypto-js');

// npm that will assist with authentication for calls to the db
const jwt = require('jsonwebtoken');

// npm that will hash passwords on our server
const bcrypt = require('bcryptjs');

// =======  BCRYPT TESTING  =====================================

let password = '123abc!';

// run this on creation of user to create their hash to store in db
// genSalt() generates a random string (salt) that will help make the hash more secure
bcrypt.genSalt(10, (err, salt)=> {
  // hash() takes the password and the generated salt to make the hash
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash)
  })
})

let hashedPassword = '$2a$10$HKJOu8CCc3FieVD3OrOPV.kfrJyOJmU3aXecx8WMBBwN6oswpitg2'

// compare() takes the plain text password with the hashed password (stored in db), and returns true or false if it's the correct password
// run this on login to compare hash with given password
bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res)
})


// ======  Learning about hashes and stuff  =================================

// let message = 'this is a strings'
// let hash = SHA256(message).toString();
// // hashing is a one way algorithm that will always produce the same result given the same value
// // the hash is what is stored in the db, and we will actively hash a password given on login to compare to the db
// console.log(hash)

// =======  Learning about authentication and stuff  =============

// // this is what JWT's are for!
//
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

// ======  JWT TESTING  ====================================

// // takes data and makes hash returning token
// //   jwt.sign
// // takes token and secrett, makes sure it wasn't tampered with
// //   jwt.verify
//
// let data = {
//   id: 10
// }
//
// // this is what we send when user signs in
// let token = jwt.sign(data, '123abc')
// console.log(token)
//
// let decoded = jwt.verify(token, '123abc')
// console.log(decoded)
