/* globals ModuleConsole,ModuleDom,ModuleNotify,ModuleStore */
class FuncLiveSetting {
    static init() {
        if(!Live.option.live || !Live.option.live) {
            return;
        }
        this.funcList = {
            gift: {name: '礼物信息', click: this.gift_click, state: true},
            vip: {name: '老爷进场', click: this.vip_click, state: true},
            super_gift: {name: '礼物连击', click: this.super_gift_click, state: true}
        };
        this.initDOM();
    }

    static initDOM() {//$('#chat-msg-list').scrollTop($('#chat-msg-list')[0].scrollHeight);
        this.liveSettingButton = $('<a>').addClass('f-right live-btn ghost').attr('id', 'bh-live-setting-btn').text('直播设置');
        this.liveSettingPanel = $('<div>').addClass('live-hover-panel arrow-bottom').attr('id', 'bh-live-setting-panel');
        this.liveSettingPanel.append($('<h4>').addClass('bh-title').text('直播设置')).append($('<hr>'));
        let ul = $('<ul>');
        for(let key in this.funcList) {
            let li = $('<li>').addClass('clear-float');
            li.append($('<span>').text(this.funcList[key].name));
            li.append($('<a>').addClass('link bili-link f-right bh-live-setting-btn').attr('id', 'bh-' + key).text('隐藏'));
            ul.append(li);
        }
        this.liveSettingPanel.append(ul);
        $('.profile-ctrl').append(this.liveSettingPanel);
        this.liveSettingPanel.on('click', (event) => event.stopPropagation());
        this.liveSettingButton.on('click', (event) => {
            if(!this.liveSettingPanel.hasClass('show')) {
                this.liveSettingPanel.addClass('show');
                event.stopPropagation();
            }
        });
        $(document).on('click', () => {
            if($('#bh-live-setting').hasClass('show')) {
                $('#bh-live-setting').addClass('out');
                Live.countdown(400, () => $('#bh-live-setting').removeClass('out show'));
            }
        });

        this.gift = true;
        this.vip = true;
        this.superGift = true;
        $('#bh-gift').on('click', () => {
            if(this.gift) {
                this.giftCss = Live.addStylesheetByText('.gift-msg{display:none !important;}');
            } else {
                this.giftCss.remove();
            }
            $('#bh-gift').text(this.gift ? '显示' : '隐藏');
            this.gift = !this.gift;
        });
        $('#bh-vip').on('click', () => {
            if(this.vip) {
                this.vipCss = Live.addStylesheetByText('.system-msg{display:none !important;}');
            } else {
                this.vipCss.remove();
            }
            $('#bh-vip').text(this.vip ? '显示' : '隐藏');
            this.vip = !this.vip;
        });
        $('#bh-super-gift').on('click', () => {
            $('#bh-super-gift').text(this.superGift ? '显示' : '隐藏');
            $('#super-gift-ctnr-haruna').toggleClass('hide');
            this.superGift = !this.superGift;
        });
    }
}