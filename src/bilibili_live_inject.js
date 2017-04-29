/* globals extensionID */
//消息拦截
window._server_callback = window.server_callback;
window.server_callback = function(json) {
    window._server_callback(json);
    chrome.runtime.sendMessage(extensionID, json);
};
//打开礼物包裹
window._flash_giftPackageOpen = window.flash_giftPackageOpen;
window.flash_giftPackageOpen = function() {
    window._flash_giftPackageOpen();
    chrome.runtime.sendMessage(extensionID, {command: 'openGiftPackage'});
};

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
