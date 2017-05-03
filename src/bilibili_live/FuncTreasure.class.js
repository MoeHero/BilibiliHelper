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
        $('.treasure-box-ctnr').remove();
        this.stateIcon = $('<i>').addClass('bh-icon treasure-init');
        this.stateText = $('<span>').text('初始化中...');
        this.timesDom = $('<span>').text('0/0').hide();
        this.countdownDom = $('<span>').text('00:00').hide();
        let funcInfo = $('<a>').addClass('func-info v-top').append(this.stateText).append(this.timesDom).append(' ').append(this.countdownDom);
        Live.DOM.funcInfoRow.prepend(funcInfo).prepend(this.stateIcon);
    }
    static addEvent() {
        Live.sendMessage({command: 'getTreasure'}, (result) => {
            if(!result.showID) {
                Live.sendMessage({command: 'setTreasure', showID: Live.showID});
                $(window).on('beforeunload', () => {
                    Live.sendMessage({command: 'getTreasure'}, (result) => result.showID == Live.showID && Live.sendMessage({command: 'delTreasure'}));
                });
                this.event('enabled');
                Live.timer(60 * 60 * 1000, () => this.checkNewTask());
            } else {
                this.event('exist', result);
            }
        });
    }

    static event(key, param) {
        switch(key) {
            case 'enabled':
                ModuleNotify.treasure('enabled');
                ModuleConsole.treasure('enabled');
                break;
            case 'processing':
                this.stateIcon.attr('class', 'bh-icon treasure-processing');
                break;
            case 'awarding':
                this.stateText.text('领取中...').show();
                this.timesDom.hide();
                this.countdownDom.hide();
                break;
            case 'noLogin':
                this.stateIcon.attr('class', 'bh-icon treasure-error');
                this.stateText.text(Live.localize.treasure.action.noLogin).show();
                this.timesDom.hide();
                this.countdownDom.hide();
                ModuleNotify.treasure('noLogin');
                ModuleConsole.treasure('noLogin');
                break;
            case 'noPhone':
                this.stateIcon.attr('class', 'bh-icon treasure-error');
                this.stateText.text(Live.localize.treasure.action.noPhone).show();
                this.timesDom.hide();
                this.countdownDom.hide();
                ModuleNotify.treasure('noPhone');
                ModuleConsole.treasure('noPhone');
                break;
            case 'end':
                ModuleStore.treasure('end');
                this.stateIcon.attr('class', 'bh-icon treasure-end');
                this.stateText.text(Live.localize.treasure.action.end).show();
                this.timesDom.hide();
                this.countdownDom.hide();
                ModuleNotify.treasure('end');
                ModuleConsole.treasure('end');
                break;
            case 'exist':
                this.stateIcon.attr('class', 'bh-icon treasure-exist');
                this.stateText.text(Live.format(Live.localize.treasure.action.exist, param)).show();
                this.timesDom.hide();
                this.countdownDom.hide();
                ModuleConsole.treasure('exist', param);
                break;
            case 'award':
                ModuleNotify.treasure('award', param);
                ModuleConsole.treasure('award', param);
                break;
        }
    }
    static setTimes(times) {
        this.timesDom.text(times).show();
        this.stateText.hide();
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
                        this.event('awarding');
                        this.getAward();
                    }, this.countdownDom.show());
                    this.stateText.hide();
                    this.event('processing');
                } else if(result.code == -101) { //未登录
                    this.event('noLogin');
                } else if(result.code == -10017) { //领取完毕
                    this.event('end');
                } else {
                    console.log(result);
                }
            }).fail(() => Live.countdown(2, () => this.checkNewTask()));
        } else {
            ModuleStore.treasure('end');
            this.stateIcon.attr('class', 'bh-icon treasure-end');
            this.stateText.text(Live.localize.treasure.action.end).show();
            this.timesDom.hide();
            this.countdownDom.hide();
        }
    }
    static getAward() {
        let image = new Image();
        image.onload = () => {
            this.answer = eval(this.correctQuestion(OCRAD(image))); //jshint ignore:line
            $.getJSON('/FreeSilver/getAward', {time_start: this.startTime, time_end: this.endTime, captcha: this.answer}).done((result) => {
                if(result.code === 0) {
                    this.event('award', {award: result.data.awardSilver, silver: result.data.silver});
                    Live.addScriptByText(`bh_updateSilverSeed(${result.data.silver});`).remove();
                    this.checkNewTask();
                } else if(result.code == -99) { //在其他地方领取
                    this.checkNewTask();
                } else if(result.code == -400 && result.msg.includes('验证码')) { //验证码出错
                    this.getAward();
                } else if(result.code == -400 && result.msg == '未绑定手机') { //未绑定手机
                    this.event('noPhone');
                } else {
                    console.log(result);
                }
            }).fail(() => Live.countdown(2, () => this.getAward()));
        };
        image.onerror = () => Live.countdown(2, () => this.getAward());
        image.src = '/freeSilver/getCaptcha?ts=' + Date.now();
    }
    static getTimes() {
        $.getJSON('/i/api/taskInfo').done((result) => {
            if(result.code === 0) {
                result = result.data.box_info;
                let maxTimes = result.max_times * 3;
                let times = (result.times - 2) * 3 + result.type;
                this.setTimes(times + '/' + maxTimes);
            } else {
                console.log(result);
            }
        }).fail(() => Live.countdown(2, () => this.getTimes()));
    }
    static correctQuestion(question) {
        let q = '';
        let correctStr = {g: 9, z: 2, _: 4, Z: 2, o: 0, l: 1, B: 8, O: 0, S: 6, s: 6, i: 1, I: 1};
        question = question.trim();
        for(let i in question) {
            q += correctStr[question[i]] || question[i];
        }
        return q;
    }
}
