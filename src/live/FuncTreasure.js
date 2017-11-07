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
        this.treasureBox = $('.treasure-box').clone();
        this.statusTextDom = $('<span>').text('初始化');
        this.timesDom = $('<span>').text('0/0').hide();
        this.countdownDom = $('<span>').text('00:00').hide();
        this.treasureBox.find('.awarding-panel').remove();
        this.treasureBox.find('.count-down').empty().append(this.statusTextDom, this.countdownDom, '<br>', this.timesDom);
        this.oldTreasureBox = $('.treasure-box');
        this.oldTreasureBox.hide().parent().append(this.treasureBox);
        //Helper.DOM.funcInfoRow.prepend(this.stateIcon, ' ', funcInfo);
    }
    static addEvent() {
        Helper.sendMessage({cmd: 'get', type: 'Treasure'}, result => {
            if(!result.showID) {
                Helper.sendMessage({cmd: 'set', type: 'Treasure', showID: Helper.showID});
                $(window).on('beforeunload', () => Helper.sendMessage({cmd: 'del', type: 'Treasure'}));
                ModuleNotify.treasure('enabled');
                ModuleConsole.treasure('enabled');
                Helper.timer(60 * 60 * 1000, () => this.checkNewTask());
            } else {
                // this.setStateIcon('exist');
                // this.setStateText(Helper.format(Helper.localize.treasure.action.exist, result));
                this.treasureBox.hide();
                ModuleConsole.treasure('exist', result);
            }
        });
    }

    static setTimes(times) {
        this.timesDom.text(times).show();
        this.statusTextDom.hide();
    }
    static setStateText(text) {
        this.statusTextDom.text(text).show();
        this.timesDom.hide();
        this.countdownDom.hide();
    }
    // static setStateIcon(key) {
    //     this.stateIcon.attr('class', 'bh-icon treasure-' + key);
    // }

    static checkNewTask() {
        $.getJSON('https://api.live.bilibili.com/FreeSilver/getCurrentTask?bh').done(result => {
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
                case -101: //未登录
                    // this.setStateIcon('error');
                    // this.setStateText(Helper.localize.treasure.action.noLogin);
                    this.treasureBox.hide();
                    this.oldTreasureBox.show();
                    ModuleNotify.treasure('noLogin');
                    ModuleConsole.treasure('noLogin');
                    break;
                case -10017: //领取完毕
                    // ModuleStore.treasure('end');
                    // this.setStateIcon('end');
                    // this.setStateText(Helper.localize.treasure.action.end);
                    this.treasureBox.hide();
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
        let image = $('<img>').attr('src', 'https://live.bilibili.com/freeSilver/getCaptcha?ts=' + Date.now()).on('load', () => {
            this.answer = this.getCaptcha(image[0]);
            $.getJSON('https://api.live.bilibili.com/FreeSilver/getAward', {time_start: this.startTime, time_end: this.endTime, captcha: this.answer}).done(result => {
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
                    case -800: //未绑定手机
                        this.setStateText(Helper.localize.noPhone);
                        // this.setStateIcon('error');
                        ModuleNotify.treasure('noPhone');
                        ModuleConsole.treasure('noPhone');
                        break;
                    default:
                        console.log(result);
                        break;
                }
            }).fail(() => Helper.countdown(2, () => this.getAward()));
        }).on('error', () => Helper.countdown(2, () => this.getAward()));
    }
    static getTimes() {
        $.getJSON('https://api.live.bilibili.com/i/api/taskInfo').done(result => {
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
    static getCaptcha(image) {
        let context = $('<canvas>')[0].getContext('2d');
        context.drawImage(image, 0, 0, 120, 40, 0, 0, 120, 40);
        let pixels = context.getImageData(0, 0, 120, 40).data;

        let pix = []; //定义一维数组
        let j = 0;
        for(let i = 1;i <= 40;i++) {
            pix[i] = []; //将每一个子元素又定义为数组
            for(let n = 1;n <= 120;n++) {
                let c = 1;
                if(pixels[j] + pixels[j + 1] + pixels[j + 2] > 200) {
                    c = 0;
                }
                j = j + 4;
                pix[i][n] = c; //此时pix[i][n]可以看作是一个二级数组
            }
        }
        //我们得到了二值化后的像素矩阵pix[40][120]
        //console.log(pix);
        var lie = [];
        lie[0] = 0;
        for(let i=1;i <= 120;i++){
            lie[i] = 0;
            for(let n = 1;n <= 40;n++){
                lie[i] = lie[i] + pix[n][i];
            }
        }
        var ta = [];
        j = 0;
        for(let i = 1;i <= 120;i++){
            if(lie[i] > 0 && lie[i - 1] === 0){
                j++;
                ta[j] = {};
                ta[j].fi = lie[i];
                ta[j].total = 0;
            }
            if(lie[i] > 0){
                ta[j].total = ta[j].total + lie[i];
            }
            if(lie[i - 1] > 0 && lie[i] === 0){
                ta[j].la = lie[i - 1];
            }
        }
        function getWord(a) {
            if(a.total <= 50) {return '-';}
            if(a.total > 120 && a.total < 135) {return '+';}
            if(a.total > 155 && a.total < 162) {return '1';}
            if(a.total > 250 && a.total < 260) {return '2';}
            if(a.total > 286 && a.total < 296) {return '3';}
            if(a.total > 228 && a.total < 237) {return '4';}
            if(a.total > 303 && a.total < 313) {return '5';}
            if(a.total > 189 && a.total < 195) {return '7';}
            if(a.total > 335 && a.total < 342) {return '8';}
            if(a.total > 343 && a.total < 350) {
                if(a.fi > 24 && a.la > 24) {return '0';}
                if(a.fi > 24 && a.la < 24) {return '6';}
                if(a.fi < 24 && a.la > 24) {return '9';}
            }
        }
        //console.log(getWord(ta[1]) + getWord(ta[2]) + getWord(ta[3]) + getWord(ta[4]));
        return eval(getWord(ta[1]) + getWord(ta[2]) + getWord(ta[3]) + getWord(ta[4])); //jshint ignore:line
    }
}
