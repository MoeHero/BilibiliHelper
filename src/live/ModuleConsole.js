class ModuleConsole {
    static info(msg, color) {
        color = color || '57D2F7';
        console.log('%c' + msg, 'color:#FFF;background-color:#' + color + ';padding:5px;border-radius:7px;line-height:30px;');
    }
    static warn(msg) {
        console.warn('%c' + msg, 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
    }
    static error(msg) {
        console.error('%c' + msg, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
    }

    static sign(key, param) {
        var sign = Helper.localize.sign;
        var msg = sign.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Helper.localize.enabled;
                break;
            case 'award':
                msg += Helper.format(sign.action.award, param);
                break;
            case 'exist':
                msg += Helper.format(sign.action.exist, param);
                break;
            case 'signed':
                msg += sign.action.signed;
                break;
        }
        this.info(msg);
    }
    static treasure(key, param) {
        var treasure = Helper.localize.treasure;
        var msg = treasure.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Helper.localize.enabled;
                break;
            case 'awarding':
                msg += '领取中...';
                break;
            case 'award':
                msg += Helper.format(treasure.action.award + ' ' + treasure.action.totalSilver, param);
                break;
            case 'exist':
                msg += Helper.format(treasure.action.exist, param);
                break;
            case 'noLogin':
                msg += treasure.action.noLogin;
                break;
            case 'noPhone':
                msg += treasure.action.noPhone;
                break;
            case 'end':
                msg += treasure.action.end;
                break;
        }
        this.info(msg);
    }
    static smallTV(key, param) {
        var smallTV = Helper.localize.smallTV;
        var msg = smallTV.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Helper.localize.enabled;
                break;
            case 'award':
                msg += Helper.format(smallTV.action.award, param);
                break;
            case 'exist':
                msg += Helper.format(smallTV.action.exist, param);
                break;
            case 'joinSuccess':
                msg += smallTV.action.joinSuccess + Helper.format(' RoomID:${roomID} TVID:${TVID}', param);
                break;
        }
        this.info(msg);
    }
    static lighten(key, param) {
        var lighten = Helper.localize.lighten;
        var msg = lighten.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Helper.localize.enabled;
                break;
            case 'award':
                msg += lighten.action.award;
                break;
            case 'exist':
                msg += Helper.format(lighten.action.exist, param);
                break;
        }
        this.info(msg);
    }
}
