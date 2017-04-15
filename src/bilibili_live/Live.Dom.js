/* globals Live,GiftPackage */
Live.dom = {
    init: function() {
        {
            var bhInfo = $('\
            <div class="ctrl-item" id="bh-info">\
                <div class="ctrl-item">' + Live.localize.helper + ' V' + Live.info.version + '</div>\
            </div>');
            $('.control-panel').prepend(bhInfo);
        } //瓜子数量旁插件信息

        {
            //$('.profile-ctrl').append('<a href="javascript: void(0)" class="profile-ctrl-item f-right bili-link">直播设置</a>');
        } //弹幕框下方直播设置

        if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
            var partition = $('.room-info-row a')[0];
            partition.className = 'share-link';
            $('.room-title-row').append($('.room-title-row>.report-link')[0]).append(partition);
            $('.room-info-row').remove();
            $('.anchor-info-row').after('<div class="room-info-row" style="margin-top:15px;">');
        } //直播间名称下方统计信息
    },
    sign: function() {
        $('.sign-up-btn>.dp-inline-block>span:first-child').hide();
        $('.sign-up-btn>.has-new').hide();
        $('.sign-up-btn>.dp-inline-block>.dp-none').show();
    },
    treasure: {
        init: function() {
            $('.treasure-box-ctnr').hide();
            $('.room-info-row').append('\
            <i class="live-icon silver-seed"></i>\
            <a class="room-info v-top">\
                <span id="bh-treasure-state">' + Live.localize.init + '</span>\
                <span id="bh-treasure-times" style="display:none;">0/0</span>&nbsp;\
                <span id="bh-treasure-countdown" style="display:none;">00:00</span>\
            </a>');
            this.state = $('#bh-treasure-state');
            this.times = $('#bh-treasure-times');
            this.countdown = $('#bh-treasure-countdown');
        },
        setState: function(key, param) {
            var treasure = Live.localize.treasure;
            var text = '';
            switch(key) {
                case 'noLogin':
                    text = treasure.action.noLogin;
                    break;
                case 'end':
                    text = treasure.action.end;
                    break;
                case 'exist':
                    text = Live.format(Live.localize.treasure.action.exist, param);
                    break;
            }
            this.state.text(text).show();
            this.times.hide();
            this.countdown.hide();
        },
        setTimes: function(text) {
            this.times.text(text).show();
            this.state.hide();
        },
        showCountdown: function() {
            this.countdown.show();
            this.state.hide();
        }
    },
    smallTV: {
        init: function() {
            $('.room-info-row').append('\
            <i class="live-icon main-site dark"></i>\
            <a class="room-info bili-link v-top" id="bh-smalltv-statinfo">\
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
    },
    giftPackage: {
        init: function() {
            var a = new GiftPackage();
        }
    }
};