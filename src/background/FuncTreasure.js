/* globals ModuleNotify,ModuleLogger */
class FuncTreasure {
    static init() {
        if(!Helper.options.live.main || !Helper.options.live.treasure) return;
        if(Helper.userInfo.noLogin) {
            ModuleNotify.treasure(Helper.options.notify.treasure.noLogin, '未登录');
            ModuleLogger.treasure('未登录');
            return;
        }
        if(!Helper.userInfo.mobileVerify) {
            ModuleNotify.treasure(Helper.options.notify.treasure.noPhone, '未绑定手机');
            ModuleLogger.treasure('未绑定手机');
            return;
        }
        this.addEvent();
    }

    static addEvent() {
        Helper.timer(60 * 60 * 1000, () => this.checkNewTask());
        ModuleNotify.treasure(Helper.options.notify.treasure.enabled, '已启用');
        ModuleLogger.treasure('已启用');
    }

    static checkNewTask() {
        $.getJSON('https://api.live.bilibili.com/lottery/v1/SilverBox/getCurrentTask?bh').done(r => {
            switch(r.code) {
                case 0:
                    this.currentTimes = (r.data.times - 1) * 3 + r.data.minute / 3;
                    this.maxTimes = r.data.max_times * 3;
                    this.startTime = r.data.time_start;
                    this.endTime = r.data.time_end;
                    if(this.countdown) this.countdown.clearCountdown();
                    this.countdown = Helper.countdown(r.data.minute * 60, () => {
                        this.getAward();
                    });
                    break;
                case -10017: //领取完毕
                    ModuleNotify.treasure(Helper.options.notify.treasure.end, '领取完毕');
                    ModuleLogger.treasure('领取完毕');
                    break;
                default:
                    ModuleLogger.printUntreated(r);
                    break;
            }
        });//.fail(() => Helper.countdown(2, () => this.checkNewTask()));
    }
    static getAward() {
        $.getJSON('https://api.live.bilibili.com/lottery/v1/SilverBox/getCaptcha?ts=' + Date.now()).done(r1 => {
            switch(r1.code) {
                case 0:
                    let image = $('<img>').attr('src', r1.data.img).on('load', () => {
                        this.answer = this.getCaptcha(image[0]);
                        $.getJSON('https://api.live.bilibili.com/lottery/v1/SilverBox/getAward', {time_start: this.startTime, end_time: this.endTime, captcha: this.answer}).done(r2 => {
                            switch(r2.code) {
                                case 0:
                                    ModuleNotify.treasure(Helper.options.notify.treasure.award, `已领取${r2.data.awardSilver}瓜子 总瓜子:${r2.data.silver}`);
                                    ModuleLogger.treasure(`已领取${r2.data.awardSilver}瓜子 总瓜子:${r2.data.silver}`);
                                    this.checkNewTask();
                                    break;
                                case -901: //验证码过期
                                case -902: //验证码错误
                                    Helper.countdown(5, () => this.getAward());
                                    break;
                                case -500: //领取时间未到
                                    this.checkNewTask();
                                    break;
                                default:
                                    ModuleLogger.printUntreated(r2);
                                    break;
                            }
                        });//.fail(() => Helper.countdown(2, () => this.getAward()));
                    });
                    break;
                default:
                    ModuleLogger.printUntreated(r1);
                    break;
            }
        });
    }
    static getCaptcha(image) {
        let context = $('<canvas>')[0].getContext('2d');
        context.drawImage(image, 0, 0, 120, 40, 0, 0, 120, 40);
        let pixels = context.getImageData(0, 0, 120, 40).data;
        this.formula = '';
        let last_line = 0;
        let line = 0;
        let word = {f: 0, l: 0, t: 0};
        for(let y = 1;y <= 120;y++) {
            let i = 0;
            for(let x = 1;x <= 40;x++) {
                if(pixels[i] + pixels[i + 1] + pixels[i + 2] < 200) line++;
                i = (y - 1) * 4 + (x - 1) * 120 * 4 + 4;
            }
            if(line > 0 && last_line === 0) {
                word.f = line;
            } else if(last_line > 0 && line === 0) {
                word.l = last_line;
                this.formula += getWord(word);
                word.t = 0;
            }
            if(line > 0) word.t += line;
            last_line = line;
            line = 0;
        }
        function getWord(word) {
            if(word.t <= 50) return '-';
            if(word.t > 120 && word.t < 135) return '+';
            if(word.t > 155 && word.t < 162) return '1';
            if(word.t > 250 && word.t < 260) return '2';
            if(word.t > 286 && word.t < 296) return '3';
            if(word.t > 228 && word.t < 237) return '4';
            if(word.t > 303 && word.t < 313) return '5';
            if(word.t > 189 && word.t < 195) return '7';
            if(word.t > 335 && word.t < 342) return '8';
            if(word.t > 343 && word.t < 350) {
                if(word.f > 24 && word.l > 24) return '0';
                if(word.f > 24 && word.l < 24) return '6';
                if(word.f < 24 && word.l > 24) return '9';
            }
        }
        return eval(this.formula); //jshint ignore:line
    }
}
