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
        $.getJSON('//api.live.bilibili.com/activity/v1/SummerBattle/check', {roomid: roomID}).done(result => {
            if(result.code === 0) {
                for(let data of result.data) {
                    if(this.list[data.raffleId] === undefined) {
                        $.getJSON('//api.live.bilibili.com/activity/v1/SummerBattle/join', {roomid: roomID, raffleId: data.raffleId}).done(r => {
                            if(r.code === 0) {
                                this.list[data.raffleId] = new Helper.countdown(r.data.time + 10, () => this.getAward(roomID, data.raffleId));
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
        $.getJSON('//api.live.bilibili.com/activity/v1/SummerBattle/notice', {roomid: roomID, raffleId: raffleID}).done(result => {
            switch(result.code) {
                case 0:
                    delete this.list[raffleID];
                    if(!result.msg.includes('很遗憾')) {
                        ModuleStore.addTimes('summer', 1);
                        ModuleNotify.summer('award');
                        ModuleConsole.summer('award');
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
