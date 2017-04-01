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

var Options = {};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
    if (changeInfo.status == 'complete' &&
        tabInfo.status == 'complete' &&
        tabInfo.url.indexOf('live.bilibili.com') != -1) {
        chrome.tabs.executeScript(tabId, {'file': './jquery-3.1.1.min.js'});
        chrome.tabs.executeScript(tabId, {'file': './ocrad.min.js'});
        chrome.tabs.executeScript(tabId, {'file': './store.min.js'});
        chrome.tabs.executeScript(tabId, {'file': './bilibili_live.min.js'});
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
    case 'getOptions':
        sendResponse(Options);
        break;
    }
});

chrome.runtime.onMessageExternal.addListener(function(request, sender) {
    chrome.tabs.sendMessage(sender.tab.id, request);
});

$.getJSON('version.json').promise().done(function(result) {
    Options.buildNumber = result.buildnumber;
    Options.extensionID = chrome.i18n.getMessage('@@extension_id');
    Options.version = chrome.runtime.getManifest().version;
});

console.log('Loaded');
