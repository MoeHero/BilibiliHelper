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
        var sign = Live.localize.sign;
        var msg = '';
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
        var treasure = Live.localize.treasure;
        var msg = '';
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
            case 'end':
                msg = treasure.action.end;
        }
        Live.option.notify_autoTreasure && this.create('treasure_' + key, Live.localize.helper + ' - ' + treasure.title, msg);
    }

    static smallTV(key, param) {
        var smallTV = Live.localize.smallTV;
        var msg = '';
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
}
