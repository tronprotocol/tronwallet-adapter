// @ts-ignore
import TronWeb from 'tronweb';

export const tronWeb: any = new TronWeb({
    fullHost: 'https://api.nileex.io',
    // fullHost: 'https://api.trongrid.io'
});
(window as any).tronWeb1 = tronWeb;
