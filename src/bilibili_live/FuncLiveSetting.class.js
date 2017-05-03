class FuncLiveSetting {
    static init() {
        if(!Live.option.live || !Live.option.live_liveSetting) {
            return;
        }
        this.funcList = {
            gift: {name: '礼物信息', click: this.gift_click, state: true},
            vip: {name: '老爷进场', click: this.vip_click, state: true},
            sysmsg: {name: '系统公告', click: this.sysmsg_click, state: true},
            tvmsg: {name: '小电视公告', click: this.tvmsg_click, state: true},
            'show-admin': {name: '显示房管列表', click: this.show_admin_click, state: false},
            'super-gift': {name: '礼物连击', click: this.super_gift_click, state: true}
        };

        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        this.liveSettingButton = $('<a>').addClass('bh-live-setting-btn f-right live-btn ghost').text('直播设置');
        this.liveSettingPanel = $('<div>').addClass('bh-live-setting-panel live-hover-panel arrow-bottom show').hide();
        this.liveSettingPanel.append($('<h4>').addClass('bh-title').text('直播设置')).append($('<hr>'));
        let ul = $('<ul>');
        let top = -70;
        for(let key in this.funcList) {
            let li = $('<li>').addClass('clear-float');
            li.append($('<span>').text(this.funcList[key].name));
            li.append($('<a>').addClass('bh-live-setting-btns link bili-link f-right').attr('key', key).text(this.funcList[key].state ? '隐藏' : '显示'));
            ul.append(li);
            top += -20;
        }
        this.liveSettingPanel.append(ul).css('top', top + 'px');
        $('.profile-ctrl').append(this.liveSettingPanel).append(this.liveSettingButton);
    }
    static addEvent() {
        this.liveSettingPanel.on('click', (event) => event.stopPropagation());
        $(document).on('click', () => this.liveSettingPanel.fadeOut(200));

        this.liveSettingButton.on('click', (event) => {
            this.liveSettingPanel.fadeToggle(200);
            event.stopPropagation();
        });
        $('.bh-live-setting-btns').on('click', (event) => {
            let button = $(event.currentTarget);
            this.funcList[button.attr('key')].click.call(this);
            button.text(this.funcList[button.attr('key')].state ? '显示' : '隐藏');
            this.funcList[button.attr('key')].state = !this.funcList[button.attr('key')].state;
        });
    }

    static gift_click() {
        if(this.funcList['gift'].state) {
            this.gift_css = Live.addStylesheetByText('.gift-msg{display:none!important;}');
        } else {
            this.gift_css.remove();
            this.chatListScrollToBottom();
        }
    }
    static vip_click() {
        if(this.funcList['vip'].state) {
            this.vip_css = Live.addStylesheetByText('.system-msg{display:none!important;}');
        } else {
            this.vip_css.remove();
            this.chatListScrollToBottom();
        }
    }
    static sysmsg_click() {
        if(this.funcList['sysmsg'].state) {
            this.sysmsg_css = Live.addStylesheetByText('.sys-msg{display:none!important;}');
        } else {
            this.sysmsg_css.remove();
            this.chatListScrollToBottom();
        }
    }
    static tvmsg_click() {
        if(this.funcList['tvmsg'].state) {
            this.tvmsg_css = Live.addStylesheetByText('.small-tv-msg{display:none!important;}');
        } else {
            this.tvmsg_css.remove();
            this.chatListScrollToBottom();
        }
    }
    static show_admin_click() {
        if(this.funcList['show-admin'].state) {
            this.show_admin_css.remove();
        } else {
            this.show_admin_css = Live.addStylesheetByText('.tab-switcher{width:59px!important;}.tab-switcher[data-type=room-admin]{width:62px!important;}');
        }
    }
    static super_gift_click() {
        $('#super-gift-ctnr-haruna').toggleClass('hide');
    }

    static chatListScrollToBottom() {
        $('#chat-msg-list').scrollTop($('#chat-msg-list')[0].scrollHeight);
    }
}
/**/
