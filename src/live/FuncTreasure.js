/* globals OCRAD,ModuleStore,ModuleNotify,ModuleConsole */
class FuncTreasure {
    static init() {
        if(!Helper.option.live || !Helper.option.live_autoTreasure || Helper.option.idle_treasureOn) {
            return;
        }
        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        $('.treasure-box-ctnr').remove();
        this.stateIcon = $('<i>').addClass('bh-icon treasure-init');
        this.stateText = $('<span>').text('初始化中...');
        this.timesDom = $('<span>').text('0/0').hide();
        this.countdownDom = $('<span>').text('00:00').hide();
        let funcInfo = $('<a>').addClass('func-info v-top').append(this.stateText, this.timesDom, ' ', this.countdownDom);
        Helper.DOM.funcInfoRow.prepend(this.stateIcon, ' ', funcInfo);
    }
    static addEvent() {
        Helper.sendMessage({command: 'getTreasure'}, result => {
            if(!result.showID) {
                Helper.sendMessage({command: 'setTreasure', showID: Helper.showID});
                $(window).on('beforeunload', () => {
                    Helper.sendMessage({command: 'getTreasure'}, result => result.showID == Helper.showID && Helper.sendMessage({command: 'delTreasure'}));
                });
                ModuleNotify.treasure('enabled');
                ModuleConsole.treasure('enabled');
                Helper.timer(60 * 60 * 1000, () => this.checkNewTask());
            } else {
                this.setStateIcon('exist');
                this.setStateText(Helper.format(Helper.localize.treasure.action.exist, result));
                ModuleConsole.treasure('exist', result);
            }
        });
    }

    static setTimes(times) {
        this.timesDom.text(times).show();
        this.stateText.hide();
    }
    static setStateText(text) {
        this.stateText.text(text).show();
        this.timesDom.hide();
        this.countdownDom.hide();
    }
    static setStateIcon(key) {
        this.stateIcon.attr('class', 'bh-icon treasure-' + key);
    }

    static checkNewTask() {
        if(!ModuleStore.treasure('getEnd')) {
            $.getJSON('/FreeSilver/getCurrentTask?bh').done(result => {
                switch(result.code) {
                    case 0:
                        this.getTimes();
                        this.startTime = result.data.time_start;
                        this.endTime = result.data.time_end;
                        this.countdown && this.countdown.clearCountdown();
                        this.countdown = new Helper.countdown(result.data.minute * 60, () => {
                            this.setStateText('领取中...');
                            this.getAward();
                        }, this.countdownDom.show());
                        this.stateText.hide();
                        this.setStateIcon('processing');
                        break;
                    case -101: //未登录
                        this.setStateIcon('error');
                        this.setStateText(Helper.localize.treasure.action.noLogin);
                        ModuleNotify.treasure('noLogin');
                        ModuleConsole.treasure('noLogin');
                        break;
                    case -10017: //领取完毕
                        ModuleStore.treasure('end');
                        this.setStateIcon('end');
                        this.setStateText(Helper.localize.treasure.action.end);
                        ModuleNotify.treasure('end');
                        ModuleConsole.treasure('end');
                        break;
                    default:
                        console.log(result);
                        break;
                }
            }).fail(() => Helper.countdown(2, () => this.checkNewTask()));
        } else {
            ModuleStore.treasure('end');
            this.setStateIcon('end');
            this.setStateText(Helper.localize.treasure.action.end);
        }
    }
    static getAward() {
        let image = $('<img>').attr('src', '/freeSilver/getCaptcha?ts=' + Date.now()).on('load', () => {
            this.answer = this.calculateCaptcha(OCRAD(image[0]));
            $.getJSON('/FreeSilver/getAward', {time_start: this.startTime, time_end: this.endTime, captcha: this.answer}).done(result => {
                switch(result.code) {
                    case 0:
                        let award = {award: result.data.awardSilver, silver: result.data.silver};
                        ModuleNotify.treasure('award', award);
                        ModuleConsole.treasure('award', award);
                        Helper.addScriptByText(`bh_updateSilverSeed(${result.data.silver});`).remove();
                        this.checkNewTask();
                        break;
                    case -99: //在其他地方领取
                        this.checkNewTask();
                        break;
                    case -400: //错误
                        if(result.msg.includes('验证码')) {
                            this.getAward();
                        } else if(result.msg.includes('未绑定手机')) {
                            this.setStateIcon('error');
                            this.setStateText(Helper.localize.treasure.action.noPhone);
                            ModuleNotify.treasure('noPhone');
                            ModuleConsole.treasure('noPhone');
                        } else {
                            console.log(result);
                        }
                        break;
                    default:
                        console.log(result);
                        break;
                }
            }).fail(() => Helper.countdown(2, () => this.getAward()));
        }).on('error', () => Helper.countdown(2, () => this.getAward()));
    }
    static getTimes() {
        $.getJSON('/i/api/taskInfo').done(result => {
            if(result.code === 0) {
                result = result.data.box_info;
                let maxTimes = result.max_times * 3;
                let times = (result.times - 2) * 3 + result.type;
                this.setTimes(times + '/' + maxTimes);
            } else {
                console.log(result);
            }
        }).fail(() => Helper.countdown(2, () => this.getTimes()));
    }
    static calculateCaptcha(string) {
        let str = '';
        let correctStrings = {g: 9, z: 2, _: 4, Z: 2, o: 0, l: 1, B: 8, O: 0, S: 6, s: 6, i: 1, I: 1};
        for(let s of string) {
            if(s == '+' || s == '-' || s.match(/[0-9]/) !== null) {
                str += s;
            } else {
                str += correctStrings[s] || '';
            }
        }
        return eval(str); //jshint ignore:line
    }
}
