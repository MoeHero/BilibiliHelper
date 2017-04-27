/* jshint undef:false */
Live.sendMessage({command: 'getInfo'}, (result) => {
    Live.info = result;

    ModuleConsole.info('BilibiliHelper V' + Live.info.version);
    if(isNaN(Live.showID)) {
        ModuleConsole.info('非直播间, 脚本不启用');
        return;
    }
    Live.addStylesheetByFile('bilibili_live_inject.min.css');
    Live.addScriptByText(`var extensionID='${Live.info.extensionID}';`);
    Live.addScriptByFile('bilibili_live_inject.min.js');
    Live.init(() => {
        FuncSign.init();
        FuncTreasure.init();
        FuncSmallTV.init();

        FuncGiftPackage.init();
        FuncLiveSetting.init();
    });
});
