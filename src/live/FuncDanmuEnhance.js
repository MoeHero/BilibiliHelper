// class FuncDanmuEnhance {
//     static init() {
//         if(!Helper.option.live || !Helper.option.live_danmuEnhance) {
//             return;
//         }
//         this.danmuEmojiList = [];//['(⌒▽⌒)', '（￣▽￣）', '(=・ω・=)', '(｀・ω・´)', '(〜￣△￣)〜', '(･∀･)', '(°∀°)ﾉ', '(￣3￣)', '╮(￣▽￣)╭', '_(:3」∠)_', '( ´_ゝ｀)', '←_←', '→_→', '(<_<)', '(>_>)', '(;¬_¬)', '(\'▔□▔)/', '(ﾟДﾟ≡ﾟдﾟ)!?', 'Σ(ﾟдﾟ;)', 'Σ( ￣□￣||)', '(´；ω；`)', '（/TДT)/', '(^・ω・^ )', '(｡･ω･｡)', '(●￣(ｴ)￣●)', 'ε=ε=(ノ≧∇≦)ノ', '(´･_･`)', '(-_-#)', '（￣へ￣）', '(￣ε(#￣) Σ', 'ヽ(`Д´)ﾉ', '（#-_-)┯━┯', '(╯°口°)╯(┴—┴', '←◡←', '( ♥д♥)', 'Σ>―(〃°ω°〃)♡→', '⁄(⁄ ⁄•⁄ω⁄•⁄ ⁄)⁄', '(╬ﾟдﾟ)▄︻┻┳═一', '･*･:≡(　ε:)', '(汗)', '(苦笑)'];
//         this.danmuHotwordList = ['当然是选择原谅她啊！', '还有这种操作！', '怕是要修仙哦', 'gay里gay气', '身败名裂', '请大家注意弹幕礼仪哦！', '那你很棒哦！', '向大佬低头', '厉害了我的哥！', 'bilibili-(゜-゜)つロ乾杯~', 'prprpr', '一颗赛艇', '因吹思婷', 'excuse me？', 'gg', '你为什么这么熟练啊', '老司机带带我', '666666666', '啪啪啪啪啪', 'Yooooooo', 'FFFFFFFFFF', '色情主播', '红红火火恍恍惚惚', '喂，妖妖零吗', '_(:з」∠)_', '2333333'];
//         this.danmuColorList = [];//['ffffff', 'ff6868', '66ccff', 'e33fff', '00fffc', '7eff00', 'ffed4f', 'ff9800', 'ff739a'];
//         this.danmuModeList = [{name: '滚动', mode: 1, type: 'scroll'}, {name: '顶部', mode: 5, type: 'top'}];
//         this.selectDanmuColor = 0;
//         this.selectDanmuMode = 1;
//         this.maxLength = Helper.userInfo.userLevel >= 20 ? 30 : 20;
//
//         this.initDOM();
//         this.addEvent();
//     }
//
//     static initDOM() {
//         this.danmuColorButton = $('.danmu-color').clone();
//         this.danmuColorPanel = $('.danmu-color-panel').clone();
//         this.danmuModeSelectPanel = this.danmuColorPanel.find('.mode-select-panel');
//         this.danmuColorSelectPanel = this.danmuColorPanel.find('.color-select-panel');
//         this.danmuTextbox = $('.danmu-textbox').clone().removeAttr('maxlength');
//         this.danmuSendButton = $('.danmu-send-btn').clone();
//         this.danmuLenghtText = $('.danmu-length-count').clone().text('0 / ' + this.maxLength);
//         this.danmuEmojiPanel = $('.emoji-panel').clone().empty();
//         this.danmuHotwordPanel = $('.hot-words-ctnr').clone().attr('style', 'overflow:auto!important;overflow-x:hidden;').empty();
//         for(let hotword of this.danmuHotwordList) {
//             this.danmuHotwordPanel.append($('<a>').text(hotword).on('click', e => this.addMsg($(e.currentTarget).text())));
//         }
//
//         $('.danmu-color-panel').after(this.danmuColorPanel).remove();
//         $('.danmu-textbox').after(this.danmuTextbox).remove();
//         $('.danmu-send-btn').after(this.danmuSendButton).remove();
//         $('.danmu-length-count').after(this.danmuLenghtText).remove();
//         $('.emoji-panel').after(this.danmuEmojiPanel).remove();
//         $('.hot-words-ctnr').after(this.danmuHotwordPanel).remove();
//     }
//     static addEvent() {
//         $('.danmu-color').on('click', () => this.danmuColorPanel.show()).stopPropagation();
//         $('.hot-words').on('click', () => this.danmuHotwordPanel.show()).stopPropagation();
//         $('.emoji').on('click', () => this.danmuEmojiPanel.show()).stopPropagation();
//
//         this.danmuColorPanel.stopPropagation();
//         this.danmuEmojiPanel.stopPropagation();
//         this.danmuHotwordPanel.stopPropagation();
//         $(document).on('click', () => {
//             this.danmuColorPanel.fadeOut(200);
//             this.danmuEmojiPanel.fadeOut(200);
//             this.danmuHotwordPanel.fadeOut(200);
//         });
//         this.danmuSendButton.on('click', () => this.sendLongDanmu());
//
//         this.danmuTextbox.on('input', () => {
//             let lenght = this.danmuTextbox.val().length;
//             let lenghtText = (lenght % this.maxLength === 0 ? this.maxLength : Number.parseInt(lenght % this.maxLength)) + ' / ' + this.maxLength;
//             lenght > this.maxLength && (lenghtText += ' * ' + (Number.parseInt(lenght / this.maxLength) - (lenght % this.maxLength === 0 ? 1 : 0)));
//             lenght === 0 && (lenghtText = '0 / ' + this.maxLength);
//             this.danmuLenghtText.text(lenghtText);
//         }).on('keydown', (e) => {
//             if(e.keyCode == 13) {
//                 e.preventDefault();
//                 this.sendLongDanmu();
//             }
//         });
//
//         Helper.addScriptByText('bh_getDanmuInfo();').remove();
//         Helper.getMessage((request) => {
//             if(request.command && request.command == 'getDanmuInfo') {
//                 if(request.danmuInfo.selectColor === '' || request.danmuInfo.colorList == '[]') {
//                     Helper.countdown(1, () => Helper.addScriptByText('bh_getDanmuInfo();').remove());
//                 } else {
//                     this.danmuColorList = JSON.parse(request.danmuInfo.colorList);
//                     this.danmuEmojiList = JSON.parse(request.danmuInfo.emojiList);
//                     this.selectDanmuColor = this.danmuColorList.indexOf(request.danmuInfo.selectColor.substring(2));
//                     this.selectDanmuMode = request.danmuInfo.selectMode;
//                     this.updateDanmuColorPanel();
//                 }
//             }
//         });
//     }
//
//     static addMsg(msg) {
//         this.danmuTextbox.val(this.danmuTextbox.val() + msg).trigger('input');
//     }
//
//     static updateDanmuColorPanel() {
//         this.danmuModeSelectPanel.empty();
//         this.danmuColorSelectPanel.empty();
//         this.danmuEmojiPanel.empty();
//         for(let danmuMode of this.danmuModeList) {
//             let modeDOM = $('<a>').addClass('list danmu-mode-block ' + danmuMode.type).text(danmuMode.name)
//                 .on('click', (e) => this.setDanmuConfig('mode', $(e.currentTarget)));
//             if(this.selectDanmuMode == danmuMode.mode) {
//                 modeDOM.addClass('active');
//             }
//             this.danmuModeSelectPanel.append(modeDOM);
//         }
//         for(let i in this.danmuColorList) {
//             let colorDOM = $('<a>').addClass('danmu-color-block').css('background-color', '#' + this.danmuColorList[i])
//                 .on('click', (e) => this.setDanmuConfig('color', $(e.currentTarget)));
//             if(this.selectDanmuColor == i) {
//                 colorDOM.addClass('active');
//             }
//             this.danmuColorSelectPanel.append($('<li>').append(colorDOM));
//         }
//         for(let emoji of this.danmuEmojiList) {
//             this.danmuEmojiPanel.append($('<a>').html(emoji).on('click', e => this.addMsg($(e.currentTarget).text())));
//         }
//     }
//     static setDanmuConfig(type, target) {
//         let index = type == 'color' ? target.parent().index() : target.index();
//         if(!(type == 'color' && index == this.selectDanmuColor) && !(type == 'mode' && this.danmuModeList[index].mode == this.selectDanmuMode)) {
//             $.ajax({
//                 url: '/api/ajaxSetConfig', type: 'post', dataType: 'json',
//                 data: type == 'color' ? {color: '0x' + this.danmuColorList[index], room_id: Helper.roomID} : {mode: this.danmuModeList[index].mode, room_id: Helper.roomID}
//             }).done((result) => {
//                 switch(result.code) {
//                     case 0:
//                         if(type == 'color') {
//                             this.selectDanmuColor = index;
//                         } else {
//                             this.selectDanmuMode = index;
//                         }
//                         this.updateDanmuColorPanel();
//                         break;
//                     case -500:
//                         Helper.liveToast(result.msg, target, 'info');
//                         break;
//                     default:
//                         console.log(result);
//                         break;
//                 }
//             }).fail(() => Helper.liveToast('设置错误, 请稍后再试!', target, 'error'));
//         }
//     }
//
//     static sendLongDanmu() {
//         let danmu = this.danmuTextbox.val();
//         if(danmu !== '') {
//             this.danmuTextbox.val('').focus();
//             this.danmuLenghtText.text('0 / ' + this.maxLength);
//             this.sendDanmu(this.splitDanmu(danmu));
//         } else {
//             Helper.liveToast('请输入弹幕后再发送~', this.danmuSendButton, 'info');
//         }
//     }
//     static splitDanmu(danmu) {
//         let danmus = [];
//         for(let i = 0; i < Math.floor(danmu.length / this.maxLength) + 1; i++) {
//             let _danmu = danmu.substr(i * this.maxLength, this.maxLength);
//             _danmu !== '' && danmus.push(_danmu);
//         }
//         return danmus;
//     }
//     static sendDanmu(danmus) {
//         this.sendDanmu_player(danmus[0]).then(() => {
//             if(danmus.length > 1) {
//                 danmus.splice(0, 1);
//                 Helper.countdown(2, () => this.sendDanmu(danmus));
//             }
//         });
//     }
//     static sendDanmu_player(danmu) {
//         return new Promise((resolve) => {
//             Helper.addScriptByText(`bh_sendDanmu('${Helper.escape(danmu)}', '0x${this.danmuColorList[this.selectDanmuColor]}', ${this.selectDanmuMode});`).remove();
//             resolve();
//         });
//     }
//     static sendDanmu_post(danmu, roomID) {
//         return $.ajax({
//             url: '/msg/send', type: 'post', dataType: 'json',
//             data: {
//                 color: '0x' + this.danmuColorList[this.selectDanmuColor],
//                 msg: danmu,
//                 room_id: roomID
//             }
//         }).promise();
//     }
// }
