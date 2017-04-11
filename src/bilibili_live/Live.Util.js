/* globals Live,store */
Live.format = function(template, context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return template.replace(tokenReg, function(word, slash1, token, slash2) {
        if (slash1 || slash2) {
            return word.replace('\\', '');
        }
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var length = variables.length;
        var i, variable;
        for (i = 0; i < length; i++) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if (currentObject === undefined || currentObject === null) {
                return '';
            }
        }
        return currentObject;
    });
};
Live.console = {
    info: function(info, backgroundColor) {
        backgroundColor = backgroundColor || '57D2F7';
        console.log('%c' + info, 'color:#FFF;background-color:#' + backgroundColor + ';padding:5px;border-radius:7px;line-height:30px;');
    },
    warn: function(log) {
        console.warn('%c' + log, 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
    },
    error: function(log) {
        console.error('%c' + log, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
    },
    sign: function(key, param) {
        var sign = Live.localize.sign;
        var msg = sign.title + ': ';
        switch(key) {
            case 'enabled':
                msg += sign.action.enabled;
                break;
            case 'award':
                msg += Live.format(sign.action.award, param);
                break;
            case 'error':
                msg += Live.format(sign.action.error, param);
                break;
        }
        this.info(msg, key == 'error' ? 'F29F3F' : false);
    },
    treasure: function(key, param) {
        var treasure = Live.localize.treasure;
        var msg = treasure.title + ': ';
        switch(key) {
            case 'enabled':
                msg += treasure.action.enabled;
                break;
            case 'award':
                msg += Live.format(treasure.action.award + ' ' + treasure.action.totalSilver, param);
                break;
            case 'exist':
                msg += Live.format(treasure.action.exist, param);
                break;
            case 'newTask':
                msg += Live.format(treasure.action.newTask, param);
                break;
            case 'noLogin':
                msg += treasure.noLogin;
                break;
            case 'end':
                msg += treasure.action.end;
                break;
        }
        this.info(msg);
    },
    smallTV: function(key, param) {
        var smallTV = Live.localize.smallTV;
        var msg = smallTV.title + ': ';
        switch(key) {
            case 'enabled':
                msg += smallTV.action.enabled;
                break;
            case 'award':
                msg += Live.format(smallTV.action.award, param);
                break;
            case 'exist':
                msg += Live.format(smallTV.action.exist, param);
                break;
            case 'joinSuccess':
                msg += smallTV.action.joinSuccess;
                break;
            case 'joinError':
                msg += Live.format(smallTV.action.joinError, param);
                break;
        }
        this.info(msg);
    }
};
Live.localize = {
    sign: {
        title: '自动签到',
        action: {
            enabled: '已启用',
            award: '签到成功, 获得{award}',
            error: '签到失败, {msg}'
        }
    },
    treasure: {
        title: '自动领瓜子',
        action: {
            enabled: '已启用',
            award: '已领取{award}瓜子',
            exist: '已在直播间{roomID}启动',
            totalSilver: '总瓜子:{silver}',
            newTask: '新任务 结束时间:{endTime}',
            noLogin: '未登录',
            end: '领取完毕'
        }
    },
    smallTV: {
        title: '自动小电视',
        action: {
            enabled: '已启用',
            award: '获得{awardNumber}个{awardName}',
            exist: '已在直播间{roomID}启动',
            joinSuccess: '参加成功',
            joinError: '参加失败, {msg}'
        }
    }
};
Live.dom = {
    init: function() {
        $('.control-panel').prepend('<div class="ctrl-item" id="bh-info"><div class="ctrl-item" id="bh-smalltv"><a class="link bili-link" id="bh-smalltv-statinfo">查看小电视统计信息</a></div></div>');
        $('#bh-smalltv-statinfo').on('click', function() {
            var statinfoJson = Live.store.smallTV.getAll();
            var statinfoStr = '';
            for(var i in statinfoJson) {
                statinfoStr += Live.smallTV.rewardName[i] + '*' + statinfoJson[i] + '\n';
            }
            alert(statinfoStr); //jshint ignore:line
        });
    },
    sign: function() {
        $('.sign-up-btn>.dp-inline-block>span:first-child').hide();
        $('.sign-up-btn>.has-new').hide();
        $('.sign-up-btn>.dp-inline-block>.dp-none').show();
    },
    treasure: {
        init: function() {
            $('.treasure-box-ctnr').hide();
            $('#bh-info').append('<div class="ctrl-item" id="bh-treasure">自动领瓜子: <span id="bh-treasure-state">初始化中...</span><span id="bh-treasure-times" style="display:none;">0/9</span> <span id="bh-treasure-countdown" style="display:none;">00:00</span></div>');
            this.state = $('#bh-treasure-state');
            this.times = $('#bh-treasure-times');
            this.countdown = $('#bh-treasure-countdown');
        },
        setState: function(text) {
            this.state.text(text).show();
            this.times.hide();
            this.countdown.hide();
        },
        setTimes: function(text) {
            this.times.text(text).show();
            this.state.hide();
        },
        showCountdown: function() {
            this.countdown.show();
            this.state.hide();
        }
    }
};
Live.store = {
    init: function() {
        !store.get('BH_RoomID') && store.set('BH_RoomID', {});
        !store.get('BH_SignDate') && store.set('BH_SignDate', '1970/1/1');
        !store.get('BH_TreasureDate') && store.set('BH_TreasureDate', '1970/1/1');
        !store.get('BH_SmallTVStatInfo') && store.set('BH_SmallTVStatInfo', {});
    },
    roomID: {
        get: function(showID) {
            return store.get('BH_RoomID')[showID] || 0;
        },
        add: function(showID, roomID) {
            var o = store.get('BH_RoomID');
            o[showID] = roomID;
            store.set('BH_RoomID', o);
        }
    },
    sign: {
        get: function() {
            return store.get('BH_SignDate') == new Date().toLocaleDateString();
        },
        set: function() {
            store.set('BH_SignDate', new Date().toLocaleDateString());
        }
    },
    treasure: {
        isSigned: function() {
            store.get('BH_TreasureDate') == new Date().toLocaleDateString();
        },
        setSigned: function() {
            store.set('BH_TreasureDate', new Date().toLocaleDateString());
        }
    },
    smallTV: {
        get: function(key) {
            return store.get('BH_SmallTVStatInfo')[key] || 0;
        },
        getAll: function() {
            return store.get('BH_SmallTVStatInfo');
        },
        add: function(key, count) {
            count += this.get(key);
            var o = store.get('BH_SmallTVStatInfo');
            o[key] = count;
            store.set('BH_SmallTVStatInfo', o);
        }
    }
};
Live.notify = {
    create: function(id, title, message, timeout) {
        if(Live.option.notify) {
            Live.sendMessage({command: 'createNotifications',
                param: {
                    id: id + '_' + Live.roomID,
                    title: title,
                    message: message,
                    timeout: timeout
                }
            });
        }
    },
    sign: function(id, message) {
        Live.option.notify_autoSign && Live.notify.create('sign_' + id, 'Bilibili助手 - 自动签到', message);
    },
    treasure: function(id, message) {
        Live.option.notify_autoTreasure && Live.notify.create('treasure_' + id, 'Bilibili助手 - 自动领瓜子', message);
    },
    smallTV: function(id, message) {
        Live.option.notify_autoSmallTV && Live.notify.create('smalltv_' + id, 'Bilibili助手 - 自动小电视', message);
    }
};
Live.countdown = function(endTime, callback, element) {
    if (!(this instanceof Live.countdown)) {
        return new Live.countdown(endTime, callback, element);
    }
    if (!endTime || !(endTime instanceof Date)) {
        console.error('倒计时时间设置错误!');
        return;
    }
    this.countdown = setInterval(function() {
        var dateNow = new Date();
        if(element !== undefined) {
            var time = (endTime.getTime() - dateNow.getTime()) / 1000;
            var min = Math.floor(time / 60);
            var sec = Math.floor(time % 60);
            min = min < 10 ? '0' + min : min;
            sec = sec < 10 ? '0' + sec : sec;
            element.text(min + ':' + sec);
        }
        if(endTime.getTime() <= dateNow.getTime()) {
            clearInterval(this.countdown);
            element && element.text('00:00');
            typeof callback == 'function' && callback();
        }
    }, 1000);
};
Live.countdown.prototype.clearCountdown = function() {
    clearInterval(this.countdown);
};
Live.timer = function(ms, callback) {
    if (!(this instanceof Live.timer)) {
        return new Live.timer(ms, callback);
    }
    this.timer = setInterval(function() {
        typeof callback == 'function' && callback();
    }, ms);
    typeof callback == 'function' && callback();
};
Live.timer.prototype.clearTimer = function() {
    clearInterval(this.timer);
};
Live.sendMessage = function(msg, callback) {
    chrome.runtime.sendMessage(msg, function(response) {
        typeof callback == 'function' && callback(response);
    });
};
Live.getMessage = function(callback) {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        typeof callback == 'function' && callback(request, sender, sendResponse);
    });
};
