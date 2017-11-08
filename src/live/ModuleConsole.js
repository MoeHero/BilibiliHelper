class ModuleConsole {
    static info(msg, color) {
        color = color || '57D2F7';
        console.log('%cInfo%c [' + (new Date()).Format('yyyy-MM-dd hh:mm:ss.S') + '] ' + msg, 'color:#FFF;background-color:#' + color + ';padding:5px;line-height:21px', '');
    }
    static warn(msg) {
        console.log('%cWarning%c [' + (new Date()).Format('yyyy-MM-dd hh:mm:ss.S') + '] ' + msg, 'color:#FFF;background-color:#F29F3F;padding:5px;line-height:21px', '');
    }
    static error(msg) {
        console.log('%cError%c [' + (new Date()).Format('yyyy-MM-dd hh:mm:ss.S') + '] ' + msg, 'color:#FFF;background-color:#EB3F2F;padding:5px;line-height:21px', '');
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
                msg += Helper.format(Helper.localize.exist, param);
                break;
            case 'noLogin':
                msg += Helper.localize.noLogin;
                break;
            case 'noPhone':
                msg += Helper.localize.noPhone;
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
            case 'award':
                msg += Helper.format(treasure.action.award + ' ' + treasure.action.totalSilver, param);
                break;
            case 'exist':
                msg += Helper.format(Helper.localize.exist, param);
                break;
            case 'noLogin':
                msg += Helper.localize.noLogin;
                break;
            case 'noPhone':
                msg += Helper.localize.noPhone;
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
                msg += Helper.format(Helper.localize.exist, param);
                break;
            case 'noLogin':
                msg += Helper.localize.noLogin;
                break;
        }
        this.info(msg);
    }
    static activity(key, param) {
        var activity = Helper.localize.activity;
        var msg = activity.title + ': ';
        switch(key) {
            case 'enabled':
                msg += Helper.localize.enabled;
                break;
            case 'award':
                msg += Helper.format(activity.action.award, param);
                break;
            case 'exist':
                msg += Helper.format(Helper.localize.exist, param);
                break;
            case 'noLogin':
                msg += Helper.localize.noLogin;
                break;
        }
        this.info(msg);
    }
}
