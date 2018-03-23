/* jshint undef:false */
ModuleLogger.info('萌园助手(MoeGarden Helper) Page Script V' + Helper.info.version);
ModuleLogger.info('官网: https://bh.moehero.com');

ModuleStore.init();
Helper.countdown(2, () => {
    Promise.all([
        new Promise(resolve => Helper.sendMessage({cmd: 'getInfo'}, r => resolve(r))),
        new Promise(resolve => Helper.sendMessage({cmd: 'getOptions'}, r => resolve(r))),
        Helper.getRoomID(Helper.showID),
        Helper.getUserInfo(),
    ]).then(r => {
        Helper.info = r[0];
        Helper.options = r[1];
        Helper.roomID = r[2];
        ModuleLogger.info('萌园助手(MoeGarden Helper) Page Script V' + Helper.info.version);
        ModuleLogger.info('官网: https://bh.moehero.com');
        ModuleCollection.init();
        if(!Helper.roomID || Number.isNaN(Helper.roomID)) {
            ModuleLogger.info('非直播间, 插件不加载');
            return;
        }
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
        Helper.addStylesheetByFile('live_inject.min.css');
        FuncSign.init();
        FuncTreasure.init();
        FuncAutoLottery.init();

        // FuncGiftPackage.init();
        // FuncHideSetting.init();
        // FuncDanmuEnhance.init();
    });
});
//TODO 大部分功能改成背景页完成 前端只负责显示
