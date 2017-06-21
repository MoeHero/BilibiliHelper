/* globals ModuleStore */
'use strict';
var Helper = {
    options: {},
    userInfo: {},
    DOM: {},
    showID: location.pathname.substr(1)
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
            $.get('/' + showID).done(result => {
                let reg = result.match(/var ROOMID = (\d+)/);
                rid = (reg && reg[1]) || 0;
                ModuleStore.roomID_add(showID, rid);
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
        Promise.all([
            $.getJSON('/user/getuserinfo').promise(),
            $.getJSON('//space.bilibili.com/ajax/member/MyInfo').promise()
        ]).then(r => {
            let userLiveInfo = r[0];
            let userInfo = r[1];
            if(userLiveInfo.code == 'REPONSE_OK') {
                Helper.userInfo.vip = userLiveInfo.data.vip || userLiveInfo.data.svip;
                Helper.userInfo.userLevel = userLiveInfo.data.user_level;
            } else {
                console.log(userLiveInfo);
            }

            if(userInfo.status === true) {
                Helper.userInfo.uid = userInfo.data.mid;
                Helper.userInfo.mobileVerified = userInfo.data.mobile_verified;
            } else {
                console.log(userInfo);
            }
            resolve();
        }).catch(() => Helper.countdown(2, () => Helper.getUserInfo()));
    });
};

Helper.liveToast = (message, element, type) => { //success caution error info
    let newToast = $('<div>').addClass('live-toast ' + type)
        .append($('<i>').addClass('toast-icon ' + type), $('<span>').addClass('toast-text').text(message))
        .css({'left': $.getLeft(element[0]) + element.width()})
        .css({'top': $.getTop(element[0]) + element.height()});
    $('body').append(newToast);
    Helper.countdown(2, () => newToast.fadeOut(200).remove());
};
Helper.format = (template, data) => {
    if(data) {
        let keys = Object.keys(data);
        let dataList = keys.map(key => data[key]);
        return new Function(keys.join(','), 'return `' + template + '`;').apply(null, dataList); //jshint ignore:line
    }
    return template;
};
Helper.escape = string => {
    return string.replace(/([\\'"&])+?/g, '\\$1');
};
Helper.localize = {//TODO 重构 去除不必要文本
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
$.getTop = e => e.offsetParent !== null ? e.offsetTop + $.getTop(e.offsetParent) : 0;
$.getLeft = e => e.offsetParent !== null ? e.offsetLeft + $.getLeft(e.offsetParent) : 0;

Helper.init = callback => {
    ModuleStore.init();
    Promise.all([
        new Promise(resolve => Helper.sendMessage({command: 'getOptions'}, option => resolve(option))),
        Helper.getRoomID(Helper.showID),
        Helper.getUserInfo()
    ]).then(r => {
        Helper.option = r[0];
        Helper.roomID = r[1];
        $.post('//bh.moehero.com/api/helper/upload/userinfo', {uid: Helper.userInfo.uid, version: Helper.info.version, option: JSON.stringify(Helper.option)});

        {
            Helper.DOM.info = $('<div>').addClass('seeds-buy-cntr').append($('<div>').addClass('ctrl-item').html(`${Helper.localize.helper} V${Helper.info.version}　QQ群:<a class="bili-link" target="_blank" href="//jq.qq.com/?k=47vw4s3">285795550</a>`));
            $('.control-panel').prepend(Helper.DOM.info);
        } //瓜子数量 左
        if(Helper.option.live && (Helper.option.live_autoTreasure || Helper.option.live_autoSmallTV)) {
            Helper.DOM.funcInfoRow = $('<div>').addClass('bh-func-info-row').append($('<div>').addClass('func-info v-top').html('<span>分区: </span>' + $('.room-info-row a')[0].outerHTML));
            $('.anchor-info-row').css('margin-top', 0).after(Helper.DOM.funcInfoRow);

            $('.room-info-row').remove();
        } //主播信息 下
        //自动扩大关注列表
        Helper.sidebarHeight = $('.colorful').css('display') == 'none' ? 499 : 550;
        $('.my-attention-body').height($(window).height() - Helper.sidebarHeight);
        $(window).resize(() => $('.my-attention-body').height($(window).height() - Helper.sidebarHeight));
        Helper.countdown(0.1, () => callback());
    });
};
