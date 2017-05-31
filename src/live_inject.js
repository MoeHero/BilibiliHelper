/* globals extensionID */
'use strict';
//消息拦截
window._server_callback = window.server_callback;
window.server_callback = json => {
    window._server_callback(json);
    chrome.runtime.sendMessage(extensionID, json);
    if(json.cmd && json.cmd == 'SPECIAL_GIFT') {
        console.log(json);
    }
};
//打开礼物包裹
window.flash_giftPackageOpen = () => chrome.runtime.sendMessage(extensionID, {command: 'openGiftPackage'});

function bh_sendGift_package(giftID, number, bagID, key) {
    window.avalon.vmodels.giftPackageCtrl.$fire('all!sendGift', {
        type: 'package',
        data: {
            giftId: giftID,
            num: number,
            coinType: 'silver',
            bagId: bagID
        },
        callback: result => {
            result.gift = {giftID: giftID, key: key};
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

function bh_getDanmuInfo() {
    let _danmuInfo = window.avalon.vmodels.chatCtrlPanelCtrl.danmuColor;
    let danmuInfo = {
        selectColor: _danmuInfo.selectColor,
        selectMode: _danmuInfo.selectMode
    };
    chrome.runtime.sendMessage(extensionID, {command: 'getDanmuInfo', danmuInfo: danmuInfo});
}
function bh_sendDanmu(danmu, color, mode) {
    window.LivePlayer && window.LivePlayer(danmu, color, mode);
}
console.log('%c直播间脚本注入成功~', 'color:#FFF;background-color:#57D2F7;padding:5px;border-radius:7px;line-height:30px;');
