/* globals Live,store */
Live.format = function(template, context) {
    var tokenReg = /(\\)?\{([^\{\}\\]+)(\\)?\}/g;
    return template.replace(tokenReg, function(word, slash1, token, slash2) {
        if(slash1 || slash2) {
            return word.replace('\\', '');
        }
        var variables = token.replace(/\s/g, '').split('.');
        var currentObject = context;
        var length = variables.length;
        var i, variable;
        for (i = 0; i < length; i++) {
            variable = variables[i];
            currentObject = currentObject[variable];
            if(currentObject === undefined || currentObject === null) {
                return '';
            }
        }
        return currentObject;
    });
};
Live.localize = {
    helper: 'Bilibili助手',
    enabled: '已启用',
    init: '初始化中...',
    sign: {
        title: '自动签到',
        action: {
            award: '签到成功, 获得{award}',
            exist: '今日已签到'
        }
    },
    treasure: {
        title: '自动领瓜子',
        action: {
            award: '已领取{award}瓜子',
            exist: '已在直播间{showID}启动',
            awarding: '领取中...',
            totalSilver: '总瓜子:{silver}',
            noLogin: '未登录',
            end: '领取完毕'
        }
    },
    smallTV: {
        title: '自动小电视',
        noStatinfo: '暂无统计信息',
        action: {
            award: '获得{awardNumber}个{awardName}',
            exist: '已在直播间{showID}启动',
            joinSuccess: '参加成功',
            joinError: '参加失败, {msg}'
        }
    }
};
Live.console = {
    info: function(msg, color) {
        color = color || '57D2F7';
        console.log('%c' + msg, 'color:#FFF;background-color:#' + color + ';padding:5px;border-radius:7px;line-height:30px;');
    },
    warn: function(msg) {
        console.warn('%c' + msg, 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
    },
    error: function(msg) {
        console.error('%c' + msg, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
    },
    sign: function(key, param) {
        var sign = Live.localize.sign;
        var msg = sign.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Live.localize.enabled;
                break;
            case 'award':
                msg += Live.format(sign.action.award, param);
                break;
        }
        this.info(msg);
    },
    treasure: function(key, param) {
        var treasure = Live.localize.treasure;
        var msg = treasure.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Live.localize.enabled;
                break;
            case 'awarding':
                msg += Live.localize.awarding;
                break;
            case 'award':
                msg += Live.format(treasure.action.award + ' ' + treasure.action.totalSilver, param);
                break;
            case 'exist':
                msg += Live.format(treasure.action.exist, param);
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
                msg += Live.localize.enabled;
                break;
            case 'award':
                msg += Live.format(smallTV.action.award, param);
                break;
            case 'exist':
                msg += Live.format(smallTV.action.exist, param);
                break;
            case 'joinSuccess':
                msg += smallTV.action.joinSuccess + Live.format(' RoomID:{roomID} TVID:{TVID}', param);
                break;
            case 'joinError':
                msg += Live.format(smallTV.action.joinError, param);
                break;
        }
        this.info(msg);
    }
};
Live.store = {
    init: function() {
        !store.get('BH_RoomID') && store.set('BH_RoomID', {});
        !store.get('BH_SignDate') && store.set('BH_SignDate', '1970/1/1');
        !store.get('BH_TreasureDate') && store.set('BH_TreasureDate', '1970/1/1');
        !store.get('BH_SmallTVStatInfo') && store.set('BH_SmallTVStatInfo', {});
        !store.get('BH_SmallTVCount') && store.set('BH_SmallTVCount', 0);
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
        isSigned: function() {
            return store.get('BH_SignDate') == new Date().toLocaleDateString();
        },
        setSigned: function() {
            store.set('BH_SignDate', new Date().toLocaleDateString());
        }
    },
    treasure: {
        isEnd: function() {
            return store.get('BH_TreasureDate') == new Date().toLocaleDateString();
        },
        setEnd: function() {
            store.set('BH_TreasureDate', new Date().toLocaleDateString());
        }
    },
    smallTV: {
        addCount: function() {
            store.set('BH_SmallTVCount', store.get('BH_SmallTVCount') + 1);
        },
        getCount: function() {
            return store.get('BH_SmallTVCount');
        },
        addStatInfo: function(key, count) {
            var statInfo = store.get('BH_SmallTVStatInfo');
            statInfo[key] = (statInfo[key] || 0) + count;
            store.set('BH_SmallTVStatInfo', statInfo);
        },
        getStatInfo: function() {
            return store.get('BH_SmallTVStatInfo');
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
    sign: function(key, param) {
        var sign = Live.localize.sign;
        var msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(sign.action.award, param);
                break;
            case 'end':
                msg = sign.action.end;
                break;

        }
        Live.option.notify_autoSign && Live.notify.create('sign_' + key, Live.localize.helper + ' - ' + sign.title, msg);
    },
    treasure: function(key, param) {
        var treasure = Live.localize.treasure;
        var msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(treasure.action.award, param);
                break;
            case 'noLogin':
                msg = treasure.action.noLogin;
                break;
            case 'end':
                msg = treasure.action.end;
        }
        Live.option.notify_autoTreasure && Live.notify.create('treasure_' + key, Live.localize.helper + ' - ' + treasure.title, msg);
    },
    smallTV: function(key, param) {
        var smallTV = Live.localize.smallTV;
        var msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(smallTV.action.award, param);
                break;
        }
        Live.option.notify_autoSmallTV && Live.notify.create('smalltv_' + key, Live.localize.helper + ' - ' + smallTV.title, msg);
    }
};
Live.countdown = function(endTime, callback, element) {
    if(!(this instanceof Live.countdown)) {
        return new Live.countdown(endTime, callback, element);
    }
    if(!endTime || (!(endTime instanceof Date) && isNaN(endTime))) {
        console.error('倒计时时间设置错误!');
        return;
    }
    if(!(endTime instanceof Date)) {
        var time = new Date();
        time.setSeconds(time.getSeconds() + endTime);
        endTime = time;
    }
    var countdown = setInterval(function() {
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
            clearInterval(countdown);
            element && element.text('00:00');
            typeof callback == 'function' && callback();
        }
    }, 1000);
    this.countdown = countdown;
};
Live.countdown.prototype.clearCountdown = function() {
    clearInterval(this.countdown);
};
Live.timer = function(ms, callback) {
    if(!(this instanceof Live.timer)) {
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
