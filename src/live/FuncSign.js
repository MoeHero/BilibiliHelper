/* globals ModuleStore,ModuleNotify,ModuleConsole */
class FuncSign {
    static init() {
        if(!Helper.option.live || !Helper.option.live_autoSign) {
            return;
        }
        if(Helper.userInfo.noLogin) {
            ModuleNotify.sign('noLogin');
            ModuleConsole.sign('noLogin');
            return;
        }
        this.addEvent();
    }

    static addEvent() {
        Helper.sendMessage({cmd: 'get', type: 'Sign'}, result => {
            if(!result.showID) {
                Helper.sendMessage({cmd: 'set', type: 'Sign', showID: Helper.showID});
                $(window).on('beforeunload', () => Helper.sendMessage({cmd: 'del', type: 'Sign'}));
                ModuleNotify.sign('enabled');
                ModuleConsole.sign('enabled');
                Helper.timer(60 * 60 * 1000, () => this.doSign());
            } else {
                ModuleConsole.sign('exist', result);
            }
        });
    }

    // static setSigned() {
    //     $('.sign-in .has-new').remove();
    //     Helper.addScriptByText('bh_setSigned();').remove();
    // }

    static doSign() {
        $.getJSON('//api.live.bilibili.com/sign/doSign').done(result => {
            switch(result.code) {
                case 0:
                    let award = {award: result.data.text};
                    // ModuleStore.sign('set');
                    //this.setSigned();
                    ModuleNotify.sign('award', award);
                    ModuleConsole.sign('award', award);
                    break;
                case -500: //已签到
                    // ModuleStore.sign('set');
                    ModuleNotify.sign('signed');
                    ModuleConsole.sign('signed');
                    break;
                default:
                    console.log(result);
                    break;
            }
        }).fail(() => Helper.countdown(2, () => this.doSign()));
    }
}
