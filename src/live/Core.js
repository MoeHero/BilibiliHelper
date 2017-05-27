/* jshint undef:false */
Helper.sendMessage({command: 'getInfo'}, (result) => {
    Helper.info = result;

    ModuleConsole.info('BilibiliHelper V' + Helper.info.version);
    if(!Helper.showID || isNaN(Helper.showID)) {
        ModuleConsole.info('非直播间, 插件不加载');
        return;
    }

    Helper.addStylesheetByFile('live_inject.min.css');
    Helper.addScriptByText(`var extensionID='${Helper.info.extensionID}';`);
    Helper.addScriptByFile('live_inject.min.js');
    Helper.init(() => {
        if(!Helper.roomID || isNaN(Helper.roomID)) {
            ModuleConsole.info('非直播间, 插件不加载');
            return;
        }
        Helper.countdown(0.1, () => {
            FuncSign.init();
            FuncTreasure.init();
            FuncAutoLottery.init();

            FuncGiftPackage.init();
            FuncHideSetting.init();
            FuncDanmuEnhance.init();
        });
    });
});
