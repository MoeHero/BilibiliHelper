/* globals ModuleStore,ModuleDom,ModuleNotify,ModuleConsole */
class FuncSign {
    static init() {
        if(!Live.option.live || !Live.option.live_autoSign) {
            return;
        }
        this.event('enabled');
        Live.timer(60 * 60 * 1000, () => this.do());
    }

    static event(key, param = {}) {
        switch(key) {
            case 'enabled':
                ModuleNotify.sign('enabled');
                ModuleConsole.sign('enabled');
                break;
            case 'award':
                ModuleStore.sign('set');
                this.setSigned();
                ModuleNotify.sign('award', param);
                ModuleConsole.sign('award', param);
                break;
            case 'exist':
                ModuleStore.sign('set');
                ModuleConsole.sign('exist');
                break;

        }
    }
    static setSigned() {
        let signBtn = $('.sign-up-btn');
        signBtn.find('.dp-inline-block>span:first-child').hide();
        signBtn.find('.dp-inline-block>.dp-none').show();
        signBtn.find('.has-new').removeClass('has-new');
    }

    static do() {
        if(!ModuleStore.sign('get')) {
            $.getJSON('/sign/doSign').done((result) => {
                if(result.code === 0) {
                    this.event('award', {award: result.data.text});
                } else if(result.code == -500) { //已签到
                    this.event('exist');
                } else {
                    console.log(result);
                }
            }).fail(() => {
                Live.countdown(2, () => this.do());
            });
        }
    }
}
