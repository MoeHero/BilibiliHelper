console.log('Start Loading...');

var Treasure = {
    showID: false,
    tabID: false,
    getTreasure: function() {
        return Treasure;
    },
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
    getSmallTV: function() {
        return SmallTV;
    },
    setSmallTV: function(options) {
        SmallTV.showID = options.showID;
        SmallTV.tabID = options.tabID;
    },
    delSmallTV: function() {
        SmallTV.showID = false;
        SmallTV.tabID = false;
    }
};
var Lighten = {
    showID: false,
    tabID: false,
    getLighten: function() {
        return Lighten;
    },
    setLighten: function(options) {
        Lighten.showID = options.showID;
        Lighten.tabID = options.tabID;
    },
    delLighten: function() {
        Lighten.showID = false;
        Lighten.tabID = false;
    }
};
var Option = {
    live_autoSign: true,
    live_autoTreasure: true,
    live_autoSmallTV: true,
    live_giftPackage: true,
    live_liveSetting: true,
    live_lighten: true,
    live: true,
    notify_autoSign: true,
    notify_autoTreasure: true,
    notify_autoSmallTV: true,
    notify_autoLighten: true,
    notify: true,
};
var Info = {
    version: chrome.runtime.getManifest().version,
    extensionID: chrome.i18n.getMessage('@@extension_id')
};

function saveOption() {
    window.localStorage.bh_option = JSON.stringify(Option);
}
function createNotifications(param) {
    chrome.notifications.create('bh-' + param.id, {
        type: 'basic',
        iconUrl: 'resources/' + (param.icon || 'icon.png'),
        title: param.title,
        message: param.message
    });
}

if(window.localStorage.bh_option) {
    $.extend(Option, JSON.parse(window.localStorage.bh_option));
}
saveOption();

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    if(changeInfo.status == 'complete' &&
        tabInfo.status == 'complete' &&
        tabInfo.url.includes('live.bilibili.com')) {
        chrome.tabs.executeScript(tabId, {file: './jquery-3.1.1.min.js'});
        chrome.tabs.executeScript(tabId, {file: './ocrad.min.js'});
        chrome.tabs.executeScript(tabId, {file: './store.min.js'});
        chrome.tabs.executeScript(tabId, {file: './bilibili_live.min.js'});
        console.log('Execute Script: ' + tabInfo.url);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.command) {
        case 'getTreasure':
            sendResponse(Treasure.getTreasure());
            break;
        case 'setTreasure':
            Treasure.setTreasure({tabID: sender.tab.id, showID: request.showID});
            break;
        case 'delTreasure':
            sendResponse(Treasure.delTreasure());
            break;
        case 'checkNewTask':
            chrome.tabs.sendMessage(Treasure.tabID, {command: 'checkNewTask'});
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

        case 'getLighten':
            sendResponse(Lighten.getLighten());
            break;
        case 'setLighten':
            Lighten.setLighten({tabID: sender.tab.id, showID: request.showID});
            break;
        case 'delLighten':
            sendResponse(Lighten.delLighten());
            break;

        case 'getInfo':
            sendResponse(Info);
            break;
        case 'getOption':
            sendResponse(Option);
            break;
        case 'createNotifications':
            createNotifications(request.param);
            break;
    }
});
chrome.runtime.onMessageExternal.addListener(function(request, sender) {
    chrome.tabs.sendMessage(sender.tab.id, request);
});

chrome.webRequest.onBeforeRequest.addListener(function(details) {
    return {cancel: Option.live_autoTreasure && details.url.includes('getCurrentTask') && !details.url.endsWith('getCurrentTask?bh')};
}, {urls: ['*://live.bilibili.com/*']}, ['blocking']);

console.log('Loaded');
