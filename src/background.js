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
var Option = {
    live_autoSign: true,
    live_autoTreasure: true,
    live_autoSmallTV: true,
    live_giftPackage: true,
    live: true,
    notify_autoSign: true,
    notify_autoTreasure: true,
    notify_autoSmallTV: true,
    notify: true,
};
var Info = {};

function saveOption() {
    window.localStorage.bh_option = JSON.stringify(Option);
}
function createNotifications(param) {
    chrome.notifications.create('bh-' + param.id, {
        type: 'basic',
        iconUrl: 'icon.png',
        title: param.title,
        message: param.message
    }, function(id) {
        if(param.timeout > 0) {
            setTimeout(function() {
                chrome.notifications.clear(id);
            }, param.timeout);
        }
    });
}
function addScriptByText(text) {
    let script = document.createElement('script');
    script.innerHTML = text;
    document.head.appendChild(script);
}

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

Info.version = chrome.runtime.getManifest().version;
Info.extensionID = chrome.i18n.getMessage('@@extension_id');

if(window.localStorage.bh_option) {
    Option = JSON.parse(window.localStorage.bh_option);
} else {
    saveOption();
}

console.log('Loaded');
