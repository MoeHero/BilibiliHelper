/* globals ModuleStore,ModuleDom,ModuleNotify,ModuleConsole */
class FuncTreasure {
    static init() {
        if(!Live.option.live || !Live.option.live_autoTreasure) {
            return;
        }
        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        ModuleDom.treasure_init();
        this.canvas = document.createElement('canvas');
        this.canvas.width = 120;
        this.canvas.height = 40;
        this.canvas = this.canvas.getContext('2d');
    }
    static addEvent() {
        Live.sendMessage({command: 'getTreasure'}, (result) => {
            if(!result.showID) {
                Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                $(window).on('beforeunload', () => {
                    Live.sendMessage({command: 'getTreasure'}, (result) => result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'}));
                });
                ModuleNotify.treasure('enabled');
                ModuleConsole.treasure('enabled');
                Live.timer(60 * 60 * 1000, () => this.checkNewTask());
            } else {
                ModuleDom.treasure_setState('exist', result);
                ModuleConsole.treasure('exist', result);
            }
        });
    }

    static checkNewTask() {
        if(!ModuleStore.treasure('getEnd')) {
            $.getJSON('/FreeSilver/getCurrentTask?bh').done((result) => {
                if(result.code === 0) {
                    this.getTimes();
                    this.startTime = result.data.time_start;
                    this.endTime = result.data.time_end;
                    this.countdown && this.countdown.clearCountdown();
                    this.countdown = new Live.countdown(result.data.minute * 60, () => {
                        ModuleDom.treasure_setState('awarding');
                        this.getAward();
                    }, ModuleDom.treasure_countdown);
                    ModuleDom.treasure_setState('processing');
                    ModuleDom.treasure_showCountdown();
                } else if(result.code == -101) { //未登录
                    ModuleDom.treasure_setState('noLogin');
                    ModuleNotify.treasure('noLogin');
                    ModuleConsole.treasure('noLogin');
                } else if(result.code == -10017) { //领取完毕
                    ModuleStore.treasure('end');
                    ModuleDom.treasure_setState('end');
                    ModuleNotify.treasure('end');
                    ModuleConsole.treasure('end');
                } else {
                    console.log(result);
                    this.checkNewTask();
                }
            }).fail(function() {
                Live.countdown(2, () => this.checkNewTask());
            });
        } else {
            ModuleDom.treasure_setState('end');
        }
    }

    static getAward() {
        let image = new Image();
        image.onload = () => {
            this.canvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.canvas.drawImage(image, 0, 0);
            this.answer = eval(this.correctQuestion(OCRAD(this.canvas))); //jshint ignore:line
            $.getJSON('/FreeSilver/getAward', {time_start: this.startTime, time_end: this.endTime, captcha: this.answer}).done((result) => {
                if(result.code === 0) {
                    ModuleNotify.treasure('award', {award: result.data.awardSilver});
                    ModuleConsole.treasure('award', {award: result.data.awardSilver, silver: result.data.silver});
                    //TODO 动态更新瓜子数量
                    this.checkNewTask();
                } else if(result.code == -99) { //在其他地方领取
                    this.checkNewTask();
                } else if(result.code == -400) { //验证码错误
                    this.getAward();
                } else {
                    console.log(result);
                }
            }).fail(() => {
                Live.countdown(2, () => this.getAward());
            });
        };
        image.onerror = () => {
            Live.countdown(2, () => this.getAward());
        };
        image.src = '/freeSilver/getCaptcha?ts=' + Date.now();
    }

    static getTimes() {
        $.getJSON('/i/api/taskInfo').done((result) => {
            if(result.code === 0) {
                result = result.data.box_info;
                let maxTimes = result.max_times * 3;
                let times = (result.times - 2) * 3 + result.type;
                ModuleDom.treasure_setTimes(times + '/' + maxTimes);
            } else {
                console.log(result);
            }
        }).fail(() => {
            Live.countdown(2, () => this.getTimes());
        });
    }

    static correctQuestion(question) {
        let q = '';
        let correctStr = {'g': 9, 'z': 2, '_': 4, 'Z': 2, 'o': 0, 'l': 1, 'B': 8, 'O': 0, 'S': 6, 's': 6, 'i': 1, 'I': 1};
        question = question.trim();
        for(let i in question) {
            q += correctStr[question[i]] || question[i];
        }
        return q;
    }
}
