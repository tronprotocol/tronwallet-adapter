export const Lang = {
    en: {
        loadingTitle: 'Log in with Ledger',
        loadingTip0: 'Please connect to your Ledger device and open “Tron” App.',
        loadingTip4: 'Preparing your Ledger device...',

        selectTitle: 'Select account',
        selectTip: 'Please select an account to use',

        cancel: 'Cancel',
        confirm: 'Confirm',

        address: 'Address',
        balance: 'Available Balance',
        loadMore: 'Load More',
    },
    'zh-CN': {
        loadingTitle: 'Ledger 登录',
        loadingTip0: '请连接 Ledger 设备，并在设备上进入 “TRON” 应用',
        loadingTip4: 'Ledger 设备准备中...',

        selectTitle: '选择账户',
        selectTip: '请选择要使用的钱包账户',

        cancel: '取消',
        confirm: '确认',

        address: '地址',
        balance: '可用余额',
        loadMore: '加载更多账户',
    },
};

export function getLangText() {
    if (globalThis.navigator.language.includes('zh')) {
        return Lang['zh-CN'];
    }
    return Lang.en;
}
