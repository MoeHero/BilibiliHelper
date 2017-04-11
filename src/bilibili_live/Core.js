/* globals Live */
Live.sendMessage({command: 'getInfo'}, function(result) {
    Live.info = result;
    Live.console.info('BilibiliHelper V' + Live.info.version);
    if(isNaN(Live.showID)) {
        Live.console.info('非直播间, 脚本不启用');
        return;
    }

    Live.addScriptByText('var extensionID=\'' + Live.info.extensionID + '\';');
    Live.addScriptByFile('bilibili_live_inject.min.js');
    Live.start(function() {
        Live.sign.init();
        Live.treasure.init();
        Live.smallTV.init();
    });
});
