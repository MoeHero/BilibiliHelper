/* globals ModuleStore,ModuleNotify,ModuleConsole */
class FuncTreasure {
    static init() {
        if(!Helper.option.live || !Helper.option.live_autoTreasure || Helper.option.idle_treasureOn) {
            return;
        }
        if(Helper.userInfo.noLogin) {
            ModuleNotify.treasure('noLogin');
            ModuleConsole.treasure('noLogin');
            return;
        }
        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        this.treasureBox = $('.treasure-box').clone();
        this.statusTextDom = $('<span>').text('初始化');
        this.timesDom = $('<span>').text('0/0').hide();
        this.countdownDom = $('<span>').text('00:00').hide();
        this.treasureBox.find('.awarding-panel').remove();
        this.treasureBox.find('.count-down').empty().append(this.statusTextDom, this.countdownDom, '<br>', this.timesDom);
        $('.treasure-box').parent().empty().append(this.treasureBox);
        //Helper.DOM.funcInfoRow.prepend(this.stateIcon, ' ', funcInfo);
    }
    static addEvent() {
        Helper.sendMessage({cmd: 'get', type: 'Treasure'}, result => {
            if(!result.showID) {
                $(window).on('beforeunload', () => Helper.sendMessage({cmd: 'del', type: 'Treasure'}));
                Helper.sendMessage({cmd: 'set', type: 'Treasure', showID: Helper.showID});
                ModuleNotify.treasure('enabled');
                ModuleConsole.treasure('enabled');
                Helper.timer(60 * 60 * 1000, () => this.checkNewTask());
            } else {
                // this.setStateIcon('exist');
                this.setStateText($('<a class="treasure-link" href="#">').text('已启用').on('click', e => {
                    e.preventDefault();
                    Helper.sendMessage({cmd: 'changeTab'});
                }));
                ModuleConsole.treasure('exist', result);
            }
        });
    }

    static setTimes(times) {
        this.timesDom.text(times).show();
        this.statusTextDom.hide();
    }
    static setStateText(text) {
        this.statusTextDom.html(text).show();
        this.timesDom.hide();
        this.countdownDom.hide();
    }
    // static setStateIcon(key) {
    //     this.stateIcon.attr('class', 'bh-icon treasure-' + key);
    // }

    static checkNewTask() {
        if(!Helper.userInfo.mobileVerify) {
            this.setStateText(Helper.localize.noPhone);
            // this.setStateIcon('error');
            ModuleNotify.treasure('noPhone');
            ModuleConsole.treasure('noPhone');
            return;
        }
        $.getJSON('//api.live.bilibili.com/FreeSilver/getCurrentTask?bh').done(result => {
            switch(result.code) {
                case 0:
                    let times = (result.data.times - 1) * 3 + result.data.minute / 3;
                    this.setTimes(times + '/' + result.data.max_times * 3);
                    //this.getTimes();
                    this.startTime = result.data.time_start;
                    this.endTime = result.data.time_end;
                    this.countdown && this.countdown.clearCountdown();
                    this.countdown = new Helper.countdown(result.data.minute * 60, () => {
                        this.setStateText('领取中');
                        this.getAward();
                    }, this.countdownDom.show());
                    // this.setStateIcon('processing');
                    break;
                case -10017: //领取完毕
                    // ModuleStore.treasure('end');
                    // this.setStateIcon('end');
                    this.setStateText('领取<br>完毕');
                    ModuleNotify.treasure('end');
                    ModuleConsole.treasure('end');
                    break;
                default:
                    console.log(result);
                    break;
            }
        }).fail(() => Helper.countdown(2, () => this.checkNewTask()));
    }
    static getAward() {
        let image = $('<img>').attr('src', '//live.bilibili.com/freeSilver/getCaptcha?ts=' + Date.now()).on('load', () => {
            this.answer = this.getCaptcha(image[0]);
            $.getJSON('//api.live.bilibili.com/FreeSilver/getAward', {time_start: this.startTime, time_end: this.endTime, captcha: this.answer}).done(result => {
                switch(result.code) {
                    case 0:
                        let award = {award: result.data.awardSilver, silver: result.data.silver};
                        ModuleNotify.treasure('award', award);
                        ModuleConsole.treasure('award', award);
                        // Helper.addScriptByText(`bh_updateSilverSeed(${result.data.silver});`).remove();
                        this.checkNewTask();
                        break;
                    case -902: //验证码错误
                        Helper.countdown(5, () => this.getAward());
                        break;
                    case -903: //已领取
                        this.checkNewTask();
                        break;
                    default:
                        console.log(result);
                        break;
                }
            }).fail(() => Helper.countdown(2, () => this.getAward()));
        }).on('error', () => Helper.countdown(2, () => this.getAward()));
    }
    static getCaptcha(image) {
        let context = $('<canvas>')[0].getContext('2d');
        context.drawImage(image, 0, 0, 120, 40, 0, 0, 120, 40);
        let pixels = context.getImageData(0, 0, 120, 40).data;
        this.formula = '';
        let last_line = 0;
        let line = 0;
        var word = {f: 0, l: 0, t: 0};
        for(let y = 1;y <= 120;y++) {
            let i = 0;
            for(let x = 1;x <= 40;x++) {
                if(pixels[i] + pixels[i + 1] + pixels[i + 2] < 200) {
                    line++;
                }
                i = (y - 1) * 4 + (x - 1) * 120 * 4 + 4;
            }
            if(line > 0 && last_line === 0) {
                word.f = line;
            } else if(last_line > 0 && line === 0) {
                word.l = last_line;
                this.formula += getWord(word);
                word.t = 0;
            }
            if(line > 0) {
                word.t += line;
            }
            last_line = line;
            line = 0;
        }
        function getWord(word) {
            if(word.t <= 50) {return '-';}
            if(word.t > 120 && word.t < 135) {return '+';}
            if(word.t > 155 && word.t < 162) {return '1';}
            if(word.t > 250 && word.t < 260) {return '2';}
            if(word.t > 286 && word.t < 296) {return '3';}
            if(word.t > 228 && word.t < 237) {return '4';}
            if(word.t > 303 && word.t < 313) {return '5';}
            if(word.t > 189 && word.t < 195) {return '7';}
            if(word.t > 335 && word.t < 342) {return '8';}
            if(word.t > 343 && word.t < 350) {
                if(word.f > 24 && word.l > 24) {return '0';}
                if(word.f > 24 && word.l < 24) {return '6';}
                if(word.f < 24 && word.l > 24) {return '9';}
            }
        }
        return eval(this.formula); //jshint ignore:line
    }
}
