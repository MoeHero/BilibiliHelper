/* globals Live */
Live.treasure = {
    correctStr: {'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1},
    firstStart: false,
    init: function() {
        if(!Live.option.live || !Live.option.live_autoTreasure) {
            return;
        }
        this.canvas = document.createElement('canvas');
        this.canvas.width = 120;
        this.canvas.height = 40;
        this.canvas = this.canvas.getContext('2d');
        Live.dom.treasure.init();
    },
    start: function() {
        if(!Live.store.treasure.isSigned()) {
            Live.sendMessage({command: 'getTreasure'}, function(result) {
                if(!result.showID) {
                    $(window).on('beforeunload', function() {
                        Live.sendMessage({command: 'getTreasure'}, function(result) {
                            result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'});
                        });
                    });
                    Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                    Live.console.treasure('已启动');
                    Live.notify.treasure('start', '已启动');
                    if(!Live.store.treasure.get()) {
                        Live.getMessage(function(request) {
                            if(request.command == 'checkNewTask') {
                                Live.treasure.checkNewTask();
                            }
                        });
                        Live.treasure.checkNewTask();
                    } else {
                        Live.console.treasure('领取完毕');
                        Live.dom.treasure.setState('领取完毕');
                        Live.notify.treasure('end', '领取完毕');
                    }
                } else {
                    Live.sendMessage({command: 'checkNewTask'});
                    Live.dom.treasure.setState('已在' + result.showID + '启动');
                    Live.console.treasure('已在直播间' + result.showID + '启动');
                    Live.notify.treasure('start', '已在直播间' + result.showID + '启动');
                }
            });
        }
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
                Live.notify.treasure('nologin', '请先登录');
            } else if(result.code == -10017) {//领取完毕
                Live.store.treasure.set();
                Live.console.treasure('领取完毕');
                Live.dom.treasure.setState('领取完毕');
                Live.notify.treasure('end', '领取完毕');
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
            $this.answer = eval($this.correctQuestion(OCRAD($this.canvas))); //jshint ignore:line
            $.getJSON('/FreeSilver/getAward', {time_start: $this.startTime, time_end: $this.endTime, captcha: $this.answer})
                .done(function(result) {
                    if(result.code === 0) {//领取成功
                        Live.console.treasure('已领取' + result.data.awardSilver + '瓜子 总瓜子:' + result.data.silver);
                        Live.notify.treasure('get', '已领取' + result.data.awardSilver + '瓜子');
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
