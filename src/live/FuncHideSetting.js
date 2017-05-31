/* globals store */
class FuncHideSetting {
    static init() {
        if(!Helper.option.live || !Helper.option.live_hideSetting) {
            return;
        }
        this.funcList = {
            gift: {
                name: '礼物信息',
                css: '.gift-msg{display:none!important;}.gift-msg-1000{display:none!important;}.chat-msg-list{height:100%!important;}'
            },
            vip: {
                name: '舰长&老爷进场',
                css: '.system-msg{display:none!important;}'
            },
            sysmsg: {
                name: '系统公告',
                css: '.sys-msg{display:none!important;}'
            },
            tvmsg: {
                name: '小电视公告',
                css: '.small-tv-msg{display:none!important;}'
            },
            link: {
                name: '应援团相关',
                css: '.bilibili-link{display:none!important;}'
            },
            combo: {
                name: '礼物连击',
                css: '#super-gift-ctnr-haruna{display:none!important;}'
            },
            title: {
                name: '用户头衔',
                css: '.check-my-title{display:none!important;}'
            },
            medal: {
                name: '粉丝勋章',
                css: '.fans-medal-item{display:none!important;}'
            },
            level: {
                name: '用户等级',
                css: '.user-level-icon{display:none!important;}'
            },
            chat: {
                name: '聊天信息',
                css: '.chat-msg{display:none!important;}'
            },
            vipicon: {
                name: '老爷图标',
                css: '.chat-msg .vip-icon{display:none!important;}'
            },
            guardicon: {
                name: '舰长图标',
                css: '.chat-msg .guard-icon-small{display:none!important;}'
            },
            adminicon: {
                name: '房管图标',
                css: '.admin{display:none!important;}'
            },
            guardmsg: {
                name: '船员聊天背景',
                css: '.guard-msg{margin:0!important;padding:4px 5px!important;}.guard-msg:before{background:transparent!important;border-image:none!important;}.guard-msg:after{background:transparent!important;}'
            }
        };

        this.getSetting();

        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        this.hideSettingButton = $('<a>').addClass('bh-hide-setting-btn f-right live-btn ghost').text('屏蔽设置');
        this.hideSettingPanel = $('<div>').addClass('bh-hide-setting-panel live-hover-panel arrow-bottom show').hide()
            .append($('<h4>').addClass('bh-title').text('屏蔽设置'), $('<hr>'));
        let ul = $('<ul>');
        let top = -65;
        for(let key in this.funcList) {
            let li = $('<li>').addClass('clear-float').append($('<span>').text(this.funcList[key].name));
            let button = $('<a>').addClass('f-right live-btn').attr('key', key).on('click', e => this.buttonClickEvent($(e.currentTarget)));
            this.funcList[key].showButton = button.clone(true).addClass(this.funcList[key].state ? 'default' : 'ghost').text('显示');
            this.funcList[key].hideButton = button.clone(true).addClass(this.funcList[key].state ? 'ghost' : 'default').text('隐藏');
            !this.funcList[key].state && (this.funcList[key].cssDOM = Helper.addStylesheetByText(this.funcList[key].css));
            li.append(this.funcList[key].hideButton, this.funcList[key].showButton);
            ul.append(li);
            top += -28;
        }
        this.hideSettingPanel.append(ul).css('top', top + 'px');
        $('.profile-ctrl').append(this.hideSettingPanel, this.hideSettingButton);
    }
    static addEvent() {
        this.hideSettingPanel.stopPropagation();
        $(document).on('click', () => this.hideSettingPanel.fadeOut(200));

        this.hideSettingButton.on('click', () => this.hideSettingPanel.fadeToggle(200)).stopPropagation();
    }

    static getSetting() {
        let setting = store.get('BH_HideSetting')[Helper.roomID] || {};
        for(let key in this.funcList) {
            this.funcList[key].state = setting[key] !== undefined ? setting[key] : Helper.option['live_hideSetting_' + key];
        }
    }
    static saveSetting() {
        let setting = store.get('BH_HideSetting') || {};
        !setting[Helper.roomID] && (setting[Helper.roomID] = {});
        for(let key in this.funcList) {
            setting[Helper.roomID][key] = this.funcList[key].state;
        }
        store.set('BH_HideSetting', setting);
    }

    static buttonClickEvent(button) {
        let func = this.funcList[button.attr('key')];
        if(button.text() == '隐藏' && func.state) {
            func.showButton.removeClass('default').addClass('ghost');
            func.cssDOM = Helper.addStylesheetByText(func.css);
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
