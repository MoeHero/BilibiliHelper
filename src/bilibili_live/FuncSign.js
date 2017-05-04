/* globals ModuleStore,ModuleNotify,ModuleConsole */
class FuncSign {
    static init() {
        if(!Live.option.live || !Live.option.live_autoSign) {
            return;
        }
        this.addEvent();
    }

    static addEvent() {
        Live.sendMessage({command: 'getSign'}, (result) => {
            if(!result.showID) {
                Live.sendMessage({command: 'setSign', showID: Live.showID});
                $(window).on('beforeunload', () => Live.sendMessage({command: 'getSign'}, (result) => result.showID == Live.showID && Live.sendMessage({command: 'delSign'})));
                ModuleNotify.sign('enabled');
                ModuleConsole.sign('enabled');
                Live.timer(60 * 60 * 1000, () => this.doSign());
            } else {
                ModuleConsole.sign('exist', result);
            }
        });
    }

    static setSigned() {
        let signBtn = $('.sign-up-btn');
        signBtn.find('.dp-inline-block>span:first-child').hide();
        signBtn.find('.dp-inline-block>.dp-none').show();
        signBtn.find('.has-new').removeClass('has-new');
    }

    static doSign() {
        if(!ModuleStore.sign('get')) {
            $.getJSON('/sign/doSign').done((result) => {
                switch(result.code) {
                    case 0:
                        let award = {award: result.data.text};
                        ModuleStore.sign('set');
                        this.setSigned();
                        ModuleNotify.sign('award', award);
                        ModuleConsole.sign('award', award);
                        break;
                    case -500: //已签到
                        ModuleStore.sign('set');
                        ModuleNotify.sign('signed');
                        ModuleConsole.sign('signed');
                        break;
                    default:
                        console.log(result);
                        break;
                }
            }).fail(() => Live.countdown(2, () => this.doSign()));
        }
    }
}
