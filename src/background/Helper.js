/* globals ModuleStore,ModuleLogger */
window.Helper = {
    userInfo: {},
    options: {},
    info: {
        version: chrome.runtime.getManifest().version,
        extensionID: chrome.i18n.getMessage('@@extension_id'),
    },

    getRoomID(shortID) {
        return new Promise(resolve => {
            let rid = ModuleStore.getRoomID(shortID);
            if(rid) {
                resolve(rid);
                return;
            }
            $.getJSON('https://api.live.bilibili.com/room/v1/Room/room_init', {id: shortID}).done(r => {
                switch(r.code) {
                    case 0:
                        rid = r.data.room_id;
                        ModuleStore.addRoomID(shortID, rid);
                        break;
                    case 1: //房间不存在
                        break;
                    default:
                        ModuleLogger.printUntreated(r);
                        break;
                }
                resolve(rid);
            }).fail(() => resolve(0));
        });
    },
    getUserInfo() {
        return new Promise(resolve => {
            $.getJSON('https://api.live.bilibili.com/live_user/v1/UserInfo/get_info_in_room', {roomid: '1'}).done(r => {
                switch(r.code) {
                    case 0:
                        Helper.userInfo.isVIP = Number.parseInt(r.data.level.vip) == 1;
                        Helper.userInfo.isSVIP = Number.parseInt(r.data.level.svip) == 1;
                        Helper.userInfo.userLevel = r.data.level.user_level;
                        Helper.userInfo.uid = r.data.info.uid;
                        Helper.userInfo.username = r.data.info.uname;
                        Helper.userInfo.identification = Number.parseInt(r.data.info.identification) == 1;
                        Helper.userInfo.mobileVerify = Number.parseInt(r.data.info.mobile_verify) == 1;
                        break;
                    case 3: //未登录
                        Helper.userInfo.noLogin = true;
                        break;
                    default:
                        ModuleLogger.printUntreated(r);
                        break;
                }
                resolve();
            });
        });
    },

    format(template, data) {
        if(!data) return template;
        let keys = Object.keys(data);
        let dataList = keys.map(key => data[key]);
        return new Function(keys.join(','), 'return `' + template + '`;').apply(null, dataList); //jshint ignore:line
    },
};

Helper.countdown = function(time, callback, element) {
    if(!time || (!(time instanceof Date) && isNaN(time))) {
        ModuleLogger.error('时间设置错误!');
        return;
    }
    if(!(this instanceof Helper.countdown)) return new Helper.countdown(time, callback, element);
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
            if(typeof callback == 'function') callback();
        }
    }, 100);
    this.countdown = countdown;
};
Helper.countdown.prototype.clearCountdown = function() {
    clearInterval(this.countdown);
};
Helper.timer = function(ms, callback) {
    if(!ms || isNaN(ms)) {
        ModuleLogger.error('时间设置错误!');
        return;
    }
    if(!(this instanceof Helper.timer)) return new Helper.timer(ms, callback);
    this.timer = setInterval(() => {
        if(typeof callback == 'function') callback();
    }, ms);
    if(typeof callback == 'function') callback();
};
Helper.timer.prototype.clearTimer = function() {
    clearInterval(this.timer);
};
