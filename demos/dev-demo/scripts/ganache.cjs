const ganache = require('ganache');

require('dotenv').config({});

const options = {
  fork: process.env.INFURA_PROJECT_ID
    ? { url: `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}` }
    : 'mainnet',
  chain: {
    // hardfork: 'berlin',
  },
};
options.wallet = {
  mnemonic:
    'shove comic where catch muscle impulse that fork plunge robust noise subject',
};
const server = ganache.server(options);
const PORT = 8545;

server.listen(PORT, async (err) => {
  if (err) throw err;

  console.log(`ganache listening on port ${PORT}...`);
  console.log('accounts created');
  const provider = server.provider;

  if (process.env.MNEMONIC_PHRASE) {
    const accounts = await provider.request({
      method: 'eth_accounts',
      params: [],
    });
    console.log(accounts);
  } else {
    console.log(`mnemonic used: ${provider.getOptions().wallet?.mnemonic}`);
    console.log(provider.getInitialAccounts());
  }
});
