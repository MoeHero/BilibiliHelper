/* globals ModuleStore,ModuleNotify,ModuleConsole */
class ALPlugin_Summer {
    static init() {
        this.list = [];
        // this.awardName = {1: '小电视抱枕', 2: '蓝白胖次', 3: 'B坷垃', 4: '喵娘', 5: '爱心便当', 6: '银瓜子', 7: '辣条'};
        if(!Helper.option.live || !Helper.option.live_autoSummer) {
            return;
        }

        this.initDOM();
        this.addEvent();
    }
    static getInfo() {
        let info = {
            name: '夏日挑战抽奖',
            times: ModuleStore.getTimes('summer'),
            statinfo: {}
        };
        if(info.times > 0) {
            info.statinfo['柠檬茶'] = info.times;
        }
        return info;
    }

    static initDOM() {
    }
    static addEvent() {
        Helper.sendMessage({command: 'getSummer'}, result => {
            if(!result.showID) {
                Helper.sendMessage({command: 'setSummer', showID: Helper.showID});
                $(window).on('beforeunload', () => Helper.sendMessage({command: 'getSummer'}, result => result.showID == Helper.showID && Helper.sendMessage({command: 'delSummer'})));
                Helper.getMessage(request => {
                    if(request.cmd && request.cmd == 'SYS_GIFT' && request.roomid && request.msg.includes('一起来打水仗吧')) {
                        this.join(request.roomid);
                    }
                });
                ModuleNotify.summer('enabled');
                ModuleConsole.summer('enabled');
            } else {
                ModuleConsole.summer('exist', result);
            }
        });
    }

    static join(roomID) {
        $.getJSON('http://api.live.bilibili.com/activity/v1/SummerBattle/check', {roomid: roomID}).done(result => {
            if(result.code === 0) {
                $.getJSON('http://api.live.bilibili.com/activity/v1/SummerBattle/join', {roomid: roomID, raffleId: result.data.raffleId}).done(result => {
                    if(result.code === 0) {
                        let raffleID = result.data.raffleId;
                        this.list[raffleID] = new Helper.countdown(result.data.time, () => this.getAward(roomID, raffleID), this.list[raffleID].countdown_dom);
                    }
                }).fail(() => Helper.countdown(2, () => this.join(roomID)));
            } else {
                console.log(result);
            }
        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
    }
    static getAward(roomID, raffleID) {
        $.getJSON('http://api.live.bilibili.com/activity/v1/SummerBattle/notice', {roomid: roomID, raffleId: raffleID}).done(result => {
            if(!result.msg.includes('很遗憾')) {
                delete this.list[raffleID];
                ModuleStore.addTimes('summer', 1);
                ModuleNotify.summer('award');
                ModuleConsole.summer('award');
                console.log(result);
            }
        }).fail(() => Helper.countdown(2, () => this.getAward(roomID, raffleID)));
    }
}
