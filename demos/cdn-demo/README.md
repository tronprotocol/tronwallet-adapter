# TronWallet CND Demo
This project shows how to use Tronwallet Adapter with vanilla js.

## Usage
1. Installation
First you should install the npm package to use the `umd` format file:
```bash
npm i @tronweb3/tronwallet-adapters
```

2. Add script in your HTML file
Put the script in your `head` tag:
```html
<script src="../node_modules/@tronweb3/tronwallet-adapters/lib/umd/index.js"></script>
```

**Note**: You should adjust the relative path according to the position of your HTML file.

3. Get specified adapter
```js
const { TronLinkAdapter, BitKeepAdapter, WalletConnectAdapter, OkxWalletAdapter } = window['@tronweb3/tronwallet-adapters'];
const tronlinkAdapter = new TronLinkAdapter({
    openTronLinkAppOnMobile: true,
    openUrlWhenWalletNotFound: false,
    checkTimeout: 3000,
});
```

Please refer [here](https://developers.tron.network/docs/tronwallet-adapter) for more detailed documentation.

## WalletConnectAdapter
If you want to use `WalletConnectAdapter`, you should install another dependency in addition:
```bash
npm i @walletconnect/sign-client
```

And add a script tag for `@walletconnect/sign-client`:
```diff
+ <script src="../node_modules/@walletconnect/sign-client/dist/index.umd.js"></script>
<script src="../node_modules/@tronweb3/tronwallet-adapters/lib/umd/index.js"></script>
```