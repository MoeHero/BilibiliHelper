class ModuleNotify {
    static create(id, icon, title, message) {
        if(!Helper.options.notify.main) return;
        let xhr = new XMLHttpRequest();
        xhr.open('get', icon);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            if(this.status != 200) return;
            chrome.notifications.create('MGH-' + id.toString(), {
                type: 'basic',
                iconUrl: window.URL.createObjectURL(this.response),
                title: title,
                message: message,
            });
        };
        xhr.send();
    }

    static sign(enabled, msg) {
        if(!Helper.options.notify.sign.main || !enabled) return;
        let icon = 'https://static.hdslb.com/live-static/live-room/images/gift-section/gift-4.png';
        this.create('sign_' + msg, icon, '萌园助手 - 自动签到', msg);
    }
    static treasure(enabled, msg) {
        if(!Helper.options.notify.treasure.main || !enabled) return;
        let icon = 'https://static.hdslb.com/live-static/live-room/images/treasure-box/7.png';
        this.create('treasure_' + msg, icon, '萌园助手 - 自动领瓜子', msg);

        // if(Helper.option['notify_autoTreasure_' + key] === false) {
        //     return;
        // }
        // let treasure = Helper.localize.treasure;
        // let icon = 'https://static.hdslb.com/live-static/live-room/images/treasure-box/7.png';
        // let msg = '';
        // switch(key) {
        //     case 'enabled':
        //         msg = Helper.localize.enabled;
        //         break;
        //     case 'award':
        //         msg = Helper.format(treasure.action.award, param);
        //         break;
        //     case 'noLogin':
        //         msg = treasure.action.noLogin;
        //         break;
        //     case 'noPhone':
        //         msg = treasure.action.noPhone;
        //         break;
        //     case 'end':
        //         msg = treasure.action.end;
        // }
        // if(Helper.option.notify_autoTreasure) this.create('treasure_' + key, icon, Helper.localize.helper + ' - ' + treasure.title, msg);
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
        if(Helper.option.notify_autoSmallTV) this.create('smallTV_' + key, icon, Helper.localize.helper + ' - ' + smallTV.title, msg);
    }
    static activity(key) {
        if(Helper.option['notify_autoActivity_' + key] === false) {
            return;
        }
        let activity = Helper.localize.activity;
        let icon = 'https://static.hdslb.com/live-static/live-room/images/gift-section/gift-84.png';
        let msg = '';
        switch(key) {
            case 'enabled':
                msg = Helper.localize.enabled;
                break;
            case 'award':
                msg = activity.action.award;
                break;
        }
        if(Helper.option.notify_autoActivity) this.create('summer_' + key, icon, Helper.localize.helper + ' - ' + activity.title, msg);
    }
}
