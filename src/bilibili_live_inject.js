/* globals extensionID */
//消息拦截
window._server_callback = window.server_callback;
window.server_callback = function(json) {
    window._server_callback(json);
    chrome.runtime.sendMessage(extensionID, json);
    if(json.cmd && json.cmd == 'SPECIAL_GIFT') {
        console.log(json);
    }
};
//打开礼物包裹
window.flash_giftPackageOpen = () => chrome.runtime.sendMessage(extensionID, {command: 'openGiftPackage'});

function bh_sendGift(giftID, number, bagID) {
    window.avalon.vmodels.giftPackageCtrl.$fire('all!sendGift', {
        type: 'package',
        data: {
            giftId: giftID,
            num: number,
            coinType: 'gold',
            bagId: bagID
        },
        callback: function(result) {
            chrome.runtime.sendMessage(extensionID, {command: 'sendGiftCallback', result: result});
        }
    });
}
function bh_updateSilverSeed(number) {
    window.avalon.vmodels.giftCtrl.$fire('all!updateCurrency', {silver: number});
}
function bh_setSigned() {
    window.avalon.vmodels.signUpCtrl.$fire('all!roomDoSign');
}
