/* globals ModuleStore,ModuleNotify,ModuleLogger */
class FuncSmallTV {
    static init() {
        if(!Helper.options.live.main || !Helper.options.live.smalltv) return;
        if(Helper.userInfo.noLogin) {
            ModuleNotify.smallTV(Helper.options.notify.smalltv.noLogin, '未登录');
            ModuleLogger.smallTV('未登录');
            return;
        }
        this.list = [];
        ModuleLogger.smallTV('已启用');
    }

    static join(raffleID, roomID) {
        $.getJSON('https://api.live.bilibili.com/gift/v2/smalltv/join', {roomid: roomID, raffleId: raffleID}).done(r => {
            switch(r.code) {
                case 0:
                    this.list[raffleID] = Helper.countdown(r.data.time + 30, () => this.getAward(raffleID, roomID));
                    break;
                case -400: //已参加抽奖
                    break;
                default:
                    ModuleLogger.printUntreated(r);
                    break;
            }
        });
        //     .fail(() => {
        //     this.list[raffleID] = undefined;
        //     Helper.countdown(2, () => this.join(roomID));
        // });
    }
    static getAward(raffleID, roomID) {
        $.getJSON('https://api.live.bilibili.com/gift/v2/smalltv/notice', {roomid: roomID, raffleId: raffleID}).done(r => {
            switch(r.data.status) {
                case 2:
                    delete this.list[raffleID];
                    // ModuleStore.addStatinfo('smallTV', result.reward.id, result.reward.num);
                    // ModuleStore.addTimes('smallTV', 1);
                    // Helper.option['notify_autoSmallTV_award_' + result.data.gift_id] && ModuleNotify.smallTV('award', award);
                    ModuleLogger.smallTV(`获得${r.data.gift_name}x${r.data.gift_num} RaffleID:${raffleID} RoomID:${roomID}`);
                    break;
                case 3: //正在开奖
                    Helper.countdown(30, () => this.getAward(roomID, raffleID));
                    break;
                default:
                    ModuleLogger.printUntreated(r);
                    break;
            }
        });//.fail(() => Helper.countdown(2, () => this.getAward(roomID, raffleID)));
    }
}
