'use strict';
console.log('Start Loading...');

class RoomInfo {
    constructor() {
        this.showID = false;
        this.tabID = false;
    }

    get() {
        return this;
    }
    set(showID, tabID) {
        this.showID = showID;
        this.tabID = tabID;
    }
    del() {
        this.showID = false;
        this.tabID = false;
    }
}
var Sign = new RoomInfo();
var Treasure = new RoomInfo();
var SmallTV = new RoomInfo();
var Activity = new RoomInfo();

var Options = {
    idle_treasureOn: false,
    live_autoSign: true,
    live_autoTreasure: true,
    live_autoSmallTV: true,
    live_autoActivity: true,
    live_giftPackage: true,
    live_danmuEnhance: true,
    live_hideSetting_gift: true,
    live_hideSetting_vip: true,
    live_hideSetting_sysmsg: true,
    live_hideSetting_tvmsg: true,
    live_hideSetting_link: true,
    live_hideSetting_combo: true,
    live_hideSetting_title: true,
    live_hideSetting_medal: true,
    live_hideSetting_level: true,
    live_hideSetting_chat: true,
    live_hideSetting_vipicon: true,
    live_hideSetting_guardicon: true,
    live_hideSetting_adminicon: true,
    live_hideSetting_guardmsg: true,
    live_hideSetting_ad: true,
    live_hideSetting: true,
    live: true,

    notify_autoSign_enabled: true,
    notify_autoSign_end: true,
    notify_autoSign: true,
    notify_autoTreasure_enabled: true,
    notify_autoTreasure_award: true,
    notify_autoTreasure_end: true,
    notify_autoTreasure: true,
    notify_autoSmallTV_enabled: true,
    notify_autoSmallTV_award_1: true,
    notify_autoSmallTV_award_2: true,
    notify_autoSmallTV_award_3: true,
    notify_autoSmallTV_award_4: true,
    notify_autoSmallTV_award_5: true,
    notify_autoSmallTV_award_6: true,
    notify_autoSmallTV_award_7: true,
    notify_autoSmallTV_award: true,
    notify_autoSmallTV: true,
    notify_autoActivity_award: true,
    notify_autoActivity_enabled: true,
    notify_autoActivity: true,
    notify: true
};
var Info = {
    version: chrome.runtime.getManifest().version,
    extensionID: chrome.i18n.getMessage('@@extension_id')
};

function saveOptions() {
    window.localStorage.bh_option = JSON.stringify(Options);
}
function createNotifications(param) {
    let xhr = new XMLHttpRequest();
    xhr.open('get', param.icon);
    xhr.responseType = 'blob';
    xhr.onload = function() {
        if (this.status == 200) {
            chrome.notifications.create('bh-' + param.id, {
                type: 'basic',
                iconUrl: window.URL.createObjectURL(this.response),
                title: param.title,
                message: param.message
            });
        }
    };
    xhr.send();
}

if(window.localStorage.bh_option) {
    $.extend(Options, JSON.parse(window.localStorage.bh_option));
}
saveOptions();

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if(changeInfo.status == 'complete' &&
        tabInfo.status == 'complete' &&
        tabInfo.url.includes('live.bilibili.com')) {
        chrome.tabs.executeScript(tabId, {file: './resources/js/jquery-3.1.1.min.js'});
        chrome.tabs.executeScript(tabId, {file: './resources/js/store.min.js'});
        chrome.tabs.executeScript(tabId, {file: './live.min.js'});
        console.log('Execute Script: ' + tabInfo.url);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.cmd) {
        case 'getInfo':
            sendResponse(Info);
            break;
        case 'getOptions':
            sendResponse(Options);
            break;
        case 'createNotifications':
            createNotifications(request.param);
            break;

        case 'get':
            sendResponse(eval(request.type + '.get()')); //jshint ignore:line
            break;
        case 'set':
            eval(request.type + '.set(' + request.showID + ',' + sender.tab.id + ')'); //jshint ignore:line
            break;
        case 'del':
            eval(request.type + '.del()'); //jshint ignore:line
            break;
    }
});
chrome.runtime.onMessageExternal.addListener((request, sender) => chrome.tabs.sendMessage(sender.tab.id, request));

// chrome.webRequest.onBeforeRequest.addListener((details) => {
//     return {cancel: (Options.live_autoTreasure || Options.idle_treasureOn) && details.url.includes('getCurrentTask') && !details.url.endsWith('bh')};
// }, {urls: ['*://*.bilibili.com/*']}, ['blocking']);

console.log('Loaded');
