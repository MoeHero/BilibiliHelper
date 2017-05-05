/* jshint undef:false */
Helper.sendMessage({command: 'getInfo'}, (result) => {
    Helper.info = result;

    ModuleConsole.info('BilibiliHelper V' + Helper.info.version);
    if(isNaN(Helper.showID)) {
        ModuleConsole.info('非直播间, 脚本不启用');
        return;
    }
    Helper.addStylesheetByFile('bilibili_live_inject.min.css');
    Helper.addScriptByText(`var extensionID='${Helper.info.extensionID}';`);
    Helper.addScriptByFile('bilibili_live_inject.min.js');
    Helper.init(() => {
        FuncSign.init();
        FuncTreasure.init();
        FuncAutoLottery.init();

        FuncGiftPackage.init();
        FuncHideSetting.init();
    });
});
