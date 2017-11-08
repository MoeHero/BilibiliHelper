/* globals ModuleStore, store */
'use strict';
var Helper = {
    DOM: {},
    userInfo: {},
    showID: location.pathname.substr(1),
};

Helper.addScriptByFile = fileName => {
    let script = $('<script>').attr('src', chrome.extension.getURL(fileName));
    $('head').append(script);
    return script;
};
Helper.addScriptByText = text => {
    let script = $('<script>').text(text);
    $('head').append(script);
    return script;
};

Helper.addStylesheetByFile = fileName => {
    let link = $('<link>').attr('rel', 'stylesheet').attr('href', chrome.extension.getURL(fileName));
    $('head').append(link);
    return link;
};
Helper.addStylesheetByText = text => {
    let style = $('<style>').attr('type', 'text/css').text(text);
    $('head').append(style);
    return style;
};

Helper.getRoomID = showID => {
    return new Promise(resolve => {
        let rid = ModuleStore.roomID_get(showID);
        if(!rid) {
            $.getJSON('//api.live.bilibili.com/room/v1/Room/room_init?id=' + showID).done(r => {
                switch(r.code) {
                    case 0:
                        ModuleStore.roomID_add(showID, rid);
                        rid = r.data.room_id;
                        break;
                    case 1:
                        rid = 0;
                        break;
                }
                resolve(rid);
            }).fail(() => resolve(0));
        } else {
            resolve(rid);
        }
    });
};
/*Helper.getRoomInfo = function(roomID, callback) {
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
Helper.getUserInfo = () => {
    return new Promise(resolve => {
        $.getJSON('//api.live.bilibili.com/live_user/v1/UserInfo/get_info_in_room?roomid=22440').done(r => {
            switch(r.code) {
                case 0:
                    Helper.userInfo.mobileVerify = Number.parseInt(r.data.info.mobile_verify) == 1;
                    Helper.userInfo.uid = r.data.info.uid;
                    Helper.userInfo.username = r.data.info.uname;
                    Helper.userInfo.isSVIP = Number.parseInt(r.data.level.svip) == 1;
                    Helper.userInfo.isVIP = Number.parseInt(r.data.level.vip) == 1;
                    Helper.userInfo.userLevel = r.data.level.user_level;
                    break;
                case 3: //未登录
                    Helper.userInfo.noLogin = true;
                    break;
                default:
                    console.log(r);
                    break;
            }
            resolve();
        }).fail(() => Helper.countdown(2, () => Helper.getUserInfo()));
    });
};

// Helper.liveToast = (message, element, type) => { //success caution error info
//     let newToast = $('<div>').addClass('live-toast ' + type)
//         .append($('<i>').addClass('toast-icon ' + type), $('<span>').addClass('toast-text').text(message))
//         .css({'left': $.getLeft(element[0]) + element.width()})
//         .css({'top': $.getTop(element[0]) + element.height()});
//     $('body').append(newToast);
//     Helper.countdown(2, () => newToast.fadeOut(200).remove());
// };
Helper.format = (template, data) => {
    if(data) {
        let keys = Object.keys(data);
        let dataList = keys.map(key => data[key]);
        return new Function(keys.join(','), 'return `' + template + '`;').apply(null, dataList); //jshint ignore:line
    }
    return template;
};
// Helper.escape = string => {
//     return string.replace(/([\\'"&])+?/g, '\\$1');
// };
Helper.localize = {//TODO 重构 去除不必要文本
    helper: '哔哩哔哩助手',
    enabled: '已启用',
    noLogin: '未登录',
    noPhone: '未绑定手机',
    exist: '已在直播间${showID}启动',
    sign: {
        title: '自动签到',
        action: {
            award: '签到成功, 获得${award}',
            signed: '今日已签到',
        }
    },
    treasure: {
        title: '自动领瓜子',
        action: {
            award: '已领取${award}瓜子',
            totalSilver: '总瓜子:${silver}',
            end: '领取完毕',
        }
    },
    smallTV: {
        title: '自动小电视',
        action: {
            award: '获得${awardName}x${awardNumber}',
        }
    },
    activity: {
        title: '活动抽奖',
        action: {
            award: '获得${awardName}x${awardNumber}',
        }
    }
};

Helper.countdown = function(time, callback, element) {
    if(!(this instanceof Helper.countdown)) {
        return new Helper.countdown(time, callback, element);
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
Helper.countdown.prototype.clearCountdown = function() {
    clearInterval(this.countdown);
};

Helper.timer = function(ms, callback) {
    if(!ms || isNaN(ms)) {
        console.error('时间设置错误!');
        return;
    }
    if(!(this instanceof Helper.timer)) {
        return new Helper.timer(ms, callback);
    }
    this.timer = setInterval(() => {
        typeof callback == 'function' && callback();
    }, ms);
    typeof callback == 'function' && callback();
};
Helper.timer.prototype.clearTimer = function() {
    clearInterval(this.timer);
};

Helper.sendMessage = (msg, callback) => chrome.runtime.sendMessage(msg, response => typeof callback == 'function' && callback(response));
Helper.getMessage = callback => chrome.runtime.onMessage.addListener((request, sender, sendResponse) => callback(request, sender, sendResponse));

$.fn.stopPropagation = function() {return this.on('click', e => e.stopPropagation());};
// $.getTop = e => e.offsetParent !== null ? e.offsetTop + $.getTop(e.offsetParent) : 0;
// $.getLeft = e => e.offsetParent !== null ? e.offsetLeft + $.getLeft(e.offsetParent) : 0;
Date.prototype.Format = function(format) { //jshint ignore:line
    var o = {
        'M+': this.getMonth() + 1, //月份
        'd+': this.getDate(), //日
        'h+': this.getHours(), //小时
        'm+': this.getMinutes(), //分
        's+': this.getSeconds(), //秒
        'q+': Math.floor((this.getMonth() + 3) / 3), //季度
        'S': this.getMilliseconds() //毫秒
    };
    if(/(y+)/.test(format)) {format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));}
    for(var k in o) {
        if(new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return format;
};
