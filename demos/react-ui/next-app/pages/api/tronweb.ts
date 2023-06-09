// @ts-ignore
import TronWeb from 'tronweb';
export const tronWeb: any = new TronWeb({
    fullHost: 'https://api.nileex.io',
});
if (typeof window !== 'undefined') {
    (window as any).tronWeb1 = tronWeb;
}
