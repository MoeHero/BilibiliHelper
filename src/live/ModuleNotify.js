class ModuleNotify {
    static create(id, icon, title, message) {
        if(Helper.option.notify) {
            Helper.sendMessage({command: 'createNotifications',
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
        if(Helper.option['notify_autoSign_' + key] === false) {
            return;
        }
        let sign = Helper.localize.sign;
        let icon = 'https://static.hdslb.com/live-static/live-room/images/gift-section/gift-1.gif';
        let msg = '';
        switch(key) {
            case 'enabled':
                if(!Helper.option.notify_autoSign_enabled) {
                    return;
                }
                msg = Helper.localize.enabled;
                break;
            case 'award':
                msg = Helper.format(sign.action.award, param);
                break;
            case 'signed':
                msg += Helper.format(sign.action.signed, param);
                break;
        }
        Helper.option.notify_autoSign && this.create('sign_' + key, icon, Helper.localize.helper + ' - ' + sign.title, msg);
    }
    static treasure(key, param) {
        if(Helper.option['notify_autoTreasure_' + key] === false) {
            return;
        }
        let treasure = Helper.localize.treasure;
        let icon = 'https://static.hdslb.com/live-static/live-room/images/treasure-box/7.png';
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Helper.localize.enabled;
                break;
            case 'award':
                msg = Helper.format(treasure.action.award, param);
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
        Helper.option.notify_autoTreasure && this.create('treasure_' + key, icon, Helper.localize.helper + ' - ' + treasure.title, msg);
    }
    static smallTV(key, param) {
        if(Helper.option['notify_autoSmallTV_' + key] === false) {
            return;
        }
        let smallTV = Helper.localize.smallTV;
        let icon = 'https://static.hdslb.com/live-static/live-room/images/gift-section/gift-25.png';
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Helper.localize.enabled;
                break;
            case 'award':
                msg = Helper.format(smallTV.action.award, param);
                break;
        }
        Helper.option.notify_autoSmallTV && this.create('smallTV_' + key, icon, Helper.localize.helper + ' - ' + smallTV.title, msg);
    }
}
