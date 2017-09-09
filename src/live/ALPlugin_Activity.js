/* globals ModuleStore,ModuleNotify,ModuleConsole */
class ALPlugin_Activity {
    static init() {
        this.list = [];
        if(!Helper.option.live || !Helper.option.live_autoActivity) {
            return;
        }

        this.initDOM();
        this.addEvent();
    }
    static getInfo() {
        let info = {
            name: '开学季抽奖',
            times: ModuleStore.getTimes('school'),
            totalTimes: ModuleStore.getTimes('schoolTotal'),
            statinfo: {}
        };
        if(info.times > 0) {
            info.statinfo['自动铅笔'] = info.times;
        }
        return info;
    }

    static initDOM() {
    }
    static addEvent() {
        Helper.sendMessage({command: 'getActivity'}, result => {
            if(!result.showID) {
                Helper.sendMessage({command: 'setActivity', showID: Helper.showID});
                $(window).on('beforeunload', () => Helper.sendMessage({command: 'delActivity'}));
                Helper.getMessage(request => {
                    if(request.cmd && request.cmd == 'SYS_GIFT' && request.roomid) {
                        this.join(request.roomid);
                    }
                });
                ModuleNotify.activity('enabled');
                ModuleConsole.activity('enabled');
            } else {
                ModuleConsole.activity('exist', result);
            }
        });
    }

    static join(roomID) {
        $.getJSON('//api.live.bilibili.com/activity/v1/SchoolOpen/check', {roomid: roomID}).done(result => {
            if(result.code === 0) {
                for(let data of result.data) {
                    if(this.list[data.raffleId] === undefined) {
                        $.getJSON('//api.live.bilibili.com/activity/v1/SchoolOpen/join', {roomid: roomID, raffleId: data.raffleId}).done(r => {
                            if(r.code === 0) {
                                this.list[data.raffleId] = new Helper.countdown(r.data.time + Math.round(Math.random() * 6 + 9), () => this.getAward(roomID, data.raffleId));
                            } else {
                                console.log(r);
                            }
                        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
                    }
                }
            } else {
                console.log(result);
            }
        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
    }
    static getAward(roomID, raffleID) {
        $.getJSON('//api.live.bilibili.com/activity/v1/SchoolOpen/notice', {roomid: roomID, raffleId: raffleID}).done(result => {
            switch(result.code) {
                case 0:
                    delete this.list[raffleID];
                    ModuleStore.addTimes('schoolTotal', 1);
                    if(!result.msg.includes('很遗憾')) {
                        ModuleStore.addTimes('school', 1);
                        ModuleNotify.activity('award');
                        ModuleConsole.activity('award');
                        console.log(result);
                    }
                    break;
                case -400: //正在开奖
                    Helper.countdown(10, () => this.getAward(roomID, raffleID));
                    break;
                default:
                    console.log(result);
                    break;
            }
        }).fail(() => Helper.countdown(2, () => this.getAward(roomID, raffleID)));
    }
}
