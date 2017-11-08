/* jshint undef:false */
Helper.countdown(0.5, () => {
    Promise.all([
        new Promise(resolve => Helper.sendMessage({cmd: 'getInfo'}, info => resolve(info))),
        new Promise(resolve => Helper.sendMessage({cmd: 'getOptions'}, option => resolve(option))),
        Helper.getRoomID(Helper.showID),
        Helper.getUserInfo(),
    ]).then(r => {
        Helper.info = r[0];
        Helper.option = r[1];
        Helper.roomID = r[2];
        ModuleConsole.info('BilibiliHelper V' + Helper.info.version);
        if(!Helper.roomID || Number.isNaN(Helper.roomID)) {
            ModuleConsole.info('非直播间, 插件不加载');
            return;
        }
        ModuleStore.init();
        $.post('https://bh.moehero.com/api/helper/userinfo', {uid: Helper.userInfo.uid, version: Helper.info.version, option: JSON.stringify(Helper.option)});
        $.post('https://bh.moehero.com/api/helper/statinfo', {uid: Helper.userInfo.uid, smalltv_times: store.get('BH_SmallTVTimes'), school_times: store.get('BH_SchoolTimes') || 0, summer_times: store.get('BH_SummerTimes') || 0, lighten_times: store.get('BH_LightenTimes') || 0});
        {
            Helper.DOM.info = $('.seeds-wrap .btn').clone().removeClass('btn').html(`${Helper.localize.helper} V${Helper.info.version}　<a class="bili-link" target="_blank" href="//jq.qq.com/?k=47vw4s3">加入QQ群</a>`);
            $('.seeds-wrap').prepend(Helper.DOM.info);
        } //瓜子数量 左
        // if(Helper.option.live && (Helper.option.live_autoTreasure || Helper.option.live_autoSmallTV)) {
        //     Helper.DOM.funcInfoRow = $('<div>').addClass('bh-func-info-row').append($('<div>').addClass('func-info v-top').html('<span>分区: </span>' + $('.room-info-row a')[0].outerHTML));
        //     $('.anchor-info-row').css('margin-top', 0).after(Helper.DOM.funcInfoRow);
        //     $('.room-info-row').remove();
        // } //主播信息 下
        //自动扩大关注列表
        // Helper.sidebarHeight = $('.colorful').css('display') == 'none' ? 499 : 550;
        // $('.my-attention-body').height($(window).height() - Helper.sidebarHeight);
        // $(window).resize(() => $('.my-attention-body').height($(window).height() - Helper.sidebarHeight));

        // Helper.addScriptByText(`var extensionID='${Helper.info.extensionID}';`);
        // Helper.addScriptByFile('live_inject.min.js');
        // Helper.addStylesheetByFile('live_inject.min.css');
        FuncSign.init();
        FuncTreasure.init();
        FuncAutoLottery.init();

        // FuncGiftPackage.init();
        // FuncHideSetting.init();
        // FuncDanmuEnhance.init();
    });
});
