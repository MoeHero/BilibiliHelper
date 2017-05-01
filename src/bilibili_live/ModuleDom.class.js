/* globals ModuleStore,FuncSmallTV */
class ModuleDom {
    static init() {
        {
            this.info = $('<div>').addClass('seeds-buy-cntr');
            let bhInfo = $('<div>').addClass('ctrl-item')
                .html(`${Live.localize.helper} V${Live.info.version}　QQ群:<a class="bili-link" target="_blank" href="//jq.qq.com/?k=47vw4s3">285795550</a>`);
            this.info.append(bhInfo);
            $('.control-panel').prepend(this.info);
        } //瓜子数量 左

        if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
            this.funcInfoRow = $('<div>').addClass('bh-func-info-row');
            this.funcInfoRow.append($('<div>').addClass('func-info v-top').html(`<span>分区: </span>${$('.room-info-row a')[0].outerHTML}`));
            $('.anchor-info-row').css('margin-top', 0).after(this.funcInfoRow);

            $('.room-info-row').remove();
        } //主播信息 下
    }

    static treasure_init() {
        $('.treasure-box-ctnr').remove();
        this.treasureStateIcon = $('<i>').addClass('bh-icon treasure-init');
        this.treasureStateText = $('<span>').text('初始化中...');
        this.treasureTimes = $('<span>').text('0/0').hide();
        this.treasureCountdown = $('<span>').text('00:00').hide();
        let funcInfo = $('<a>').addClass('func-info v-top').append(this.treasureStateText).append(this.treasureTimes).append(this.treasureCountdown);
        this.funcInfoRow.prepend(funcInfo).prepend(this.treasureStateIcon);
    }
    static treasure_setState(key, param) {
        let treasure = Live.localize.treasure;
        let text, state;
        switch(key) {
            case 'processing':
                state = 'processing';
                break;
            case 'awarding':
                text = treasure.action.awarding;
                break;
            case 'noLogin':
                state = 'error';
                text = treasure.action.noLogin;
                break;
            case 'end':
                state = 'end';
                text = treasure.action.end;
                break;
            case 'exist':
                state = 'exist';
                text = Live.format(treasure.action.exist, param);
                break;
        }
        state && this.treasureStateIcon.attr('class', 'bh-icon treasure-' + state);
        text && this.treasureStateText.text(text).show();
        this.treasureTimes.hide();
        this.treasureCountdown.hide();
    }
    static treasure_setTimes(times) {
        this.treasureTimes.text(times).show();
        this.treasureStateText.hide();
    }
    static treasure_showCountdown() {
        this.treasureCountdown.show();
        this.treasureStateText.hide();
    }
}
