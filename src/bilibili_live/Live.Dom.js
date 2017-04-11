/* globals Live */
Live.dom = {
    init: function() {
        {
            var bhInfo = $('<div class="ctrl-item" id="bh-info">\
                                <div class="ctrl-item">' + Live.localize.helper + ' V' + Live.info.version + '</div>\
                                <div class="ctrl-item" id="bh-smalltv">\
                                    <a class="link bili-link" id="bh-smalltv-statinfo">查看小电视统计信息</a>\
                                </div>\
                            </div>');
            $('.control-panel').prepend(bhInfo);
        } //瓜子数量旁插件信息

        {
            $('.profile-ctrl').append('<a href="javascript: void(0)" class="profile-ctrl-item f-right bili-link">直播设置</a>');
        } //弹幕框下方直播设置

        {
            $('.room-info-row').hide();
            var partition = $('.room-info-row a')[0];
            partition.className = 'share-link';
            $('.room-title-row').append($('.room-title-row>.report-link')[0]).append(partition);
        } //直播间名称下方统计信息


        $('#bh-smalltv-statinfo').on('click', function() {
            var statinfoJson = Live.store.smallTV.getStatInfo();
            var statinfoStr = '';
            for(var i in statinfoJson) {
                statinfoStr += Live.smallTV.rewardName[i] + '*' + statinfoJson[i] + '\n';
            }
            alert(statinfoStr); //jshint ignore:line
        });
    },
    sign: function() {
        $('.sign-up-btn>.dp-inline-block>span:first-child').hide();
        $('.sign-up-btn>.has-new').hide();
        $('.sign-up-btn>.dp-inline-block>.dp-none').show();
    },
    treasure: {
        init: function() {
            $('.treasure-box-ctnr').hide();
            $('#bh-info').append(
                '<div class="ctrl-item" id="bh-treasure">' +
                '<span id="bh-treasure-title"></span>' +
                '<span id="bh-treasure-state"></span>' +
                '<span id="bh-treasure-times" style="display:none;">0/0</span>' + ' ' +
                '<span id="bh-treasure-countdown" style="display:none;">00:00</span>' +
                '</div>'
            );
            $('#bh-treasure-title').text(Live.localize.treasure.title + ': ');
            this.state = $('#bh-treasure-state').text(Live.localize.init);
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
    }
};