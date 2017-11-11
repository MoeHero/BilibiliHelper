/* globals ModuleStore,ModuleNotify,ModuleConsole */
class ALPlugin_Activity {
    static init() {
        this.list = [];
        if(!Helper.option.live || !Helper.option.live_autoActivity) {
            return;
        }
        if(Helper.userInfo.noLogin) {
            ModuleNotify.activity('noLogin');
            ModuleConsole.activity('noLogin');
            return;
        }
        this.addEvent();
    }
    // static getInfo() {
    //     let info = {
    //         name: '开学季抽奖',
    //         times: ModuleStore.getTimes('school'),
    //         statinfo: {}
    //     };
    //     if(info.times > 0) {
    //         info.statinfo['自动铅笔'] = info.times;
    //     }
    //     return info;
    // }

    static addEvent() {
        let $this = this;
        Helper.sendMessage({cmd: 'get', type: 'Activity'}, result => {
            if(!result.showID) {
                $(window).on('beforeunload', () => Helper.sendMessage({cmd: 'del', type: 'Activity'}));
                Helper.sendMessage({cmd: 'set', type: 'Activity', showID: Helper.showID});
                $(document).on('DOMNodeInserted', '.system-msg.news', function() {
                    let info = $(this).find('div a');
                    let roomID = info.attr('href').match(/\/(\d+)/);
                    if(info.text().includes('丰收祭典')) {
                        $this.join(roomID[1]);
                    } else if(info.text().includes('丰实之仓')) {
                        $this.getReceiveGift(roomID[1]);
                    }
                });
                ModuleNotify.activity('enabled');
                ModuleConsole.activity('enabled');
            } else {
                ModuleConsole.activity('exist', result);
            }
        });
    }

    static getReceiveGift(roomID) {
        $.getJSON('//api.live.bilibili.com/activity/v1/Common/getReceiveGift', {roomid: roomID}).done(result => {
            switch(result.code) {
                case 0:
                    break;
                default:
                    console.log(result);
                    break;
            }
        }).fail(() => Helper.countdown(2, () => this.getReceiveGift(roomID)));
    }
    static join(roomID) {
        $.getJSON('//api.live.bilibili.com/activity/v1/Raffle/check', {roomid: roomID}).done(r1 => {
            if(r1.code === 0) {
                for(let data of r1.data) {
                    if(this.list[data.raffleId] === undefined) {
                        $.getJSON('//api.live.bilibili.com/activity/v1/Raffle/join', {roomid: roomID, raffleId: data.raffleId}).done(r2 => {
                            switch(r2.code) {
                                case 0:
                                    this.list[data.raffleId] = new Helper.countdown(r2.data.time + 30, () => this.getAward(roomID, data.raffleId));
                                    break;
                                case -400: //已参加抽奖
                                    break;
                                default:
                                    console.log(r2);
                                    break;
                            }
                        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
                    }
                }
            } else {
                console.log(r1);
            }
        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
    }
    static getAward(roomID, raffleID) {
        $.getJSON('//api.live.bilibili.com/activity/v1/Raffle/notice', {roomid: roomID, raffleId: raffleID}).done(result => {
            switch(result.code) {
                case 0:
                    delete this.list[raffleID];
                    let award = {awardNumber: result.data.gift_num, awardName: result.data.gift_name};
                    // ModuleStore.addStatinfo('smallTV', result.reward.id, result.reward.num);
                    // ModuleStore.addTimes('smallTV', 1);
                    // ModuleNotify.activity('award', award);
                    ModuleConsole.activity('award', award);
                    // if(!result.msg.includes('很遗憾')) {
                    //     ModuleStore.addTimes('school', 1);
                    //     ModuleNotify.activity('award');
                    //     ModuleConsole.activity('award');
                    //     console.log(result);
                    // }
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
