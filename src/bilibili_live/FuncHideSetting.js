/* globals store */
class FuncHideSetting {
    static init() {
        if(!Live.option.live || !Live.option.live_hideSetting) {
            return;
        }
        this.funcList = {
            gift: {
                name: '礼物信息',
                css: '.gift-msg{display:none!important;}',
                state: true
            },
            vip: {
                name: '老爷进场',
                css: '.system-msg{display:none!important;}',
                state: true
            },
            sysmsg: {
                name: '系统公告',
                css: '.sys-msg{display:none!important;}',
                state: true
            },
            tvmsg: {
                name: '小电视公告',
                css: '.small-tv-msg{display:none!important;}',
                state: true
            },
            link: {
                name: '应援团相关',
                css: '.bilibili-link{display:none!important;}',
                state: true
            },
            'super-gift': {
                name: '礼物连击',
                css: '#super-gift-ctnr-haruna{display:none!important;}',
                state: true
            }
        };

        this.getSetting();

        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        this.liveSettingButton = $('<a>').addClass('bh-hide-setting-btn f-right live-btn ghost').text('屏蔽设置');
        this.liveSettingPanel = $('<div>').addClass('bh-hide-setting-panel live-hover-panel arrow-bottom show').hide();
        this.liveSettingPanel.append($('<h4>').addClass('bh-title').text('屏蔽设置')).append($('<hr>'));
        let ul = $('<ul>');
        let top = -70;
        for(let key in this.funcList) {
            let li = $('<li>').addClass('clear-float').append($('<span>').text(this.funcList[key].name));
            let button = $('<a>').addClass('f-right live-btn').attr('key', key).on('click', (e) => this.buttonClickEvent($(e.currentTarget)));
            this.funcList[key].showButton = button.clone(true).addClass(this.funcList[key].state ? 'default' : 'ghost').text('显示');
            this.funcList[key].hideButton = button.clone(true).addClass(this.funcList[key].state ? 'ghost' : 'default').text('隐藏');
            !this.funcList[key].state && (this.funcList[key].cssDOM = Live.addStylesheetByText(this.funcList[key].css));
            li.append(this.funcList[key].showButton, this.funcList[key].hideButton);
            ul.append(li);
            top += -27;
        }
        this.liveSettingPanel.append(ul).css('top', top + 'px');
        $('.profile-ctrl').append(this.liveSettingPanel).append(this.liveSettingButton);
    }
    static addEvent() {
        this.liveSettingPanel.stopPropagation();
        $(document).on('click', () => this.liveSettingPanel.fadeOut(200));

        this.liveSettingButton.on('click', () => this.liveSettingPanel.fadeToggle(200)).stopPropagation();
    }

    static getSetting()　{
        let setting = store.get('BH_HideSetting')[Live.roomID] || {};
        for(let key in this.funcList) {
            setting[key] !== undefined && (this.funcList[key].state = setting[key]);
        }
    }
    static saveSetting() {
        let setting = store.get('BH_HideSetting') || {};
        !setting[Live.roomID] && (setting[Live.roomID] = {});
        for(let key in this.funcList) {
            setting[Live.roomID][key] = this.funcList[key].state;
        }
        store.set('BH_HideSetting', setting);
    }

    static buttonClickEvent(button) {
        let func = this.funcList[button.attr('key')];
        if(button.text() == '隐藏' && func.state) {
            func.showButton.removeClass('default').addClass('ghost');
            func.cssDOM = Live.addStylesheetByText(func.css);
        } else if(button.text() == '显示' && !func.state) {
            func.hideButton.removeClass('default').addClass('ghost');
            func.cssDOM.remove();
            this.chatListScrollToBottom();
        } else {
            return;
        }
        button.removeClass('ghost').addClass('default');
        func.state = !func.state;
        this.saveSetting();
    }

    static chatListScrollToBottom() {
        $('#chat-msg-list').scrollTop($('#chat-msg-list')[0].scrollHeight);
    }
}
