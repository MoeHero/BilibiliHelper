class ModuleConsole {
    static info(msg, color = '57D2F7') {
        console.log('%c' + msg, 'color:#FFF;background-color:#' + color + ';padding:5px;border-radius:7px;line-height:30px;');
    }
    static warn(msg) {
        console.warn('%c' + msg, 'color:#FFF;background-color:#F29F3F;padding:5px;border-radius:7px;line-height:30px;');
    }
    static error(msg) {
        console.error('%c' + msg, 'color:#FFF;background-color:#EB3F2F;padding:5px;border-radius:7px;line-height:30px;');
    }

    static sign(key, param) {
        var sign = Live.localize.sign;
        var msg = sign.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Live.localize.enabled;
                break;
            case 'award':
                msg += Live.format(sign.action.award, param);
                break;
            case 'exist':
                msg += Live.format(sign.action.exist, param);
                break;
            case 'signed':
                msg += sign.action.signed;
                break;
        }
        this.info(msg);
    }
    static treasure(key, param) {
        var treasure = Live.localize.treasure;
        var msg = treasure.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Live.localize.enabled;
                break;
            case 'awarding':
                msg += '领取中...';
                break;
            case 'award':
                msg += Live.format(treasure.action.award + ' ' + treasure.action.totalSilver, param);
                break;
            case 'exist':
                msg += Live.format(treasure.action.exist, param);
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
        var smallTV = Live.localize.smallTV;
        var msg = smallTV.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Live.localize.enabled;
                break;
            case 'award':
                msg += Live.format(smallTV.action.award, param);
                break;
            case 'exist':
                msg += Live.format(smallTV.action.exist, param);
                break;
            case 'joinSuccess':
                msg += smallTV.action.joinSuccess + Live.format(' RoomID:${roomID} TVID:${TVID}', param);
                break;
        }
        this.info(msg);
    }
    static lighten(key, param) {
        var lighten = Live.localize.lighten;
        var msg = lighten.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Live.localize.enabled;
                break;
            case 'award':
                msg += lighten.action.award;
                break;
            case 'exist':
                msg += Live.format(lighten.action.exist, param);
                break;
        }
        this.info(msg);
    }
}
