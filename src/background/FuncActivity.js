/* globals ModuleStore,ModuleNotify,ModuleLogger */
class FuncActivity {
    static init() {
        if(!Helper.options.live.main || !Helper.options.live.activity) return;
        if(Helper.userInfo.noLogin) {
            ModuleNotify.activity(Helper.options.notify.activity.noLogin, '未登录');
            ModuleLogger.activity('未登录');
            return;
        }
        this.list = [];
        ModuleLogger.activity('已启用');
    }

    static join(roomID) {
        $.getJSON('https://api.live.bilibili.com/activity/v1/Raffle/check', {roomid: roomID}).done(r1 => {
            switch(r1.code) {
                case 0:
                    for(let data of r1.data) {
                        if(this.list[data.raffleId] !== undefined) return;
                        this.list[data.raffleId] = 0;
                        $.ajax('https://live.bilibili.com/activity/v1/Raffle/join', {
                            data: {roomid: roomID, raffleId: data.raffleId},
                            dataType: 'json',
                            headers: {
                                Referer: 'https://live.bilibili.com/' + roomID,
                            },
                            success(r2) {
                                switch(r2.code) {
                                    case 0:
                                        this.list[data.raffleId] = Helper.countdown(60, () => this.getAward(data.raffleId, roomID));
                                        break;
                                    case -400: //已参加抽奖
                                        break;
                                    case -500: //系统繁忙
                                        break;
                                    default:
                                        ModuleLogger.printUntreated(r2);
                                        break;
                                }
                            }
                        });
                        // .fail(() => {
                        //     this.list[data.raffleId] = undefined;
                        //     Helper.countdown(2, () => this.join(roomID));
                        // });
                    }
                    break;
                default:
                    ModuleLogger.printUntreated(r1);
                    break;
            }
        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
    }
    static getAward(raffleID, roomID) {
        $.getJSON('https://api.live.bilibili.com/activity/v1/Raffle/notice', {roomid: roomID, raffleId: raffleID}).done(r => {
            switch(r.code) {
                case 0:
                    delete this.list[raffleID];
                    if(r.data.gift_id == -1) return;//未中奖
                    // ModuleStore.addStatinfo('smallTV', result.reward.id, result.reward.num);
                    // ModuleStore.addTimes('smallTV', 1);
                    // ModuleNotify.activity('award', award);
                    ModuleLogger.activity(`获得${r.data.gift_name}x${r.data.gift_num} RaffleID:${raffleID} RoomID:${roomID}`);
                    break;
                case -400: //正在开奖
                    Helper.countdown(30, () => this.getAward(roomID, raffleID));
                    break;
                default:
                    ModuleLogger.printUntreated(r);
                    break;
            }
        });//.fail(() => Helper.countdown(2, () => this.getAward(roomID, raffleID)));
    }
}
