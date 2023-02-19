// Configurer Truffle et les réseaux de déploiement ntm

const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();


module.exports = {


  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
     goerli: {
      provider: function(){ 
        return new HDWalletProvider(`${process.env.MNEMONIC}`,`https://goerli.infura.io/v3/${process.env.INFURA_ID}`)},
        network_id:5,
     },
     mumbai : {
      provider: function() {
        return new HDWalletProvider(`${process.env.MNEMONIC}`,`https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_ID}`)},
        network_id : 80001,
      },
     },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.17",      // Fetch exact version from solc-bin (default: truffle's version)
       settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 200
       },
        evmVersion: "byzantium"
       }
    }
  },
};
