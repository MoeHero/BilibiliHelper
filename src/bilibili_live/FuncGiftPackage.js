class FuncGiftPackage {
    static init() {
        if(!Helper.option.live || !Helper.option.live_giftPackage) {
            return;
        }
        this.numberGroup = ['1', '5', '10', '50', '100', '5%', '10%', '50%', '80%', 'MAX'];

        this.initDOM();
        this.addEvent();
    }

    static initDOM() {
        this.package = $('.items-package').clone();
        this.packageButton = this.package.find('a');
        this.packagePanel = this.package.find('.gifts-package-panel');
        this.packagePanelContent = this.packagePanel.find('.gifts-package-content');
        this.packageSendAll = $('<p>').addClass('f-right live-btn default').text('清空包裹');

        this.sendPanel = $('#gift-package-send-panel').clone();
        this.sendPanelImage = this.sendPanel.find('.gift-img');
        this.sendPanelInfo = this.sendPanel.find('.gift-info>p');
        this.sendPanelButton = this.sendPanel.find('.send-ctrl>button');
        this.sendPanelCloseButton = this.sendPanel.find('.close-btn');
        this.sendPanelCount = this.sendPanel.find('.send-ctrl>input');
        let numberGroup = $('<div>').addClass('number-group');
        for(let key in this.numberGroup) {
            let numberButton = $('<span>').text(this.numberGroup[key]).on('click', (e) => this.setNumber($(e.currentTarget)));
            numberGroup.append(numberButton);
        }
        this.sendPanel.find('.panel-content').append(numberGroup);

        this.packagePanel.find('.gifts-package-title').before(this.packageSendAll);
        this.packagePanel.find('.live-tips').remove();
        $('.items-package').after(this.package).remove();
        $('#gift-package-send-panel').after(this.sendPanel).remove();
    }
    static addEvent() {
        this.packagePanel.stopPropagation();
        this.sendPanel.stopPropagation();
        $(document).on('click', () => this.packagePanel.fadeOut(200));

        this.packageButton.on('click', () => this.openGiftPackage());
        this.packageSendAll.on('click', () => this.sendAllGift());
        this.sendPanelButton.on('click', () => this.sendGift());
        this.sendPanelCloseButton.on('click', () => this.sendPanel.hide());

        Helper.getMessage((request) => {
            if(request.command && request.command == 'openGiftPackage') {
                this.openGiftPackage();
            }
        });
        Helper.getMessage((request) => {
            if(request.command && request.command == 'sendGiftCallback') {
                let result = request.result;
                let liveToastElement = this.sendPanel.css('display') == 'none' ? this.packageButton : this.sendPanelButton;
                switch(result.code) {
                    case 0:
                        if(result.data.remain === 0) {
                            delete this.gifts[this.currentGiftID][this.currentKey];
                            this.updateGiftPackage();
                            this.sendPanel.hide();
                        } else {
                            this.gifts[this.currentGiftID][this.currentKey].number = result.data.remain;
                            this.gift = this.gifts[this.currentGiftID][this.currentKey];

                            this.sendPanelInfo.text(`您的包裹中还剩 ${this.gift.number} 个可用`);
                            if(this.sendPanelCount.val() > this.gift.number) {
                                this.sendPanelCount.val(this.gift.number);
                            }
                            this.updateGiftPackage();
                        }
                        break;
                    case -400: //应援棒提示
                        Helper.liveToast('只有在入围偶像活动的主播房间才能赠送该道具!', liveToastElement, 'caution');
                        break;
                    case 200005: //无法给自己赠送道具
                        Helper.liveToast('无法给自己赠送道具!', liveToastElement, 'caution');
                        break;
                    case 1024: //超时
                        Helper.liveToast('赠送礼物超时,请稍后再试!', liveToastElement, 'error');
                        break;
                    default:
                        console.log(result);
                        break;
                }
                this.sendPanelCount.focus();
            }
        });
    }

    static openGiftPackage() {
        if(this.packagePanel.css('display') == 'none') {
            $.getJSON('/gift/playerBag').done((result) => {
                switch(result.code) {
                    case 0:
                        this.gifts = this.sortGift(result.data);
                        this.updateGiftPackage();
                        this.packagePanel.show();
                        break;
                    case -101: //未登录
                        Helper.liveToast('请先登录!', this.packageButton, 'caution');
                        break;
                    default:
                        console.log(result);
                        break;
                }
            }).fail(() => Helper.countdown(2, () => this.openGiftPackage()));
        }
    }
    static sortGift(gifts) {
        let _gifts = {};
        for(let gift of gifts) {
            let newGift = [];
            switch(gift.expireat) {
                case '今日':
                    newGift.expire = 0;
                    newGift.expireText = '今天';
                    break;
                case 0:
                    newGift.expire = Infinity;
                    newGift.expireText = '永久';
                    break;
                default:
                    newGift.expire = Number.parseInt(gift.expireat);
                    newGift.expireText = gift.expireat;
                    break;
            }
            newGift.id = gift.gift_id;
            newGift.name = gift.gift_name;
            newGift.number = gift.gift_num;
            newGift.bagID = gift.id;
            _gifts[newGift.id] === undefined && (_gifts[newGift.id] = []);
            _gifts[newGift.id].push(newGift);
        }
        for(let id in _gifts) {
            _gifts[id].sort((a, b) => a.expire - b.expire);
        }
        return _gifts;
    }
    static updateGiftPackage() {
        this.packagePanelContent.empty();
        for(let id in this.gifts) {
            let gifts = this.gifts[id];
            let giftsDom = $('<li>').addClass('gift-item-group');
            for(let i in gifts) {
                let gift = gifts[i];
                let giftDom = $('<span>');
                let giftItem = $('<div>').addClass('gift-item gift-item-package gift-' + id).attr('title', gift.name)
                    .html(`<span class="expires">${gift.expireText}</span>`);
                let giftCount = $('<div>').addClass('gift-count').text('x' + gift.number);

                giftItem.on('click', (e) => this.openSendPanel($(e.currentTarget)));
                giftsDom.append(giftDom.append(giftItem, giftCount));
            }
            this.packagePanelContent.append(giftsDom);
        }
    }

    static openSendPanel(target) {
        this.currentGiftID = target.attr('class').match(/gift-(\d+)/)[1];
        this.currentKey = target.parent().index();
        this.currentGift = this.gifts[this.currentGiftID][this.currentKey];

        this.sendPanelImage.attr('class', 'gift-img float-left gift-' + this.currentGiftID);
        this.sendPanelInfo.text(`您的包裹中还剩 ${this.currentGift.number} 个可用`);
        this.sendPanelCount.val(this.currentGift.number);
        this.sendPanel.show();
    }
    static setNumber(target) {
        let number = target.text();
        if(number == 'MAX') {
            number = this.currentGift.number;
        } else if(number.endsWith('%')) {
            number = Math.round(this.currentGift.number * Number.parseInt(number) * 0.01);
        }
        if(number > this.currentGift.number || isNaN(number)) {
            number = this.currentGift.number;
        } else if(number < 1) {
            number = 1;
        }
        this.sendPanelCount.val(number);
    }
    static sendGift() {
        Helper.addScriptByText(`bh_sendGift_package(${this.currentGiftID}, ${this.sendPanelCount.val()}, ${this.currentGift.bagID});`).remove();
    }
    static sendAllGift() {
        for(let id in this.gifts) {
            for(let gift of this.gifts[id]) {
                if(id != 69 && gift.expire != Infinity) {
                    Helper.addScriptByText(`bh_sendGift_package(${id}, ${gift.number}, ${gift.bagID});`).remove();
                }
            }
        }
    }
}
