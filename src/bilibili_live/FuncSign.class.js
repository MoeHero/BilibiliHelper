/* globals ModuleStore,ModuleDom,ModuleNotify,ModuleConsole */
class FuncSign {
    static init() {
        if(!Live.option.live || !Live.option.live_autoSign) {
            return;
        }
        ModuleNotify.sign('enabled');
        ModuleConsole.sign('enabled');
        Live.timer(60 * 60 * 1000, () => this.do());
    }

    static do() {
        if(!ModuleStore.sign('get')) {
            $.getJSON('/sign/doSign').done((result) => {
                if(result.code === 0) {
                    ModuleStore.sign('set');
                    ModuleDom.sign();
                    ModuleNotify.sign('award', {award: result.data.text});
                    ModuleConsole.sign('award', {award: result.data.text});
                } else if(result.code == -500) { //已签到
                    ModuleStore.sign('set');
                    ModuleConsole.sign('exist');
                } else {
                    console.log(result);
                    this.do();
                }
            }).fail(() => {
                Live.countdown(2, () => Live.sign.do());
            });
        }
    }
}
