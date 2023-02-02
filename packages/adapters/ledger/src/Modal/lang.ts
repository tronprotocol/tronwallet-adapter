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
        loadingTip4: 'Ledger 设备准备中......',

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
    'zh-TC': {
        loadingTitle: 'Ledger 登錄',
        loadingTip0: '請連接 Ledger 設備，並在設備上進入 “TRON” 應用',
        loadingTip4: 'Ledger 設備準備中......',

        checkTitle: '請確認以下地址與 Ledger 設備顯示地址一致',
        checkTip0: '如果一致：請按設備上的 Approve 按鈕進行確認',
        checkTip1: '如果不一致：請在 Ledger 設備中選擇 Reject 按鈕並刷新本頁面',
        confirmTip: '請在 Ledger 上確認',

        selectTitle: '選擇賬戶',
        selectTip: '請選擇要使用的錢包賬戶',

        cancel: '取消',
        confirm: '確認',

        address: '地址',
        balance: '可用餘額',
        loadMore: '加載更多賬戶',
    },
};
export function getLangText() {
    const searchParams = new URLSearchParams(globalThis.location.search);
    const searchParamsLang = searchParams.get('lang') as keyof typeof Lang;
    const storageSettingLang = globalThis.localStorage.getItem('lang') as keyof typeof Lang;
    const appLang = (searchParamsLang || storageSettingLang || '').toLowerCase();
    const browserSettingLang = (globalThis.navigator.language || '').toLowerCase();
    let browserLang;
    if (['zh-tw', 'zh-hk', 'zh-tc'].includes(browserSettingLang)) {
        browserLang = Lang['zh-TC'];
    } else if (['zh', 'zh-cn'].includes(browserSettingLang)) {
        browserLang = Lang['zh-CN'];
    } else if (browserSettingLang.includes('en')) {
        browserLang = Lang['en'];
    }

    let lang = browserLang;
    if (appLang) {
        if (['zh-tw', 'zh-hk', 'zh-tc'].includes(appLang)) {
            lang = Lang['zh-TC'];
        } else if (['zh', 'zh-cn'].includes(appLang)) {
            lang = Lang['zh-CN'];
        } else if (appLang.includes('en')) {
            lang = Lang.en;
        }
    }
    return lang || Lang.en;
}
