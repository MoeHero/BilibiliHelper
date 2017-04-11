/* globals Live */
Live.smallTV = {
    countdown: {},
    rewardName: {'1': '小电视抱枕', '2': '蓝白胖次', '3': 'B坷垃', '4': '喵娘', '5': '爱心便当', '6': '银瓜子', '7': '辣条'},
    init: function() {
        if(!Live.option.live || !Live.option.live_autoSmallTV) {
            return;
        }
        var $this = this;
        Live.sendMessage({command: 'getSmallTV'}, function(result) {
            if(!result.showID) {
                $(window).on('beforeunload', function() {
                    Live.sendMessage({command: 'getSmallTV'}, function(result) {
                        result.showID == Live.showID && Live.sendMessage({command: 'delSmallTV'});
                    });
                });
                Live.sendMessage({command: 'setSmallTV', showID: Live.showID});
                Live.getMessage(function(request) {
                    if(request.cmd == 'SYS_MSG' && request.tv_id && request.real_roomid) {
                        $this.join(request.real_roomid, request.tv_id);
                    }
                });
                Live.console.smallTV('已启动');
                Live.notify.smallTV('start', '已启动');
            } else {
                Live.console.smallTV('已在直播间' + result.showID + '启动');
                Live.notify.smallTV('start', '已在直播间' + result.showID + '启动');
            }
        });
    },
    join: function(roomID, TVID) {
        var $this = this;
        $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID}).done(function(result) {
            if(result.code === 0) {
                var endTime = new Date();
                endTime.setSeconds(endTime.getSeconds() + result.data.dtime);
                $this.countdown[TVID] && $this.countdown[TVID].clearCountdown();
                $this.countdown[TVID] = new Live.countdown(endTime, function() {
                    $this.getAward(TVID);
                });
                Live.console.smallTV('参加成功! RoomID:' + roomID + ' TVID:' + TVID);
            } else if(result.code == -400) {
                Live.console.smallTV('参加失败! ' + result.msg);
            } else {
                $this.join();
            }
        });
    },
    getAward: function(TVID) {
        var $this = this;
        $.getJSON('/SmallTV/getReward', {id: TVID}).done(function(result) {
            result = result.data;
            if(result.status === 0) {//领取成功
                Live.console.smallTV('获得' + result.reward.num + '个' + $this.rewardName[result.reward.id]);
                Live.notify.smallTV('get', '获得' + result.reward.num + '个' + $this.rewardName[result.reward.id]);
                Live.store.smallTV.add(result.reward.id, result.reward.num);
            } else if(result.status == 2) {//正在开奖
                setTimeout(function() {
                    $this.getAward(TVID);
                }, 5000);
            } else {
                console.log(result);
                $this.getAward(TVID);
            }
        });
    }
};
