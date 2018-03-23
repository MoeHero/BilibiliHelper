/* globals ModuleStore */
class ModuleCollection {
    static init() {
        this.base_url = 'https://bh.moehero.com/api/helper/';

        new Fingerprint2().get(fingerprint => this.fingerprint = fingerprint);
    }

    static uploadData() {
        $.post(this.base_url + 'userinfo', {
            fid: this.fingerprint,
            info: this.encodeData({
                version: Helper.info.version,
                option: JSON.stringify(Helper.option),
                userAgent: window.navigator.userAgent,
            }),
        });
        $.post(this.base_url + 'statinfo', {
            fid: this.fingerprint,
            info: this.encodeData({
                smalltv_times: ModuleStore.getTimes('smallTV'),
                school_times: ModuleStore.getTimes('school') || 0,
                summer_times: ModuleStore.getTimes('summer') || 0,
                lighten_times: ModuleStore.getTimes('lighten') || 0,
            }),
        });
    }

    static encodeData(data) {
        return window.btoa(JSON.stringify(data));
    }
}
