/* globals a */
class ModuleDom {
    static init() {
        {
            var bhInfo = $(`
            <div class="ctrl-item" id="bh-info">
                <div class="ctrl-item">${Live.localize.helper} V${Live.info.version}</div>
            </div>`);
            $('.control-panel').prepend(bhInfo);
        } //瓜子数量旁插件信息

        {
            //$('.profile-ctrl').append('<a href="javascript: void(0)" class="profile-ctrl-item f-right bili-link">直播设置</a>');
        } //弹幕框下方直播设置

        if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
            $('.anchor-info-row').css('margin-top', 0).append(`
            <div class="row-item">
                <span>分区: </span>${$('.room-info-row a')[0].outerHTML}
            </div>`).after('<div class="bh-func-info-row"></div>');
            $('.room-info-row').remove();
            this.funcinfo_row = $('.bh-func-info-row');
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
        this.funcinfo_row.append(`
        <i class="bh-icon treasure-init" id="bh-treasure-state-icon"></i>
        <a class="func-info v-top">
            <span id="bh-treasure-state">${Live.localize.init}</span>
            <span id="bh-treasure-times" style="display:none;">0/0</span>&nbsp;
            <span id="bh-treasure-countdown" style="display:none;">00:00</span>
        </a>`);
        this.treasure_state_icon = $('#bh-treasure-state-icon');
        this.treasure_state = $('#bh-treasure-state');
        this.treasure_times = $('#bh-treasure-times');
        this.treasure_countdown = $('#bh-treasure-countdown');
    }
    static treasure_setState(key, param) {
        let treasure = Live.localize.treasure;
        let text, state;
        switch(key) {
            case 'enabled':
                state = 'enabled';
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

        this.treasure_state_icon = $('#bh-treasure-state-icon');

        this.funcinfo_row.append('\
        <i class="bh-icon tv-init" id="tv-state-icon"></i>\
        <a class="func-info bili-link v-top" id="bh-smalltv-statinfo">\
            <span class="v-top">' + Live.localize.smallTV.title + '</span>\
        </a>\
        <div class="live-hover-panel arrow-top tvcount" id="bh-smalltv-statinfo-content">\
            <h4 class="smalltv-title">'+ Live.localize.smallTV.statinfoTitle +'</h4>\
            <span class="f-right" id="bh-smalltv-statinfo-count"></span>\
            <ul></ul>\
        </div>');
        var content = $('#bh-smalltv-statinfo-content').on('click', function(event) {
            event.stopPropagation();
        });
        $('#bh-smalltv-statinfo').on('click', function(event) {
            $('#bh-smalltv-statinfo-count').text(Live.store.smallTV.getCount() + ' ' + Live.localize.times);
            content.find('ul').html(
                function() {
                    var statinfoJson = Live.store.smallTV.getStatInfo();
                    var statinfoStr = '';
                    for(var i in statinfoJson) {
                        statinfoStr += '<li>' + Live.smallTV.rewardName[i] + 'x' + statinfoJson[i] + '</li>';
                    }
                    return statinfoStr || '<li>' + Live.localize.smallTV.noStatinfo + '</li>';
                }()
            );
            if(!content.hasClass('show')) {
                event.stopPropagation();
                content.addClass('show');
            }
        }); //显示&退出动画
        $(document).on('click', function(event) {
            if(content.hasClass('show')) {
                content.addClass('out');
                setTimeout(function() {
                    content.removeClass('out show');
                }, 400);
            }
        });
    }
}
