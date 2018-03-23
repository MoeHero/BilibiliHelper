/* globals ModuleNotify,ModuleLogger */
class FuncSign {
    static init() {
        if(!Helper.options.live.main || !Helper.options.live.sign) return;
        if(Helper.userInfo.noLogin) {
            ModuleNotify.sign(Helper.options.notify.sign.noLogin, '未登录');
            ModuleLogger.sign('未登录');
            return;
        }
        this.addEvent();
    }

    static addEvent() {
        Helper.timer(60 * 60 * 1000, () => this.doSign());
        ModuleNotify.sign(Helper.options.notify.sign.enabled, '已启用');
        ModuleLogger.sign('已启用');
    }

    static doSign() {
        $.getJSON('https://api.live.bilibili.com/sign/doSign').done(r => {
            switch(r.code) {
                case 0:
                    ModuleNotify.sign(Helper.options.notify.sign.award, `签到成功 获得奖励: ${r.data.text}`);
                    ModuleLogger.sign(`签到成功 获得奖励: ${r.data.text}`);
                    break;
                case -500: //已签到
                    break;
                default:
                    ModuleLogger.printUntreated(r);
                    break;
            }
        });//.fail(() => Helper.countdown(2, () => this.doSign()));
    }
}
