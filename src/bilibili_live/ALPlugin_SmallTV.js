/* globals ModuleStore,ModuleDom,ModuleNotify,ModuleConsole */
class ALPlugin_SmallTV {
    static init() {
        this.countdown = {};
        this.awardName = {1: '小电视抱枕', 2: '蓝白胖次', 3: 'B坷垃', 4: '喵娘', 5: '爱心便当', 6: '银瓜子', 7: '辣条'};
        if(!Live.option.live || !Live.option.live_autoSmallTV) {
            return;
        }

        this.initDOM();
        this.addEvent();
    }
    static getInfo() {
        let info = {};
        info.name = '小电视抽奖';
        info.times = ModuleStore.getTimes('smallTV');
        info.statinfo = [];
        let statinfos = ModuleStore.getStatinfo('smallTV');
        for(let key in statinfos) {
            info.statinfo[this.awardName[key]] = statinfos[key];
        }
        return info;
    }

    static initDOM() {
        $('.treasure-box-ctnr').remove();
        this.stateIcon = $('<i>').addClass('bh-icon tv-init');
        this.stateText = $('<a>').addClass('func-info v-top').text('初始化中...');
        Live.DOM.funcInfoRow.prepend(this.stateIcon, this.stateText);
    }
    static addEvent() {
        Live.sendMessage({command: 'getSmallTV'}, (result) => {
            if(!result.showID) {
                Live.sendMessage({command: 'setSmallTV', showID: Live.showID});
                $(window).on('beforeunload', () => Live.sendMessage({command: 'getSmallTV'}, (result) => result.showID == Live.showID && Live.sendMessage({command: 'delSmallTV'})));
                Live.getMessage((request) => {
                    if(request.cmd && request.cmd == 'SYS_MSG' && request.tv_id && request.real_roomid) {
                        this.join(request.real_roomid, request.tv_id);
                    }
                });
                this.event('enabled');
            } else {
                this.event('exist', result);
            }
        });
    }

    static event(key, param) {
        switch(key) {
            case 'enabled':
                this.stateIcon.attr('class', 'bh-icon tv-enabled');
                this.stateText.text(Live.localize.enabled);
                ModuleNotify.smallTV('enabled');
                ModuleConsole.smallTV('enabled');
                break;
            case 'exist':
                this.stateIcon.attr('class', 'bh-icon tv-exist');
                this.stateText.text(Live.format(Live.localize.smallTV.action.exist, param));
                ModuleConsole.smallTV('exist', param);
                break;
            case 'award':
                ModuleStore.addTimes('smallTV', 1);
                ModuleNotify.smallTV('award', param);
                ModuleConsole.smallTV('award', param);
                break;
        }
    }

    static join(roomID, TVID) {
        $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID}).done((result) => {
            if(result.code === 0) {
                this.countdown[TVID] && this.countdown[TVID].clearCountdown();
                this.countdown[TVID] = new Live.countdown(result.data.dtime, () => this.getAward(TVID));
                ModuleConsole.smallTV('joinSuccess', {roomID:roomID, TVID: TVID});
            } else if(result.code == -400) { //已经错过
            } else {
                console.log(result);
            }
        }).fail(() => Live.countdown(2, () => this.join()));
    }
    static getAward(TVID) {
        $.getJSON('/SmallTV/getReward', {id: TVID}).done((result) => {
            result = result.data;
            if(result.status === 0) {
                ModuleStore.addStatinfo('smallTV', result.reward.id, result.reward.num);
                this.event('award', {awardNumber: result.reward.num, awardName: this.awardName[result.reward.id]});
            } else if(result.status == 2) { //正在开奖
                Live.countdown(10, () => this.getAward(TVID));
            } else {
                console.log(result);
            }
        }).fail(() => Live.countdown(2, () => this.getAward(TVID)));
    }
}
