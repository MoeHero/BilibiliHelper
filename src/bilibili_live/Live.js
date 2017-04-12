/* globals store */
var Live = {options: {}, userInfo: {}};
Live.showID = function() {
    return location.pathname.substr(1);
}();
Live.addScriptByFile = function(fileName) {
    var script = document.createElement('script');
    script.src = chrome.extension.getURL(fileName);
    document.head.appendChild(script);
};
Live.addScriptByText = function(text) {
    var script = document.createElement('script');
    script.innerHTML = text;
    document.head.appendChild(script);
};
Live.addStylesheetByFile = function(fileName) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.extension.getURL(fileName);
    document.head.appendChild(link);
};
Live.getRoomID = function(showID, callback) {
    var rid = Live.store.roomID.get(showID);
    if(!rid) {
        $.get('/' + showID).done(function(result) {
            var reg = new RegExp('var ROOMID = ([\\d]+)');
            rid = reg.exec(result)[1] || 0;
            if(rid) {
                Live.store.roomID.add(showID, rid);
            }
        });
    }
    typeof callback == 'function' && callback(rid);
};
Live.getRoomInfo = function(roomID, callback) {
    var roomInfo = {};
    $.getJSON('/live/getInfo?roomid=' + roomID).done(function(result) {
        if(result.code === 0) {
            roomInfo.nickname = result.data.ANCHOR_NICK_NAME;
        }
    });
    typeof callback == 'function' && callback(roomInfo);
};
Live.getUserInfo = function(callback) {
    $.getJSON('/user/getuserinfo').done(function(result) {
        if(result.code == 'REPONSE_OK') {
            Live.userInfo.vip = result.data.vip || result.data.svip;
            $.getJSON('//space.bilibili.com/ajax/member/MyInfo').done(function(result) {
                if(result.status == 'true') {
                    Live.userInfo.mobileVerified = result.data.mobile_verified;
                }
            });
        }
    });
    typeof callback == 'function' && callback();
};
Live.init = function(callback) {
    var init = 0;
    Live.store.init();
    Live.getRoomID(Live.showID, function() {
        Live.roomID = store.get('BH_RoomID')[Live.showID];
        init++;
    });
    Live.getRoomInfo(Live.roomID, function(roomInfo) {
        Live.roomInfo = roomInfo;
        init++;
    });
    Live.getUserInfo(function() {
        init++;
    });
    Live.sendMessage({command: 'getOption'}, function(result) {
        Live.option = result;
        init++;
    });
    var interval = setInterval(function() {
        if(init == 4) {
            Live.dom.init();
            typeof callback == 'function' && callback();
            clearInterval(interval);
        }
    }, 100);
};
