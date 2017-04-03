((function() {
    if(location.hostname != 'live.bilibili.com' || !store.enabled) {
        return;
    }

    var Live = {options: {}, userInfo: {}};
    Live.addScriptByFile = function(fileName) {
        var script = document.createElement('script');
        script.src = chrome.extension.getURL(fileName);
        document.body.appendChild(script);
    };
    Live.addScriptByText = function(text) {
        var script = document.createElement('script');
        script.innerHTML = text;
        document.body.appendChild(script);
    };
    Live.getRoomHTML = function(showID) {
        return $.get('/' + showID);
    };
    Live.getRoomID = function(showID, callback) {
        var rid = store.get('BH_RoomID')[showID] || 0;
        if(rid) {
            typeof callback == 'function' && callback(rid);
        } else {
            Live.getRoomHTML(showID).done(function(result) {
                var reg = new RegExp('var ROOMID = ([\\d]+)');
                rid = reg.exec(result)[1] || 0;
                if(rid) {
                    var o = store.get('BH_RoomID');
                    o[showID] = rid;
                    store.set('BH_RoomID', o);
                    typeof callback == 'function' && callback(rid);
                } else {
                    typeof callback == 'function' && callback(0);
                }
            });
        }
    };
    Live.showID = (function() {
        return location.pathname.substr(1);
    }());
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
    Live.sign = {
        do: function() {
            if(!Live.option.live || !Live.option.live_autoSign) {
                return;
            }
            Live.console.sign(-1);
            if(!Live.store.sign.get()) {
                $.getJSON('/sign/doSign').done(function(result) {
                    if(result.code === 0) {//签到成功
                        Live.console.sign(result.code, result.data.text);
                        Live.dom.sign();
                        Live.store.sign.set();
                    } else if(result.code == -500) {//已签到
                        Live.console.sign(result.code, result.msg);
                        Live.store.sign.set();
                    } else {
                        Live.console.sign(result.code, result.msg);
                    }
                });
            }
        }
    };
    Live.treasure = {
        correctStr: {'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1},
        init: function() {
            if(!Live.option.live || !Live.option.live_autoTreasure) {
                return;
            }
            var $this = this;
            Live.dom.treasure.init();
            this.canvas = document.createElement('canvas');
            this.canvas.width = 120;
            this.canvas.height = 40;
            this.canvas = this.canvas.getContext('2d');
            Live.sendMessage({command: 'getTreasure'}, function(result) {
                if(!result.showID) {
                    $(window).on('beforeunload', function() {
                        Live.sendMessage({command: 'getTreasure'}, function(result) {
                            result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'});
                        });
                    });
                    Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                    Live.console.treasure('已启动');
                    if(!Live.store.treasure.get()) {
                        Live.getMessage(function(request) {
                            if(request.command == 'checkNewTask') {
                                $this.checkNewTask();
                            }
                        });
                        $this.checkNewTask();
                    } else {
                        Live.console.treasure('领取完毕');
                        Live.dom.treasure.setState('领取完毕');
                    }
                } else {
                    Live.dom.treasure.setState('已在' + result.showID + '启动');
                    Live.console.treasure('已在直播间' + result.showID + '启动');
                    Live.sendMessage({command: 'checkNewTask'});
                }
            });
        },
        checkNewTask: function() {
            var $this = this;
            $.getJSON('/FreeSilver/getCurrentTask').done(function(result) {
                if(result.code === 0) {
                    $this.getTimes();
                    $this.startTime = result.data.time_start;
                    $this.endTime = result.data.time_end;
                    var endTime = new Date();
                    endTime.setMinutes(endTime.getMinutes() + result.data.minute);
                    $this.countdown && $this.countdown.clearCountdown();
                    $this.countdown = new Live.countdown(endTime, function() {
                        $this.getAward();
                    }, Live.dom.treasure.countdown);
                    Live.dom.treasure.showCountdown();
                    Live.console.treasure('新任务 结束时间:' + endTime.toLocaleString());
                } else if(result.code == -101) {//未登录
                    Live.console.treasure('未登录');
                    Live.dom.treasure.setState('请先登录');
                } else if(result.code == -10017) {//领取完毕
                    Live.console.treasure('领取完毕');
                    Live.dom.treasure.setState('领取完毕');
                    Live.store.treasure.set();
                } else {
                    console.log(result);
                }
            });
        },
        getAward: function() {
            var $this = this;
            var image = new Image();
            image.src = this.getCaptcha();
            image.onload = function() {
                $this.canvas.clearRect(0, 0, $this.canvas.width, $this.canvas.height);
                $this.canvas.drawImage(image, 0, 0);
                $this.answer = eval($this.correctQuestion(OCRAD($this.canvas)));
                $.getJSON('/FreeSilver/getAward', {time_start: $this.startTime, time_end: $this.endTime, captcha: $this.answer})
                .done(function(result) {
                    if(result.code === 0) {//领取成功
                        Live.console.treasure('已领取' + result.data.awardSilver + '瓜子 总瓜子:' + result.data.silver);
                        $this.checkNewTask();
                    } else if(result.code == -99) {//在其他地方领取
                        $this.checkNewTask();
                    } else if(result.code == -400) {
                        $this.getAward();
                    } else {
                        console.log(result);
                        $this.checkNewTask();
                    }
                });
            };
        },
        getTimes: function() {
            $.getJSON('/i/api/taskInfo').done(function(result) {
                if(result.code === 0) {
                    result = result.data.box_info;
                    var maxTimes = result.max_times * 3;
                    var times = (result.times - 2) * 3 + result.type;
                    Live.dom.treasure.setTimes(times + '/' + maxTimes);
                }
            });
        },
        getCaptcha: function() {
            return '/freeSilver/getCaptcha?ts=' + Date.now();
        },
        correctQuestion: function(question) {
            var q = '';
            question = question.trim();
            for (var i in question) {
                var a = this.correctStr[question[i]];
                q += a || question[i];
            }
            return q;
        }
    };
    Live.smallTV = {
        rewardName: {'1': '小电视抱枕', '2': '蓝白胖次', '3': 'B坷垃', '4': '喵娘', '5': '爱心便当', '6': '银瓜子', '7': '辣条'},
        init: function() {
            if(!Live.option.live || !Live.option.live_autoSmallTV) {
                return;
            }
            var $this = this;
            Live.sendMessage({command: 'getSmallTV'}, function(result) {
                if(!result.showID) {
                    Live.sendMessage({command: 'setSmallTV', showID: Live.showID});
                    Live.console.smallTV('已启动');
                    Live.getMessage(function(request) {
                        if(request.cmd == 'SYS_MSG' && request.tv_id && request.real_roomid) {
                            $this.join(request.real_roomid, request.tv_id);
                        }
                    });
                    $(window).on('beforeunload', function() {
                        Live.sendMessage({command: 'getSmallTV'}, function(result) {
                            result.showID == Live.showID && Live.sendMessage({command: 'delSmallTV'});
                        });
                    });
                } else {
                    Live.console.smallTV('已在直播间' + result.showID + '启动');
                }
            });
        },
        join: function(roomID, TVID) {
            var $this = this;
            $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID}).done(function(result) {
                if(result.code === 0) {
                    var endTime = new Date();
                    endTime.setSeconds(endTime.getSeconds() + result.data.dtime);
                    $this.countdown[TVID] && $this.countdown[TVID].clearCountdown();
                    $this.countdown[TVID] = new Live.countdown(endTime, function() {
                        $this.getAward(TVID);
                    });
                    Live.console.smallTV('参加成功! RoomID:' + roomID + ' TVID:' + TVID);
                } else if(result.code == -400) {
                    Live.console.smallTV('参加失败! ' + result.msg);
                } else {
                    $this.join();
                }
            });
        },
        getAward: function(TVID) {
            var $this = this;
            $.getJSON('/SmallTV/getReward', {id: TVID}).done(function(result) {
                result = result.data;
                if(result.status === 0) {//领取成功
                    Live.console.smallTV('已获得' + result.reward.num + '个' + $this.rewardName[result.reward.id]);
                } else if(result.status == 2) {//正在开奖
                    $this.awardCountdown && $this.awardCountdown.clearCountdown();
                    $this.awardCountdown = new Live.awardCountdown(5, function() {
                        $this.getAward(TVID);
                    });
                } else {
                    console.log(result);
                    $this.getAward(TVID);
                }
            });
        }
    };
    Live.console = {
        info: function(info) {
            console.log('%c' + info, 'color:#FFF;background-color:#57D2F7;padding:5px;border-radius:7px;line-height:30px;');
        },
        warn: function(log) {
            console.warn('%c' + log, 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
        },
        error: function(log) {
            console.error('%c' + log, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
        },
        sign: function(code, msg) {
            if(code === 0) {
                this.info('自动签到: 签到成功, 获得' + msg);
            } else if(code == -1) {
                this.info('自动签到: 已启动');
            } else {
                this.error('自动签到: 签到错误, ' + msg);
            }
        },
        treasure: function(msg) {
            this.info('自动领瓜子: ' + msg);
        },
        smallTV: function(msg) {
            this.info('自动小电视: ' + msg);
        }
    };
    Live.dom = {
        init: function() {
            $('.control-panel').prepend('<div class="ctrl-item" id="bh-info"></div>');
        },
        sign: function() {
            $('.sign-up-btn>.dp-inline-block>span:first-child').hide();
            $('.sign-up-btn>.has-new').hide();
            $('.sign-up-btn>.dp-inline-block>.dp-none').show();
        },
        treasure: {
            state: false,
            times: false,
            countdown: false,
            init: function() {
                $('.treasure-box-ctnr').hide();
                $('#bh-info').append('<div id="bh-treasure">自动领瓜子: <span id="bh-treasure-state">初始化中...</span><span id="bh-treasure-times" style="display:none;">0/9</span> <span id="bh-treasure-countdown" style="display:none;">00:00</span></div>');
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
        sign: {
            get: function() {
                return store.get('BH_SignDate') == new Date().toLocaleDateString();
            },
            set: function() {
                store.set('BH_SignDate', new Date().toLocaleDateString());
            }
        },
        treasure: {
            get: function() {
                return store.get('BH_TreasureDate') == new Date().toLocaleDateString();
            },
            set: function() {
                store.set('BH_TreasureDate', new Date().toLocaleDateString());
            }
        }
    };
    Live.countdown = function(endTime, callback, element) {
        if (!(this instanceof Live.countdown)) {
            return new Live.countdown(endTime, callback, element);
        }
        if (!endTime || !(endTime instanceof Date)) {
            console.error('倒计时时间设置错误');
            return;
        }
        var interval = setInterval(function() {
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
                clearInterval(interval);
                element.text('00:00');
                typeof callback == 'function' && callback();
            }
        }, 1000);
        this.countdown = interval;
    };
    Live.countdown.prototype.clearCountdown = function() {
        clearInterval(this.countdown);
    };
    Live.timer = function(ms, callback) {
        if (!(this instanceof Live.timer)) {
            return new Live.timer(ms, callback);
        }
        var interval = setInterval(function() {
            typeof callback == 'function' && callback();
        }, ms);
        this.timer = interval;
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
    Live.start = function(callback) {
        var init = 0;
        !store.get('BH_RoomID') && store.set('BH_RoomID', {});
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

    Live.sendMessage({command: 'getInfo'}, function(result) {
        Live.info = result;
        Live.console.info('BilibiliHelper V' + Live.info.version + ' Build' + Live.info.buildNumber);
        if(isNaN(Live.showID)) {
            Live.console.info('非直播间, 脚本不启用');
            return;
        }

        Live.addScriptByText('var extensionID=\'' + Live.info.extensionID + '\';');
        Live.addScriptByFile('bilibili_live_inject.min.js');
        Live.start(function() {
            Live.timer(1 * 60 * 60 * 1000, function() {
                Live.sign.do();
                Live.treasure.init();
            });

            Live.smallTV.init();
        });
    });
})());
