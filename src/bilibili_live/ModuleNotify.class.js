class ModuleNotify {
    static create(id, icon, title, message) {
        if(Live.option.notify) {
            Live.sendMessage({command: 'createNotifications',
                param: {
                    id: id,
                    icon: icon,
                    title: title,
                    message: message
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
        }
        Live.option.notify_autoSign && this.create('sign_' + key, 'sign.png', Live.localize.helper + ' - ' + sign.title, msg);
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
        Live.option.notify_autoTreasure && this.create('treasure_' + key, 'treasure.png', Live.localize.helper + ' - ' + treasure.title, msg);
    }
    static smallTV(key, param) {
        let smallTV = Live.localize.smallTV;
        let icon = 'smallTV.png';
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = Live.format(smallTV.action.award, param);
                break;
        }
        Live.option.notify_autoSmallTV && this.create('smallTV_' + key, 'smallTV.png', Live.localize.helper + ' - ' + smallTV.title, msg);
    }
    static lighten(key, param) {
        let lighten = Live.localize.lighten;
        let icon = 'lighten.gif';
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Live.localize.enabled;
                break;
            case 'award':
                msg = lighten.action.award;
                break;
        }
        Live.option.notify_autoLighten && this.create('lighten_' + key, 'lighten.png', Live.localize.helper + ' - ' + lighten.title, msg);
    }
}
