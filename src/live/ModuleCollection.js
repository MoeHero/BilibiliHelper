/* globals ModuleStore, store */
class ModuleCollection {
    static init() {
        this.base_url = 'https://bh.moehero.com/api/helper/';
        if(Helper.userInfo.noLogin) {
            return;
        }
        $.post(this.base_url + 'userinfo', {
            uid: Helper.userInfo.uid,
            info: this.encodeData({
                version: Helper.info.version,
                option: JSON.stringify(Helper.option),
                userAgent: window.navigator.userAgent,
            })
        });
        $.post(this.base_url + 'statinfo', {
            uid: Helper.userInfo.uid,
            info: this.encodeData({
                smalltv_times: ModuleStore.getTimes('smallTV'),
                school_times: ModuleStore.getTimes('school') || 0,
                summer_times: ModuleStore.getTimes('summer') || 0,
                lighten_times: ModuleStore.getTimes('lighten') || 0,
            })
        });
    }

    static encodeData(data) {
        return window.btoa(JSON.stringify(data));
    }
}
