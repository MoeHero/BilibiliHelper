/* globals ModuleStore,ModuleDom,ModuleNotify,ModuleConsole */
class FuncSmallTV {
    static init() {
        if(!Live.option.live || !Live.option.live_autoSmallTV) {
            return;
        }
        ModuleDom.smallTV_init();
        FuncSmallTV.countdown = {};
        FuncSmallTV.awardName = {1: '小电视抱枕', 2: '蓝白胖次', 3: 'B坷垃', 4: '喵娘', 5: '爱心便当', 6: '银瓜子', 7: '辣条'};
        Live.sendMessage({command: 'getSmallTV'}, (result) => {
            if(!result.showID) {
                Live.sendMessage({command: 'setSmallTV', showID: Live.showID});
                $(window).on('beforeunload', () => {
                    Live.sendMessage({command: 'getSmallTV'}, (result) => result.showID == Live.showID && Live.sendMessage({command: 'delSmallTV'}));
                });
                Live.getMessage((request) => {
                    if(request.cmd && request.cmd == 'SYS_MSG' && request.tv_id && request.real_roomid) {
                        this.join(request.real_roomid, request.tv_id);
                    }
                });
                ModuleDom.smallTV_setState('enabled');
                ModuleNotify.smallTV('enabled');
                ModuleConsole.smallTV('enabled');
            } else {
                ModuleDom.smallTV_setState('exist', result);
                ModuleConsole.smallTV('exist', result);
            }
        });
    }

    static join(roomID, TVID) {
        $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID}).done((result) => {
            if(result.code === 0) {
                this.countdown[TVID] && this.countdown[TVID].clearCountdown();
                this.countdown[TVID] = new Live.countdown(result.data.dtime, () => this.getAward(TVID));
                ModuleConsole.smallTV('joinSuccess', {roomID:roomID, TVID: TVID});
            } else if(result.code == -400) { //已经错过
                ModuleConsole.smallTV('joinError', result);
            } else {
                console.log(result);
                this.join();
            }
        }).fail(() => {
            Live.countdown(2, () => this.join());
        });
    }

    static getAward(TVID) {
        $.getJSON('/SmallTV/getReward', {id: TVID}).done((result) => {
            result = result.data;
            if(result.status === 0) {
                let award = {awardNumber: result.reward.num, awardName: Live.smallTV.rewardName[result.reward.id]};
                ModuleStore.smallTV('addStatInfo', {key: result.reward.id, count: result.reward.num});
                ModuleStore.smallTV('addCount');
                ModuleNotify.smallTV('award', award);
                ModuleConsole.smallTV('award', award);
            } else if(result.status == 2) { //正在开奖
                Live.countdown(15, () => this.getAward(TVID));
            } else {
                console.log(result);
                this.getAward(TVID);
            }
        }).fail(() => {
            Live.countdown(2, () => this.getAward(TVID));
        });
    }
}
