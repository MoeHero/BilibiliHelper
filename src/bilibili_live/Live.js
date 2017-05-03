/* globals ModuleStore,ModuleNotify */
var Live = {options: {}, userInfo: {}, DOM: {}};
Live.showID = (function() {
    return location.pathname.substr(1);
}());
Live.addScriptByFile = function(fileName) {
    let script = $('<script>').attr('src', chrome.extension.getURL(fileName));
    $('head').append(script);
    return script;
};
Live.addScriptByText = function(text) {
    let script = $('<script>').text(text);
    $('head').append(script);
    return script;
};
Live.addStylesheetByFile = function(fileName) {
    let link = $('<link>').attr('rel', 'stylesheet').attr('href', chrome.extension.getURL(fileName));
    $('head').append(link);
    return link;
};
Live.addStylesheetByText = function(text) {
    let style = $('<style>').attr('type', 'text/css').text(text);
    $('head').append(style);
    return style;
};
Live.getRoomID = function(showID, callback) {
    let rid = ModuleStore.roomID_get(showID);
    if(!rid) {
        $.get('/' + showID).done((result) => {
            let reg = new RegExp('var ROOMID = ([\\d]+)');
            rid = reg.exec(result)[1] || 0;
            ModuleStore.roomID_add(showID, rid);
            typeof callback == 'function' && callback(rid);
        });
    } else {
        typeof callback == 'function' && callback(rid);
    }
};
/*Live.getRoomInfo = function(roomID, callback) {
    let roomInfo = {};
    $.getJSON('/live/getInfo?roomid=' + roomID).done((result) => {
        if(result.code === 0) {
            roomInfo.nickname = result.data.ANCHOR_NICK_NAME;
        }
        typeof callback == 'function' && callback(roomInfo);
    });
};*/
/*Live.getUserInfo = function(callback) {
    $.getJSON('/user/getuserinfo').done((result) => {
        if(result.code == 'REPONSE_OK') {
            Live.userInfo.vip = result.data.vip || result.data.svip;
        }
    }).then(() => $.getJSON('//space.bilibili.com/ajax/member/MyInfo').done((result) => {
        if(result.status === true) {
            Live.userInfo.mobileVerified = result.data.mobile_verified;
        }
        typeof callback == 'function' && callback();
    }));
};*/
Live.init = function(callback) {
    ModuleStore.init();
    Live.getRoomID(Live.showID, (roomID) => {
        Live.roomID = roomID;

        /*Live.getRoomInfo(Live.roomID, (roomInfo) => {
            Live.roomInfo = roomInfo;
            init++;
        });*/
        Live.sendMessage({command: 'getOption'}, (result) => {
            Live.option = result;

            {
                Live.DOM.info = $('<div>').addClass('seeds-buy-cntr');
                let bhInfo = $('<div>').addClass('ctrl-item')
                    .html(`${Live.localize.helper} V${Live.info.version}　QQ群:<a class="bili-link" target="_blank" href="//jq.qq.com/?k=47vw4s3">285795550</a>`);
                Live.DOM.info.append(bhInfo);
                $('.control-panel').prepend(Live.DOM.info);
            } //瓜子数量 左
            if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
                Live.DOM.funcInfoRow = $('<div>').addClass('bh-func-info-row');
                Live.DOM.funcInfoRow.append($('<div>').addClass('func-info v-top').html(`<span>分区: </span>${$('.room-info-row a')[0].outerHTML}`));
                $('.anchor-info-row').css('margin-top', 0).after(Live.DOM.funcInfoRow);

                $('.room-info-row').remove();
            } //主播信息 下

            typeof callback == 'function' && callback();
        });
    });
    //Live.getUserInfo(() => init++);
};
