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
            exist: '今日已签到'
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
            joinError: '参加失败, ${msg}'
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
