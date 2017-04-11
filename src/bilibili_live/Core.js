/* globals Live */
Live.sendMessage({command: 'getInfo'}, function(result) {
    Live.info = result;
    Live.console.info('BilibiliHelper V' + Live.info.version + ' Build' + Live.info.buildNumber);
    if(isNaN(Live.showID)) {
        Live.console.info('非直播间, 脚本不启用');
        return;
    }

    Live.addScriptByText('var extensionID=\'' + Live.info.extensionID + '\';');
    Live.addScriptByFile('bilibili_live_inject.min.js');
    Live.start(function() {
        Live.treasure.init();
        Live.timer(60 * 60 * 1000, function() {
            Live.sign.do();
            Live.treasure.start();
        });

        Live.smallTV.init();
    });
});
