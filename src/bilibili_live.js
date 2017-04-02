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
        return $.get('/' + showID).promise();
    };
    Live.getRoomID = function(showID, callback) {
        var rid = store.get('BH_RoomID')[showID] || 0;
        if(rid && typeof callback == 'function') {
            callback(rid);
        } else {
            Live.getRoomHTML(showID).done(function(result) {
                var reg = new RegExp('var ROOMID = ([\\d]+)');
                rid = reg.exec(result)[1] || 0;
                if(rid) {
                    var o = store.get('BH_RoomID');
                    o[showID] = rid;
                    store.set('BH_RoomID', o);
                    typeof callback == 'function' && callback(rid);
                }
            }).fail(function(result) {
                if(result.status != 404) {
                    Live.getRoomID(showID, callback);
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
            if(result.code == -400) {
                return;
            } else if(result.code === 0) {
                result = result.data;
                roomInfo.nickname = result.ANCHOR_NICK_NAME;
                typeof callback == 'function' && callback(roomInfo);
            }
        }).fail(function(result) {
            if(result.status != 404) {
                Live.getRoomInfo(roomID, callback);
            }
        });
    };
    Live.getUserInfo = function(callback) {
        $.getJSON('/user/getuserinfo').done(function(result) {
            if(result.code == -101) {//未登录
                return;
            } else if(result.code == 'REPONSE_OK') {
                result = result.data;
                Live.userInfo.vip = result.vip || result.svip;
                $.getJSON('//space.bilibili.com/ajax/member/MyInfo').done(function(result) {
                    if(!result.status) {//未登录
                        return;
                    } else {
                        result = result.data;
                        Live.userInfo.mobile_verified = result.mobile_verified;
                        typeof callback == 'function' && callback();
                    }
                }).fail(function(result) {
                    if(result.status != 404) {
                        Live.getUserInfo(callback);
                    }
                });
            }
        }).fail(function(result) {
            if(result.status != 404) {
                Live.getUserInfo(callback);
            }
        });
    };
    Live.doSign = function() {
        var date = new Date();
        if(store.get('BH_SignDate') != date.toLocaleDateString()) {
            $.getJSON('/sign/doSign').done(function(result) {
                if(result.code === 0) {//签到成功
                    Live.console.sign(result.code, result.data.text);
                    $('.sign-up-btn>.dp-inline-block>span:first-child').hide();
                    $('.sign-up-btn>.has-new').hide();
                    $('.sign-up-btn>.dp-inline-block>.dp-none').show();
                    store.set('BH_SignDate', date.toLocaleDateString());
                } else if(result.code == -500) {//已签到
                    Live.console.sign(result.code, result.msg);
                    store.set('BH_SignDate', date.toLocaleDateString());
                } else {
                    Live.console.sign(result.code, result.msg);
                }
            }).fail(function(result) {
                if(result.status != 404) {
                    Live.doSign();
                }
            });
        }
    };
    Live.treasure = {
        correctStr: {'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1},
        init: function() {
            $('.treasure-box-ctnr').hide();
            $('#bh-info').append('<div id="bh-treasure">自动领瓜子: <span id="bh-treasure-state">初始化中...</span><span id="bh-treasure-times" style="display:none;">1/3</span> <span id="bh-treasure-countdown" style="display:none;">00:00</span></div>');
            Live.treasure.canvas = document.createElement('canvas');
            Live.treasure.canvas.width = 120;
            Live.treasure.canvas.height = 40;
            Live.treasure.context = Live.treasure.canvas.getContext('2d');

            Live.sendMessage({command: 'getTreasure'}, function(result) {
                if(!result.showID) {
                    Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                    Live.console.info('自动领瓜子已启动');
                    Live.treasure.checkNewTask();
                    chrome.runtime.onMessage.addListener(function(request) {
                        if(request.command == 'checkNewTask') {
                            Live.treasure.checkNewTask();
                        }
                    });
                    $(window).on('beforeunload', function() {
                        Live.sendMessage({command: 'getTreasure'}, function(result) {
                            result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'});
                        });
                    });
                } else {
                    $('#bh-treasure-state').text('已在' + result.showID + '启动');
                    Live.console.info('自动领瓜子已经在直播间' + result.showID + '启动');
                    Live.sendMessage({command: 'checkNewTask'});
                }
            });
        },
        checkNewTask: function() {
            $.getJSON('/FreeSilver/getCurrentTask').promise().done(function(result) {
                if(result.code === 0) {
                    Live.treasure.getTimes();
                    Live.treasure.startTime = result.data.time_start;
                    Live.treasure.endTime = result.data.time_end;
                    var endTime = new Date();
                    endTime.setMinutes(endTime.getMinutes() + result.data.minute);
                    Live.treasure.countdown && Live.treasure.countdown.clearCountdown();
                    Live.treasure.countdown = new Live.countdown(endTime, function() {
                        Live.treasure.getAward();
                    }, $('#bh-treasure-countdown'));
                    $('#bh-treasure-state').hide();
                    $('#bh-treasure-countdown').show();
                    Live.console.info('新任务 结束时间:' + endTime.toLocaleString());
                } else if(result.code == -101) {//未登录
                    Live.console.error('未登录');
                } else if(result.code == -10017) {//领取完毕
                    Live.console.info('今日瓜子领取完毕');
                    $('#bh-treasure-state').text('领取完毕');
                    $('#bh-treasure-state').show();
                    $('#bh-treasure-times').hide();
                    $('#bh-treasure-countdown').hide();
                } else if(result.code == -99) {//领奖信息不存在
                    Live.console.error('领奖信息不存在');
                } else {
                    console.log(result);
                }
            }).fail(function(result) {
                if(result.status != 404) {
                    Live.treasure.checkNewTask();
                }
            });
        },
        getAward: function() {
            var image = new Image();
            image.src = Live.treasure.getCaptcha();
            image.onload = function() {
                Live.treasure.context.clearRect(0, 0, Live.treasure.canvas.width, Live.treasure.canvas.height);
                Live.treasure.context.drawImage(image, 0, 0);
                Live.treasure.answer = eval(Live.treasure.correctQuestion(OCRAD(Live.treasure.context)));
                $.getJSON('/FreeSilver/getAward', {time_start: Live.treasure.startTime, time_end: Live.treasure.endTime, captcha: Live.treasure.answer})
                .promise().done(function(result) {
                    if(result.code === 0) {
                        Live.console.info('已领取' + result.data.awardSilver + '瓜子 总瓜子:' + result.data.silver);
                        Live.treasure.checkNewTask();
                    } else if(result.code == -99) {
                        Live.treasure.checkNewTask();
                    } else if(result.code == -400) {
                        Live.treasure.getAward();
                    } else {
                        Live.treasure.checkNewTask();
                    }
                }).fail(function(result) {
                    if(result.status != 404) {
                        Live.treasure.getAward();
                    }
                });
            };
        },
        getTimes: function() {
            $.getJSON('/i/api/taskInfo').promise().done(function(result) {
                if(result.code === 0) {
                    result = result.data.box_info;
                    var maxTimes = result.max_times * 3;
                    var times = (result.times - 2) * 3 + result.type;
                    $('#bh-treasure-times').text(times + '/' + maxTimes);
                    $('#bh-treasure-state').hide();
                    $('#bh-treasure-times').show();
                }
            }).fail(function(result) {
                if(result.status != 404 || result.status != 200) {
                    Live.treasure.getTimes();
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
                var a = Live.treasure.correctStr[question[i]];
                q += a || question[i];
            }
            return q;
        }
    };
    Live.smallTV = {
        countdown: {},
        rewardList: {
            1: {title: '小电视抱枕'},
            2: {title: '蓝白胖次'},
            3: {title: 'B坷垃'},
            4: {title: '喵娘'},
            5: {title: '爱心便当'},
            6: {title: '银瓜子'},
            7: {title: '辣条'}
        },
        init: function() {
            Live.sendMessage({command: 'getSmallTV'}, function(result) {
                if(!result.showID) {
                    Live.sendMessage({command: 'setSmallTV', showID: Live.showID});
                    Live.console.info('自动抽取小电视已启动');
                    chrome.runtime.onMessage.addListener(function(request) {
                        if(request.cmd == 'SYS_MSG' && request.tv_id && request.real_roomid) {
                            Live.smallTV.join(request.real_roomid, request.tv_id);
                        }
                    });
                    $(window).on('beforeunload', function() {
                        Live.sendMessage({command: 'getSmallTV'}, function(result) {
                            result.showID == Live.showID && Live.sendMessage({command: 'delSmallTV'});
                        });
                    });
                } else {
                    Live.console.info('自动抽取小电视已经在直播间' + result.showID + '启动');
                }
            });
        },
        join: function(roomID, TVID) {
            $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID})
            .promise().done(function(result) {
                if(result.code === 0) {
                    var endTime = new Date();
                    endTime.setSeconds(endTime.getSeconds() + result.data.dtime);
                    Live.smallTV.countdown[TVID] && Live.smallTV.countdown[TVID].clearCountdown();
                    Live.smallTV.countdown[TVID] = new Live.countdown(endTime, function() {
                        Live.smallTV.getAward(TVID);
                    });
                    Live.console.info('参加成功! RoomID:' + roomID + ' TVID:' + TVID);
                } else if(result.code == -400) {
                    Live.console.info('参加失败! ' + result.msg);
                } else {
                    Live.smallTV.join();
                }
            }).fail(function(result) {
                if(result.status != 404) {
                    Live.smallTV.join();
                }
            });
        },
        getAward: function(TVID) {
            $.getJSON('/SmallTV/getReward', {id: TVID})
            .promise().done(function(result) {
                result = result.data;
                if(result.status === 0) {//领取成功
                    Live.console.info('已获得' + result.reward.num + '个' + Live.smallTV.rewardList[result.reward.id].title);
                } else if(result.status == 2) {//正在开奖
                    setTimeout(function() {
                        Live.smallTV.getAward(TVID);
                    }, 5000);
                } else {
                    Live.smallTV.getAward(TVID);
                }
            }).fail(function(result) {
                if(result.status != 404) {
                    Live.smallTV.getAward(TVID);
                }
            });
        }
    };
    Live.console = {
        info: function(info) {
            console.log('%c' + info, 'color:#FFF;background-color:#57D2F7;padding:5px;border-radius:7px;line-height:30px;');
        },
        log: function(log) {
            console.info('%c' + log, 'color:#FFF;background-color:#57D2F7;padding:5px;border-radius:7px;line-height:30px;');
        },
        warn: function(log) {
            console.warn('%c' + log, 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
        },
        error: function(log) {
            console.error('%c' + log, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
        },
        sign: function(code, msg) {
            if(code === 0) {
                console.log('%c签到成功, 获得' + msg, 'color:#FFF;background-color:#57D2F7;padding:5px;border-radius:7px;line-height:30px;');
            } else if(code == -500) {
                console.log('%c今日已签到', 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
            } else {
                console.error('%c签到错误, ' + msg, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
            }
        },
        // treasure: function(code, msg) {
        // }
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
            if(endTime.getTime() <= dateNow.getTime()) {
                clearInterval(interval);
                typeof callback == 'function' && callback();
                $('#bh-treasure-countdown').text('00:00');
                return;
            }
            if(element !== undefined) {
                var ms = endTime.getTime() - dateNow.getTime(); // 倒计时剩余总时间: 毫秒.
                var mm = Math.floor(ms / 60 / 1000); // 倒计时剩余总时间: 分钟.
                var s = ms - (mm * 60 * 1000); // 倒计时秒数零头毫秒数: 总毫秒时间 - 总分钟取整时间
                var ss = Math.floor(s / 1000); // 倒计时秒数零头秒数.
                mm = mm < 10 ? '0' + mm : mm;
                ss = ss < 10 ? '0' + ss : ss;
                element.text(mm + ':' + ss);
            }
        }, 1000);
        this.countdown = interval;
    };
    Live.countdown.prototype.clearCountdown = function() {
        clearInterval(this.countdown);
    };
    Live.timer = function(seconds, callback) {
        if (!(this instanceof Live.timer)) {
            return new Live.timer(seconds, callback);
        }
        var interval = setInterval(function() {
            typeof callback == 'function' && callback();
        }, seconds * 1000);
        this.timer = interval;
    };
    Live.timer.prototype.clearTimer = function() {
        clearInterval(this.timer);
    };
    Live.sendMessage = function(msg, callback) {
        chrome.runtime.sendMessage(msg, function(response) {
            typeof callback == 'function' && callback(response);
        });
    };
    Live.start = function(callback) {
        !store.get('BH_RoomID') && store.set('BH_RoomID', {});
        $('.control-panel').prepend('<div class="ctrl-item" id="bh-info"></div>');
        Live.getRoomID(Live.showID, function() {
            Live.roomID = store.get('BH_RoomID')[Live.showID];
            typeof callback == 'function' && callback();
        });
        Live.getRoomInfo(Live.roomID, function(roomInfo) {
            Live.roomInfo = roomInfo;
        });
        Live.getUserInfo();
    };

    Live.sendMessage({command: 'getOptions'}, function(result) {
        Live.options = result;
        Live.console.info('BilibiliHelper V' + Live.options.version + ' Build' + Live.options.buildNumber);
        if(isNaN(Live.showID)) {
            Live.console.info('非直播间, 脚本不启用');
            return;
        }

        Live.addScriptByText('var extensionID=\'' + Live.options.extensionID + '\';');
        Live.addScriptByFile('bilibili_live_inject.min.js');
        Live.start(function() {
            Live.doSign();
            Live.timer(1 * 60 * 60, function() {
                Live.doSign();
            });

            Live.treasure.init();
            Live.smallTV.init();
        });
    });
})());
