class ModuleNotify {
    static create(id, title, message, timeout) {
        if(Live.option.notify) {
            Live.sendMessage({command: 'createNotifications',
                param: {
                    id: id,
                    title: title,
                    message: message,
                    timeout: timeout
                }
            });
        }
    }

    static sign(key, param) {
        let sign = Live.localize.sign;
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(sign.action.award, param);
                break;
            case 'end':
                msg = sign.action.end;
                break;

        }
        Live.option.notify_autoSign && this.create('sign_' + key, Live.localize.helper + ' - ' + sign.title, msg);
    }
    static treasure(key, param) {
        let treasure = Live.localize.treasure;
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(treasure.action.award, param);
                break;
            case 'noLogin':
                msg = treasure.action.noLogin;
                break;
            case 'noPhone':
                msg = treasure.action.noPhone;
                break;
            case 'end':
                msg = treasure.action.end;
        }
        Live.option.notify_autoTreasure && this.create('treasure_' + key, Live.localize.helper + ' - ' + treasure.title, msg);
    }
    static smallTV(key, param) {
        let smallTV = Live.localize.smallTV;
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(smallTV.action.award, param);
                break;
        }
        Live.option.notify_autoSmallTV && this.create('smalltv_' + key, Live.localize.helper + ' - ' + smallTV.title, msg);
    }
    static lighten(key, param) {
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.localize.lighten.action.award;
                break;
        }
        Live.option.notify_autoLighten && this.create('lighten_' + key, Live.localize.helper + ' - ' + Live.localize.lighten.title, msg);
    }
}
