/* globals store */
var Live = {options: {}, userInfo: {}};
Live.showID = (function() {
    return location.pathname.substr(1);
}());
Live.start = function(callback) {
    var init = 0;
    Live.store.init();
    Live.dom.init();
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
            typeof callback == 'function' && callback();
            clearInterval(interval);
        }
    }, 100);
};
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
Live.getRoomHTML = function(showID) {
    return $.get('/' + showID);
};
Live.getRoomID = function(showID, callback) {
    var rid = Live.store.roomID.get(showID);
    if(rid) {
        typeof callback == 'function' && callback(rid);
    } else {
        Live.getRoomHTML(showID).done(function(result) {
            var reg = new RegExp('var ROOMID = ([\\d]+)');
            rid = reg.exec(result)[1] || 0;
            if(rid) {
                Live.store.roomID.add(showID, rid);
                typeof callback == 'function' && callback(rid);
            } else {
                typeof callback == 'function' && callback(0);
            }
        });
    }
};
Live.getRoomInfo = function(roomID, callback) {
    $.getJSON('/live/getInfo?roomid=' + roomID).done(function(result) {
        var roomInfo = {};
        if(result.code === 0) {
            result = result.data;
            roomInfo.nickname = result.ANCHOR_NICK_NAME;
            typeof callback == 'function' && callback(roomInfo);
        } else {
            typeof callback == 'function' && callback({});
        }
    });
};
Live.getUserInfo = function(callback) {
    $.getJSON('/user/getuserinfo').done(function(result) {
        if(result.code == 'REPONSE_OK') {
            result = result.data;
            Live.userInfo.vip = result.vip || result.svip;
            $.getJSON('//space.bilibili.com/ajax/member/MyInfo').done(function(result) {
                if(result.status == 'true') {
                    result = result.data;
                    Live.userInfo.mobile_verified = result.mobile_verified;
                }
            });
        }
    });
    typeof callback == 'function' && callback();
};
