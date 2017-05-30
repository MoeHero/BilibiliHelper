/* jshint undef:false */
Helper.sendMessage({command: 'getInfo'}, result => {
    Helper.info = result;

    ModuleConsole.info('BilibiliHelper V' + Helper.info.version);
    if(!Helper.showID || Number.isNaN(Helper.showID)) {
        ModuleConsole.info('非直播间, 插件不加载');
        return;
    }

    Helper.addScriptByText(`var extensionID='${Helper.info.extensionID}';`);
    Helper.addScriptByFile('live_inject.min.js');
    Helper.addStylesheetByFile('live_inject.min.css');
    Helper.init(() => {
        if(!Helper.roomID || Number.isNaN(Helper.roomID)) {
            ModuleConsole.info('非直播间, 插件不加载');
            return;
        }
        FuncSign.init();
        FuncTreasure.init();
        FuncAutoLottery.init();

        FuncGiftPackage.init();
        FuncHideSetting.init();
        FuncDanmuEnhance.init();
    });
});
