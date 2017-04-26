/* globals ModuleStore,FuncSmallTV */
class ModuleDom {
    static init() {
        {
            $('.control-panel').prepend(`
            <div class="ctrl-item" id="bh-info">
                <div class="ctrl-item">${Live.localize.helper} V${Live.info.version}</div>
            </div>`.trim());
        } //瓜子数量旁插件信息

        {
            $('.profile-ctrl').append('<a class="f-right live-btn ghost" id="bh-live-setting">直播设置</a>');
            $('#bh-live-setting').on('click', (event) => {

            });
            $(document).on('click', () => {
                if(this.smallTV_statinfo.hasClass('show')) {
                    this.smallTV_statinfo.addClass('out');
                    setTimeout(() => this.smallTV_statinfo.removeClass('out show'), 400);
                }
            });
            this.smallTV_state = $('#bh-tv-state').on('click', (event) => {
                this.smallTV_statinfo_count.text(ModuleStore.smallTV('getCount') + ' ' + Live.localize.times);
                this.smallTV_statinfo.find('ul').html(
                    function() {
                        let statinfoJson = ModuleStore.smallTV('getStatInfo');
                        let statinfoStr = '';
                        for(let i in statinfoJson) {
                            statinfoStr += '<li>' + FuncSmallTV.awardName[i] + 'x' + statinfoJson[i] + '</li>';
                        }
                        return statinfoStr || '<li>' + Live.localize.smallTV.noStatinfo + '</li>';
                    }()
                );
                if(!this.smallTV_statinfo.hasClass('show')) {
                    this.smallTV_statinfo.addClass('show');
                    event.stopPropagation();
                }
            }); //显示&退出动画

        } //弹幕框下方直播设置

        if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
            $('.anchor-info-row').css('margin-top', 0).after('<div class="bh-func-info-row"></div>');
            this.funcinfo_row = $('.bh-func-info-row').append(`
            <div class="func-info v-top">
                <span>分区: </span>${$('.room-info-row a')[0].outerHTML}
            </div>`.trim());
            $('.room-info-row').remove();
        } //直播间名称下方信息
    }

    static sign_setSigned() {
        let signBtn = $('.sign-up-btn');
        signBtn.find('.dp-inline-block>span:first-child').hide();
        signBtn.find('.dp-inline-block>.dp-none').show();
        signBtn.find('.has-new').removeClass('has-new');
    }

    static treasure_init() {
        $('.treasure-box-ctnr').remove();
        this.funcinfo_row.prepend(`
        <i class="bh-icon treasure-init" id="bh-treasure-state-icon"></i>
        <a class="func-info v-top">
            <span id="bh-treasure-state">${Live.localize.init}</span>
            <span id="bh-treasure-times" style="display:none;">0/0</span>&nbsp;
            <span id="bh-treasure-countdown" style="display:none;">00:00</span>
        </a>`.trim());
        this.treasure_state_icon = $('#bh-treasure-state-icon');
        this.treasure_state = $('#bh-treasure-state');
        this.treasure_times = $('#bh-treasure-times');
        this.treasure_countdown = $('#bh-treasure-countdown');
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
        state && this.treasure_state_icon.attr('class', 'bh-icon treasure-' + state);
        text && this.treasure_state.text(text).show();
        this.treasure_times.hide();
        this.treasure_countdown.hide();
    }
    static treasure_setTimes(times) {
        this.treasure_times.text(times).show();
        this.treasure_state.hide();
    }
    static treasure_showCountdown() {
        this.treasure_countdown.show();
        this.treasure_state.hide();
    }

    static smallTV_init() {
        this.funcinfo_row.prepend(`
        <i class="bh-icon tv-init" id="bh-tv-state-icon"></i>
        <a class="func-info bili-link v-top" id="bh-tv-state">${Live.localize.init}</a>
        <div class="live-hover-panel arrow-top" id="bh-tv-statinfo">
            <h4 id="bh-tv-statinfo-title">${Live.localize.smallTV.statinfoTitle}</h4>
            <span class="f-right" id="bh-tv-statinfo-count"></span>
            <hr>
            <ul></ul>
        </div>`.trim());
        this.smallTV_state_icon = $('#bh-tv-state-icon');
        this.smallTV_statinfo = $('#bh-tv-statinfo').on('click', (event) => event.stopPropagation());
        this.smallTV_statinfo_count = $('#bh-tv-statinfo-count');
        this.smallTV_state = $('#bh-tv-state').on('click', (event) => {
            this.smallTV_statinfo_count.text(ModuleStore.smallTV('getCount') + ' ' + Live.localize.times);
            this.smallTV_statinfo.find('ul').html(
                function() {
                    let statinfoJson = ModuleStore.smallTV('getStatInfo');
                    let statinfoStr = '';
                    for(let i in statinfoJson) {
                        statinfoStr += '<li>' + FuncSmallTV.awardName[i] + 'x' + statinfoJson[i] + '</li>';
                    }
                    return statinfoStr || '<li>' + Live.localize.smallTV.noStatinfo + '</li>';
                }()
            );
            if(!this.smallTV_statinfo.hasClass('show')) {
                this.smallTV_statinfo.addClass('show');
                event.stopPropagation();
            }
        }); //显示&退出动画
        $(document).on('click', () => {
            if(this.smallTV_statinfo.hasClass('show')) {
                this.smallTV_statinfo.addClass('out');
                setTimeout(() => this.smallTV_statinfo.removeClass('out show'), 400);
            }
        });
    }
    static smallTV_setState(key, param) {
        let smallTV = Live.localize.smallTV;
        let text, state;
        switch(key) {
            case 'enabled':
                state = 'enabled';
                text = Live.localize.enabled;
                break;
            case 'exist':
                state = 'exist';
                text = Live.format(smallTV.action.exist, param);
                break;
        }
        state && this.smallTV_state_icon.attr('class', 'bh-icon tv-' + state);
        text && this.smallTV_state.text(text);
    }
}
