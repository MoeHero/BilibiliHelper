/* globals ModuleStore,ModuleNotify,ModuleConsole */
class ALPlugin_SmallTV {
    static init() {
        this.list = [];
        if(!Helper.option.live || !Helper.option.live_autoSmallTV) {
            return;
        }
        if(Helper.userInfo.noLogin) {
            ModuleNotify.smallTV('noLogin');
            ModuleConsole.smallTV('noLogin');
            return;
        }
        //this.initDOM();
        this.addEvent();
    }
    // static getInfo() {
    //     let info = {
    //         name: '小电视抽奖',
    //         times: ModuleStore.getTimes('smallTV'),
    //         statinfo: {}
    //     };
    //     let statinfos = ModuleStore.getStatinfo('smallTV');
    //     for(let key in statinfos) {
    //         info.statinfo[this.awardName[key]] = statinfos[key];
    //     }
    //     return info;
    // }

    // static initDOM() {
    //     $('.treasure-box-ctnr').remove();
    //     this.stateIcon = $('<i>').addClass('bh-icon tv-init');
    //     this.stateText = $('<a>').addClass('func-info v-top bili-link').text('初始化中...');
    //     this.statePanel = $('<div>').addClass('live-hover-panel arrow-top show bh-tvstate').hide();
    //     this.statePanelContent = $('<ul>');
    //     this.statePanelNumber = $('<span>').addClass('f-right').text('0 个');
    //
    //     this.statePanel.append($('<h4>').addClass('bh-title').text('正在抽取的小电视'), this.statePanelNumber, $('<hr>'), this.statePanelContent);
    //
    //     Helper.DOM.funcInfoRow.prepend(this.stateIcon, ' ', this.stateText, this.statePanel);
    // }
    static addEvent() {
        let $this = this;
        //this.stateText.on('click', () => this.openStatePanel()).stopPropagation();
        //this.statePanel.stopPropagation();
        //$(document).on('click', () => this.statePanel.fadeOut(200));
        Helper.sendMessage({cmd: 'get', type: 'SmallTV'}, result => {
            if(!result.showID) {
                $(window).on('beforeunload', () => Helper.sendMessage({cmd: 'del', type: 'SmallTV'}));
                Helper.sendMessage({cmd: 'set', type: 'SmallTV', showID: Helper.showID});
                $(document).on('DOMNodeInserted', '.small-tv', function() {
                    let info = $(this).find('div a');
                    Helper.getRoomID(info.attr('href').match(/\/(\d+)/)[1]).then(roomID => {
                        $this.join(roomID);
                    });
                });
                // this.setStateIcon('enabled');
                // this.setStateText(Helper.localize.enabled);
                ModuleNotify.smallTV('enabled');
                ModuleConsole.smallTV('enabled');
            } else {
                // this.setStateIcon('exist');
                // this.setStateText(Helper.format(Helper.localize.smallTV.action.exist, result));
                ModuleConsole.smallTV('exist', result);
            }
        });
    }

    // static setStateText(text) {
    //     this.stateText.text(text);
    // }
    // static setStateIcon(key) {
    //     this.stateIcon.attr('class', 'bh-icon tv-' + key);
    // }
    // static openStatePanel() {
    //     let number = Object.keys(this.list).length;
    //     this.statePanelNumber.text(number + ' 个');
    //     if(number !== 0) {
    //         this.statePanelContent.empty();
    //         for(let tvid in this.list) {
    //             let stateDom = $('<li>').text('#' + tvid).append(this.list[tvid].countdown_dom.addClass('f-right'));
    //             this.statePanelContent.append(stateDom);
    //         }
    //     } else {
    //         this.statePanelContent.text('暂无小电视');
    //     }
    //     this.statePanel.show();
    // }

    static join(roomID) {
        $.getJSON('//api.live.bilibili.com/gift/v2/smalltv/check', {roomid: roomID}).done(r1 => {
            if(r1.code === 0) {
                for(let data of r1.data) {
                    if(this.list[data.raffleId] === undefined) {
                        this.list[data.raffleId] = 0;
                        $.getJSON('//api.live.bilibili.com/gift/v2/smalltv/join', {roomid: roomID, raffleId: data.raffleId}).done(r2 => {
                            switch(r2.code) {
                                case 0:
                                    this.list[data.raffleId] = new Helper.countdown(r2.data.time + 30, () => this.getAward(roomID, data.raffleId));
                                    break;
                                case -400: //已参加抽奖
                                    break;
                                default:
                                    console.log(r2);
                                    break;
                            }
                        }).fail(() => {
                            this.list[data.raffleId] = undefined;
                            Helper.countdown(2, () => this.join(roomID));
                        });
                    }
                }
            } else {
                console.log(r1);
            }
        }).fail(() => Helper.countdown(2, () => this.join(roomID)));
        // $.getJSON('/SmallTV/join', {roomid: roomID, id: TVID}).done(result => {
        //     if(result.code === 0) {
        //         !this.list[TVID] && (this.list[TVID] = {});
        //         this.list[TVID].countdown_dom = $('<span>');
        //         this.list[TVID].countdown = new Helper.countdown(result.data.dtime, () => this.getAward(TVID), this.list[TVID].countdown_dom);
        //     } else if(result.code == -400) { //已经错过
        //     } else {
        //         console.log(result);
        //     }
        // }).fail(() => Helper.countdown(2, () => this.join(roomID, TVID)));
    }
    static getAward(roomID, raffleID) {
        $.getJSON('//api.live.bilibili.com/gift/v2/smalltv/notice', {roomid: roomID, raffleId: raffleID}).done(result => {
            switch(result.data.status) {
                case 2:
                    delete this.list[raffleID];
                    let award = {awardNumber: result.data.gift_num, awardName: result.data.gift_name, roomID, raffleID};
                    // ModuleStore.addStatinfo('smallTV', result.reward.id, result.reward.num);
                    // ModuleStore.addTimes('smallTV', 1);
                    // Helper.option['notify_autoSmallTV_award_' + result.data.gift_id] && ModuleNotify.smallTV('award', award);
                    ModuleConsole.smallTV('award', award);
                    break;
                case 3: //正在开奖
                    Helper.countdown(30, () => this.getAward(roomID, raffleID));
                    break;
                default:
                    console.log(result);
                    break;
            }
        }).fail(() => Helper.countdown(2, () => this.getAward(roomID, raffleID)));
    }
}
