/* globals Live */
class FuncTreasure {
    static init() {
        if(!Live.option.live || !Live.option.live_autoTreasure) {
            return;
        }
        Live.dom.FuncTreasure.init();
        FuncTreasure.canvas = document.createElement('canvas');
        FuncTreasure.canvas.width = 120;
        FuncTreasure.canvas.height = 40;
        FuncTreasure.canvas = FuncTreasure.canvas.getContext('2d');
        Live.sendMessage({command: 'getTreasure'}, (result) => {
            if(!result.showID) {
                Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                $(window).on('beforeunload', () => {
                    Live.sendMessage({command: 'getTreasure'}, (result) => {
                        result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'});
                    });
                });
                Live.getMessage(function(request) {
                    if(request.command == 'checkNewTask') {
                        FuncTreasure.checkNewTask();
                    }
                });
                Live.notify.treasure('enabled');
                Live.console.treasure('enabled');
                FuncTreasure.checkNewTask();
                Live.timer(60 * 60 * 1000, function() {
                    FuncTreasure.checkNewTask();
                });
            } else {
                Live.sendMessage({command: 'checkNewTask'});
                Live.dom.FuncTreasure.setState('exist', result);
                Live.console.treasure('exist', result);
            }
        });
    }

    static checkNewTask() {
        if(!Live.store.FuncTreasure.isEnd()) {
            $.getJSON('/FreeSilver/getCurrentTask').done((result) => {
                if(result.code === 0) {
                    FuncTreasure.getTimes();
                    FuncTreasure.startTime = result.data.time_start;
                    FuncTreasure.endTime = result.data.time_end;
                    FuncTreasure.countdown && FuncTreasure.countdown.clearCountdown();
                    FuncTreasure.countdown = new Live.countdown(result.data.minute * 60, () => {
                        Live.dom.FuncTreasure.setState('awarding');
                        FuncTreasure.getAward();
                    }, Live.dom.FuncTreasure.countdown);
                    Live.dom.FuncTreasure.showCountdown();
                } else if(result.code == -101) { //未登录
                    Live.dom.FuncTreasure.setState('noLogin');
                    Live.notify.treasure('noLogin');
                    Live.console.treasure('noLogin');
                } else if(result.code == -10017) { //领取完毕
                    Live.store.FuncTreasure.setEnd();
                    Live.dom.FuncTreasure.setState('end');
                    Live.notify.treasure('end');
                    Live.console.treasure('end');
                } else {
                    console.log(result);
                    FuncTreasure.checkNewTask();
                }
            }).fail(function() {
                Live.countdown(2, () => {FuncTreasure.checkNewTask();});
            });
        } else {
            Live.dom.FuncTreasure.setState('end');
        }
    }

    static getAward() {
        var image = new Image();
        image.onload = () => {
            FuncTreasure.canvas.clearRect(0, 0, FuncTreasure.canvas.width, FuncTreasure.canvas.height);
            FuncTreasure.canvas.drawImage(image, 0, 0);
            FuncTreasure.answer = eval(FuncTreasure.correctQuestion(OCRAD(FuncTreasure.canvas))); //jshint ignore:line
            $.getJSON('/FreeSilver/getAward', {time_start: FuncTreasure.startTime, time_end: FuncTreasure.endTime, captcha: FuncTreasure.answer})
                .done(function(result) {
                    if(result.code === 0) {
                        Live.notify.treasure('award', {award: result.data.awardSilver});
                        Live.console.treasure('award', {award: result.data.awardSilver, silver: result.data.silver});
                        FuncTreasure.checkNewTask();
                    } else if(result.code == -99) { //在其他地方领取
                        FuncTreasure.checkNewTask();
                    } else if(result.code == -400) { //验证码错误
                        FuncTreasure.getAward();
                    } else {
                        console.log(result);
                        FuncTreasure.checkNewTask();
                    }
                }).fail(() => {
                    Live.countdown(2, () => {FuncTreasure.getAward();});
                });
        };
        image.onerror = () => {
            Live.countdown(2, () => {FuncTreasure.getAward();});
        };
        image.src = '/freeSilver/getCaptcha?ts=' + Date.now();
    }

    static getTimes() {
        $.getJSON('/i/api/taskInfo').done((result) => {
            if(result.code === 0) {
                result = result.data.box_info;
                var maxTimes = result.max_times * 3;
                var times = (result.times - 2) * 3 + result.type;
                Live.dom.FuncTreasure.setTimes(times + '/' + maxTimes);
            } else {
                console.log(result);
                FuncTreasure.getTimes();
            }
        }).fail(() => {
            Live.countdown(2, () => {FuncTreasure.getTimes();});
        });
    }

    static correctQuestion(question) {
        let q = '';
        let correctStr = {'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1};
        question = question.trim();
        for(var i in question) {
            q += correctStr[question[i]] || question[i];
        }
        return q;
    }
}