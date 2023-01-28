export const Lang = {
    en: {
        loadingTitle: 'Log in with Ledger',
        loadingTip0: 'Please connect to your Ledger device and open “Tron” App.',
        loadingTip4: 'Preparing your Ledger device...',

        checkTitle: 'Please check if the address below is the same one shown on your Ledger device',
        checkTip0: 'If it is: press “Approve” button to confirm the address',
        checkTip1: "If it isn't: select “Reject” on your Ledger device and refresh this page",
        confirmTip: 'Please confirm on your Ledger',

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

        checkTitle: '请确认以下地址与 Ledger 设备显示地址一致',
        checkTip0: '如果一致：请按设备上的 Approve 按钮进行确认',
        checkTip1: '如果不一致：请在 Ledger 设备中选择 Reject 按钮并刷新本页面',
        confirmTip: '请在 Ledger 上确认',

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
