/* globals Live */
Live.sign = {
    do: function() {
        if(!Live.option.live || !Live.option.live_autoSign) {
            return;
        }
        Live.console.sign(-1);
        if(!Live.store.sign.get()) {
            $.getJSON('/sign/doSign').done(function(result) {
                if(result.code === 0) {//签到成功
                    Live.console.sign(result.code, result.data.text);
                    Live.dom.sign();
                    Live.store.sign.set();
                    Live.notify.sign('签到成功,' + result.data.text);
                } else if(result.code == -500) {//已签到
                    Live.console.sign(result.code, result.msg);
                    Live.store.sign.set();
                } else {
                    Live.console.sign(result.code, result.msg);
                    Live.notify.sign('签到失败,' + result.data.text);
                }
            });
        }
    }
};
