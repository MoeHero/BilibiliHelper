/* globals Live */
Live.smallTV = {
    countdown: {},
    rewardName: {'1': '小电视抱枕', '2': '蓝白胖次', '3': 'B坷垃', '4': '喵娘', '5': '爱心便当', '6': '银瓜子', '7': '辣条'},
    init: function() {
        if(!Live.option.live || !Live.option.live_autoSmallTV) {
            return;
        }
        Live.dom.smallTV.init();
        Live.sendMessage({command: 'getSmallTV'}, function(result) {
            if(!result.showID) {
                Live.sendMessage({command: 'setSmallTV', showID: Live.showID});
                $(window).on('beforeunload', function() {
                    Live.sendMessage({command: 'getSmallTV'}, function(result) {
                        result.showID == Live.showID && Live.sendMessage({command: 'delSmallTV'});
                    });
                });
                Live.getMessage(function(request) {
                    if(request.cmd == 'SYS_MSG' && request.tv_id && request.real_roomid) {
                        Live.smallTV.join(request.real_roomid, request.tv_id);
                    }
                });
                Live.notify.smallTV('enabled');
                Live.console.smallTV('enabled');
            } else {
                Live.console.smallTV('exist', result);
            }
        });
    },
    join: function(roomID, TVID) {
        $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID}).done(function(result) {
            if(result.code === 0) {
                Live.smallTV.countdown[TVID] && Live.smallTV.countdown[TVID].clearCountdown();
                Live.smallTV.countdown[TVID] = new Live.countdown(result.data.dtime, function() {
                    Live.smallTV.getAward(TVID);
                });
                Live.console.smallTV('joinSuccess', {roomID:roomID, TVID: TVID});
            } else if(result.code == -400) { //已经错过
                Live.console.smallTV('joinError', result);
            } else {
                console.log(result);
                Live.smallTV.join();
            }
        }).fail(function() {
            Live.countdown(2, function() {
                Live.smallTV.join();
            });
        });
    },
    getAward: function(TVID) {
        $.getJSON('/SmallTV/getReward', {id: TVID}).done(function(result) {
            result = result.data;
            if(result.status === 0) {
                var award = {awardNumber: result.reward.num, awardName:Live.smallTV.rewardName[result.reward.id]};
                Live.store.smallTV.addStatInfo(result.reward.id, result.reward.num);
                Live.store.smallTV.addCount();
                Live.notify.smallTV('award', award);
                Live.console.smallTV('award', award);
            } else if(result.status == 2) { //正在开奖
                Live.countdown(10, function() {
                    Live.smallTV.getAward(TVID);
                });
            } else {
                console.log(result);
                Live.smallTV.getAward(TVID);
            }
        }).fail(function() {
            Live.countdown(2, function() {
                Live.smallTV.getAward(TVID);
            });
        });
    }
};
