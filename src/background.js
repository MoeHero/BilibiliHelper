'use strict';
console.log('Start Loading...');
//TODO 重构
var Sign = {
    showID: false,
    tabID: false,
    getSign: () => Sign,
    setSign: function(options) {
        Sign.showID = options.showID;
        Sign.tabID = options.tabID;
    },
    delSign: function() {
        Sign.showID = false;
        Sign.tabID = false;
    }
};
var Treasure = {
    showID: false,
    tabID: false,
    getTreasure: () => Treasure,
    setTreasure: function(options) {
        Treasure.showID = options.showID;
        Treasure.tabID = options.tabID;
    },
    delTreasure: function() {
        Treasure.showID = false;
        Treasure.tabID = false;
    }
};
var SmallTV = {
    showID: false,
    tabID: false,
    getSmallTV: () => SmallTV,
    setSmallTV: function(options) {
        SmallTV.showID = options.showID;
        SmallTV.tabID = options.tabID;
    },
    delSmallTV: function() {
        SmallTV.showID = false;
        SmallTV.tabID = false;
    }
};
var Activity = {
    showID: false,
    tabID: false,
    getActivity: () => Activity,
    setActivity: function(options) {
        Activity.showID = options.showID;
        Activity.tabID = options.tabID;
    },
    delActivity: function() {
        Activity.showID = false;
        Activity.tabID = false;
    }
};

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
    window.localStorage.live_autoLighten !== undefined && delete window.localStorage.live_autoLighten;
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
        chrome.tabs.executeScript(tabId, {file: './resources/js/ocrad.min.js'});
        chrome.tabs.executeScript(tabId, {file: './resources/js/store.min.js'});
        chrome.tabs.executeScript(tabId, {file: './live.min.js'});
        console.log('Execute Script: ' + tabInfo.url);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.command) {
        case 'getSign':
            sendResponse(Sign.getSign());
            break;
        case 'setSign':
            Sign.setSign({tabID: sender.tab.id, showID: request.showID});
            break;
        case 'delSign':
            sendResponse(Sign.delSign());
            break;

        case 'getTreasure':
            sendResponse(Treasure.getTreasure());
            break;
        case 'setTreasure':
            Treasure.setTreasure({tabID: sender.tab.id, showID: request.showID});
            break;
        case 'delTreasure':
            sendResponse(Treasure.delTreasure());
            break;

        case 'getSmallTV':
            sendResponse(SmallTV.getSmallTV());
            break;
        case 'setSmallTV':
            SmallTV.setSmallTV({tabID: sender.tab.id, showID: request.showID});
            break;
        case 'delSmallTV':
            sendResponse(SmallTV.delSmallTV());
            break;

        case 'getActivity':
            sendResponse(Activity.getActivity());
            break;
        case 'setActivity':
            Activity.setActivity({tabID: sender.tab.id, showID: request.showID});
            break;
        case 'delActivity':
            sendResponse(Activity.delActivity());
            break;

        case 'getInfo':
            sendResponse(Info);
            break;
        case 'getOptions':
            sendResponse(Options);
            break;
        case 'createNotifications':
            createNotifications(request.param);
            break;
    }
});
chrome.runtime.onMessageExternal.addListener((request, sender) => chrome.tabs.sendMessage(sender.tab.id, request));

chrome.webRequest.onBeforeRequest.addListener((details) => {
    return {cancel: Options.live_autoTreasure && details.url.includes('getCurrentTask') && !details.url.endsWith('getCurrentTask?bh')};
}, {urls: ['*://live.bilibili.com/*']}, ['blocking']);

console.log('Loaded');
