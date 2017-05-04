/* globals ModuleStore */
var Live = {
    options: {},
    userInfo: {},
    DOM: {},
    showID: location.pathname.substr(1)
};

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
        } else if(result.code === -400) { //房间被锁定
        } else {
            console.log(result);
        }
        typeof callback == 'function' && callback(roomInfo);
    });
};*/
/*Live.getUserInfo = function(callback) {
    $.getJSON('/user/getuserinfo').done((result) => {
        if(result.code == 'REPONSE_OK') {
            Live.userInfo.vip = result.data.vip || result.data.svip;
        } else {
            console.log(result);
        }
    }).then(() => $.getJSON('//space.bilibili.com/ajax/member/MyInfo').done((result) => {
        if(result.status === true) {
            Live.userInfo.mobileVerified = result.data.mobile_verified;
        } else {
            console.log(result);
        }
        typeof callback == 'function' && callback();
    }));
};*/

Live.format = (template, data) => {
    if(data) {
        let keys = Object.keys(data);
        let dataList = keys.map((key) => data[key]);
        return new Function(keys.join(','), 'return `' + template + '`;').apply(null, dataList); //jshint ignore:line
    }
};
Live.localize = {//TODO 重构 去除不必要文本
    helper: 'Bilibili助手',
    enabled: '已启用',
    sign: {
        title: '自动签到',
        action: {
            award: '签到成功, 获得${award}',
            exist: '已在直播间${showID}启动',
            signed: '今日已签到'
        }
    },
    treasure: {
        title: '自动领瓜子',
        action: {
            award: '已领取${award}瓜子',
            exist: '已在直播间${showID}启动',
            totalSilver: '总瓜子:${silver}',
            noLogin: '未登录',
            noPhone: '未绑定手机',
            end: '领取完毕'
        }
    },
    smallTV: {
        title: '自动小电视',
        action: {
            award: '获得${awardName}x${awardNumber}',
            exist: '已在直播间${showID}启动',
            joinSuccess: '参加成功',
        }
    },
    lighten: {
        title: '自动领取应援棒',
        action: {
            award: '获得应援棒x1',
            exist: '已在直播间${showID}启动'
        }
    }
};

Live.countdown = function(time, callback, element) {
    if(!(this instanceof Live.countdown)) {
        return new Live.countdown(time, callback, element);
    }
    if(!time || (!(time instanceof Date) && isNaN(time))) {
        console.error('时间设置错误!');
        return;
    }
    if(!isNaN(time)) {
        let _time = new Date();
        _time.setMilliseconds(_time.getMilliseconds() + time * 1000);
        time = _time;
    }
    let countdown = setInterval(() => {
        let _time = Math.round((time.getTime() - new Date().getTime()) / 1000);
        if(element instanceof jQuery) {
            let min = Math.floor(_time / 60);
            let sec = Math.floor(_time % 60);
            min = min < 10 ? '0' + min : min;
            sec = sec < 10 ? '0' + sec : sec;
            element.text(min + ':' + sec);
        }
        if(_time <= 0) {
            clearInterval(countdown);
            typeof callback == 'function' && callback();
        }
    }, 100);
    this.countdown = countdown;
};
Live.countdown.prototype.clearCountdown = function() {
    clearInterval(this.countdown);
};

Live.timer = function(ms, callback) {
    if(!ms || isNaN(ms)) {
        console.error('时间设置错误!');
        return;
    }
    if(!(this instanceof Live.timer)) {
        return new Live.timer(ms, callback);
    }
    this.timer = setInterval(() => {
        typeof callback == 'function' && callback();
    }, ms);
    typeof callback == 'function' && callback();
};
Live.timer.prototype.clearTimer = function() {
    clearInterval(this.timer);
};

Live.sendMessage = (msg, callback) => chrome.runtime.sendMessage(msg, (response) => typeof callback == 'function' && callback(response));
Live.getMessage = (callback) => chrome.runtime.onMessage.addListener((request, sender, sendResponse) => typeof callback == 'function' && callback(request, sender, sendResponse));

$.fn.stopPropagation = function() {
    return this.on('click', (e) => e.stopPropagation());
};

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
                Live.DOM.info = $('<div>').addClass('seeds-buy-cntr').append($('<div>').addClass('ctrl-item').html(`${Live.localize.helper} V${Live.info.version}　QQ群:<a class="bili-link" target="_blank" href="//jq.qq.com/?k=47vw4s3">285795550</a>`));
                $('.control-panel').prepend(Live.DOM.info);
            } //瓜子数量 左
            if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
                Live.DOM.funcInfoRow = $('<div>').addClass('bh-func-info-row').append($('<div>').addClass('func-info v-top').html('<span>分区: </span>' + $('.room-info-row a')[0].outerHTML));
                $('.anchor-info-row').css('margin-top', 0).after(Live.DOM.funcInfoRow);

                $('.room-info-row').remove();
            } //主播信息 下

            typeof callback == 'function' && callback();
        });
    });
    //Live.getUserInfo(() => init++);
};
