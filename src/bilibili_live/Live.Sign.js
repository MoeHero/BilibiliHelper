/* globals Live */
Live.sign = {
    init: function() {
        if(!Live.option.live || !Live.option.live_autoSign) {
            return;
        }
        Live.console.sign('enabled');
        Live.notify.sign('enabled');
        Live.sign.do();
        Live.timer(60 * 60 * 1000, function() {
            Live.sign.do();
        });
    },
    do: function() {
        if(!Live.store.sign.isSigned()) {
            $.getJSON('/sign/doSign').done(function(result) {
                if(result.code === 0) {
                    Live.store.sign.setSigned();
                    Live.dom.sign();
                    console.log(result);
                    Live.notify.sign('award', {award: result.data.text});
                    Live.console.sign('award', {award: result.data.text});
                } else if(result.code == -500) { //已签到
                    Live.store.sign.setSigned();
                    Live.console.sign('exist');
                } else {
                    console.log(result);
                    Live.sign.do();
                }
            }).fail(function() {
                Live.countdown(2, function() {
                    Live.sign.do();
                });
            });
        }
    }
};
