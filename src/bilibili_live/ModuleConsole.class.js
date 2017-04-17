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
                msg += Live.localize.awarding;
                break;
            case 'award':
                msg += Live.format(treasure.action.award + ' ' + treasure.action.totalSilver, param);
                break;
            case 'exist':
                msg += Live.format(treasure.action.exist, param);
                break;
            case 'noLogin':
                msg += treasure.noLogin;
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
            case 'joinError':
                msg += Live.format(smallTV.action.joinError, param);
                break;
        }
        this.info(msg);
    }
}
