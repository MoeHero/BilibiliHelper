/* globals extensionID */
window._server_callback = window.server_callback;
window.server_callback = function(json) {
    chrome.runtime.sendMessage(extensionID, json);
    window._server_callback(json);
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
