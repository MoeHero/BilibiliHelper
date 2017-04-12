/* globals Live */
Live.treasure = {
    correctStr: {'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1},
    init: function() {
        if(!Live.option.live || !Live.option.live_autoTreasure) {
            return;
        }
        Live.dom.treasure.init();
        this.canvas = document.createElement('canvas');
        this.canvas.width = 120;
        this.canvas.height = 40;
        this.canvas = this.canvas.getContext('2d');
        Live.sendMessage({command: 'getTreasure'}, function(result) {
            if(!result.showID) {
                Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                $(window).on('beforeunload', function() {
                    Live.sendMessage({command: 'getTreasure'}, function(result) {
                        result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'});
                    });
                });
                Live.getMessage(function(request) {
                    if(request.command == 'checkNewTask') {
                        Live.treasure.checkNewTask();
                    }
                });
                Live.notify.treasure('enabled');
                Live.console.treasure('enabled');
                Live.treasure.checkNewTask();
                Live.timer(60 * 60 * 1000, function() {
                    Live.treasure.checkNewTask();
                });
            } else {
                Live.sendMessage({command: 'checkNewTask'});
                Live.dom.treasure.setState('exist', result);
                Live.console.treasure('exist', result);
            }
        });
    },
    checkNewTask: function() {
        if(!Live.store.treasure.isEnd()) {
            $.getJSON('/FreeSilver/getCurrentTask').done(function(result) {
                if(result.code === 0) {
                    Live.treasure.getTimes();
                    Live.treasure.startTime = result.data.time_start;
                    Live.treasure.endTime = result.data.time_end;
                    Live.treasure.countdown && Live.treasure.countdown.clearCountdown();
                    Live.treasure.countdown = new Live.countdown(result.data.minute * 60, function() {
                        Live.dom.treasure.setState('awarding');
                        Live.treasure.getAward();
                    }, Live.dom.treasure.countdown);
                    Live.dom.treasure.showCountdown();
                } else if(result.code == -101) { //未登录
                    Live.dom.treasure.setState('noLogin');
                    Live.notify.treasure('noLogin');
                    Live.console.treasure('noLogin');
                } else if(result.code == -10017) { //领取完毕
                    Live.store.treasure.setEnd();
                    Live.dom.treasure.setState('end');
                    Live.notify.treasure('end');
                    Live.console.treasure('end');
                } else {
                    console.log(result);
                    Live.treasure.checkNewTask();
                }
            }).fail(function() {
                Live.countdown(2, function() {
                    Live.treasure.checkNewTask();
                });
            });
        } else {
            Live.dom.treasure.setState('end');
        }
    },
    getAward: function() {
        var image = new Image();
        image.src = this.getCaptcha();
        image.onload = function() {
            Live.treasure.canvas.clearRect(0, 0, Live.treasure.canvas.width, Live.treasure.canvas.height);
            Live.treasure.canvas.drawImage(image, 0, 0);
            Live.treasure.answer = eval(Live.treasure.correctQuestion(OCRAD(Live.treasure.canvas))); //jshint ignore:line
            $.getJSON('/FreeSilver/getAward', {time_start: Live.treasure.startTime, time_end: Live.treasure.endTime, captcha: Live.treasure.answer})
                .done(function(result) {
                    if(result.code === 0) {
                        Live.notify.treasure('award', {award: result.data.awardSilver});
                        Live.console.treasure('award', {award: result.data.awardSilver, silver: result.data.silver});
                        Live.treasure.checkNewTask();
                    } else if(result.code == -99) { //在其他地方领取
                        Live.treasure.checkNewTask();
                    } else if(result.code == -400) { //验证码错误
                        Live.treasure.getAward();
                    } else {
                        console.log(result);
                        Live.treasure.checkNewTask();
                    }
                }).fail(function() {
                    Live.countdown(2, function() {
                        Live.treasure.getAward();
                    });
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
            } else {
                console.log(result);
                Live.treasure.getTimes();
            }
        }).fail(function() {
            Live.countdown(2, function() {
                Live.treasure.getTimes();
            });
        });
    },
    getCaptcha: function() {
        return '/freeSilver/getCaptcha?ts=' + Date.now();
    },
    correctQuestion: function(question) {
        var q = '';
        question = question.trim();
        for (var i in question) {
            q += this.correctStr[question[i]] || question[i];
        }
        return q;
    }
};
