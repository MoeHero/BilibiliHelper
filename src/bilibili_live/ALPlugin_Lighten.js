/* globals ModuleStore,ModuleNotify,ModuleConsole */
class ALPlugin_Lighten {
    static init() {
        if(!Helper.option.live || !Helper.option.live_lighten) {
            return;
        }

        this.addEvent();
    }
    static getInfo() {
        let info = {
            name: '应援棒',
            times: ModuleStore.getTimes('lighten'),
            statinfo: {}
        };
        info.times > 0 && (info.statinfo = {'应援棒': info.times});
        return info;
    }

    static addEvent() {
        Helper.sendMessage({command: 'getLighten'}, (result) => {
            if(!result.showID) {
                Helper.sendMessage({command: 'setLighten', showID: Helper.showID});
                $(window).on('beforeunload', () => Helper.sendMessage({command: 'getLighten'}, (result) => result.showID == Helper.showID && Helper.sendMessage({command: 'delLighten'})));
                Helper.getMessage((request) => {
                    if(request.cmd && request.cmd == 'SYS_MSG' && request.msg && request.msg.includes('领取应援棒') && request.url) {
                        this.getLightenID(request.url.match(/com\/(.+)/)[1]);
                    }
                });
                ModuleNotify.lighten('enabled');
                ModuleConsole.lighten('enabled');
            } else {
                ModuleConsole.lighten('exist', result);
            }
        });
    }

    static getLightenID(showID) {
        Helper.getRoomID(showID, (roomID) => {
            $.getJSON('//api.live.bilibili.com/activity/v1/NeedYou/getLiveInfo', {roomid: roomID}).done((result) => {
                if(result.data.length > 0) {
                    result = result.data[0];
                    if(result.type == 'need_you') {
                        this.getAward(roomID, result.lightenId);
                    } else {
                        console.log(result);
                    }
                }
            }).fail(() => Helper.countdown(2, () => this.join(showID)));
        });
    }
    static getAward(roomID, lightenID) {
        $.post('//api.live.bilibili.com/activity/v1/NeedYou/getLiveAward', {roomid: roomID, lightenId: lightenID}).done((result) => {
            if(result.code === 0) {
                ModuleStore.addTimes('lighten', 1);
                ModuleNotify.lighten('award');
                ModuleConsole.lighten('award');
            } else if(result.code == -400) { //错误
            } else {
                console.log(result);
            }
        }).fail(() => Helper.countdown(2, () => this.getAward(roomID, lightenID)));
    }
}
