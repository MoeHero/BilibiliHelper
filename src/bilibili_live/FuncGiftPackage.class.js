/* globals ModuleConsole,ModuleDom,ModuleNotify,ModuleStore */
class FuncGiftPackage {
    static init() {
        if(!Live.option.live || !Live.option.live_giftPackage) {
            return;
        }
        this.package = $('.items-package').clone();
        $('.items-package').after(this.package).remove();

        this.packagePanel = this.package.find('.gifts-package-panel');
        this.packagePanelContent = this.packagePanel.find('.gifts-package-content');
        this.openButton = this.package.find('a');

        this.packagePanel.find('.live-tips').remove();

        this.sendPanel = $('#gift-package-send-panel').clone();
        $('#gift-package-send-panel').after(this.sendPanel).remove();
        this.sendPanel.find('.panel-content').append(`
        <div class="number-group">
            <span class="number-btn">1</span><span class="number-btn">5</span><span class="number-btn">10</span><span class="number-btn">50</span><span class="number-btn">100</span>
            <span class="number-btn">5%</span><span class="number-btn">10%</span><span class="number-btn">50%</span><span class="number-btn">80%</span><span class="number-btn">MAX</span>
        </div>`.trim());
        this.countInput = this.sendPanel.find('.send-ctrl>input');
        this.sendPanel.find('.send-ctrl>button').on('click', () => this.sendGift());

        this.openButton.on('click', () => this.openGiftPackage());

        this.packagePanel.on('click', (event) => event.stopPropagation());
        this.sendPanel.on('click', (event) => event.stopPropagation());
        $(document).on('click', () => this.packagePanel.fadeOut(200));

        this.sendPanel.find('.number-btn').on('click', (event) => this.setNumber($(event.currentTarget)));
        this.sendPanel.find('.close-btn').on('click', () => this.sendPanel.hide());

        Live.getMessage((request) => {
            if(request.cmd && request.cmd == 'openGiftPackage') {
                this.openGiftPackage();
            }
        });
    }

    static openGiftPackage() {
        if(this.packagePanel.css('display') == 'none') {
            $.getJSON('/gift/playerBag').done((result) => {
                if(result.code === 0) {
                    this.loadGiftPackage(this.sortGifts(result.data));
                    this.packagePanel.show();
                } else if(result.code == -101) { //未登录

                } else {
                    console.log(result);
                    Live.countdown(2, () => this.openGiftPackage());
                }
            }).fail(() => {
                Live.countdown(2, () => this.openGiftPackage());
            });
        }
    }
    static sortGifts(giftData) {
        let result = {};
        for(let i in giftData) {
            let gift = giftData[i];
            if(gift.expireat == '今日') {
                gift.expireat = 0;
            } else if(gift.expireat === 0) {
                gift.expireat = 9999;
            } else {
                gift.expireat = Number.parseInt(gift.expireat);
            }
            if(result[gift.gift_id] === undefined) {
                result[gift.gift_id] = [];
            }
            result[gift.gift_id].push(gift);
        }
        for(let id in result) {
            result[id].sort((a, b) => a.expireat - b.expireat);
        }
        return result;
    }
    static loadGiftPackage(giftData) {
        this.packagePanelContent.empty();
        for(let id in giftData) {
            let gifts = giftData[id];
            let giftsDom = $('<li />').addClass('gift-item-group').attr('gift_id', id);
            for(let i in gifts) {
                let gift = gifts[i];
                let giftDom = $('<span />').attr({
                    'title': gift.gift_name,
                    'gift-id': id,
                    'bag-id': gift.id
                });
                let giftItemDom = $('<div />').addClass('gift-item gift-item-package gift-' + id);
                if(gift.expireat == 9999) {
                    giftItemDom.html('<span class="expires">永久</span>');
                } else if(gift.expireat === 0) {
                    giftItemDom.html('<span class="expires">今天</span>');
                } else {
                    giftItemDom.html(`<span class="expires">${gift.expireat}天</span>`);
                }
                let giftCounterDom = $('<div />').addClass('gift-count').text('x' + gift.gift_num);
                giftItemDom.on('click', (event) => this.openSendPanel($(event.currentTarget).parent()));
                giftDom.append(giftItemDom, giftCounterDom);
                giftsDom.append(giftDom);
            }
            this.packagePanelContent.append(giftsDom);
        }
    }

    static openSendPanel(target) {
        this.currentGift = {
            giftID: target.attr('gift-id'),
            bagID: target.attr('bag-id'),
            count: Number.parseInt(target.find('.gift-count').text().substr(1)),
            element: target
        };
        this.sendPanel.find('.gift-img').attr('class', 'gift-img float-left gift-' + this.currentGift.giftID);
        this.sendPanel.find('.gift-info>p').text(`您的包裹中还剩 ${this.currentGift.count} 个可用`);
        this.sendPanel.find('.send-ctrl>input').val(this.currentGift.count);
        this.sendPanel.show();
    }
    static setNumber(target) {
        let number = target.text();
        if(number == 'MAX') {
            number = this.currentGift.count;
        } else if(number.endsWith('%')) {
            number = Math.round(this.currentGift.count * Number.parseInt(number) * 0.01);
        }
        if(number > this.currentGift.count || isNaN(number)) {
            number = this.currentGift.count;
        } else if(number < 1) {
            number = 1;
        }
        this.countInput.val(number);
    }
    static sendGift() {
        this.sendGiftCallback = Live.getMessage((request) => {
            if(request.command && request.command == 'sendGiftCallback') {
                let result = request.result;
                if(result.code === 0) {
                    if(result.data.remain === 0) {
                        this.currentGift.element.remove();
                        this.sendPanel.hide();
                    } else {
                        this.sendPanel.find('.gift-info>p').text(`您的包裹中还剩 ${result.data.remain} 个可用`);
                        if(this.countInput.val() > result.data.remain) {
                            this.countInput.val(result.data.remain);
                        }
                        this.currentGift.element.find('.gift-count').text('x' + result.data.remain);
                        this.currentGift.count = result.data.remain;
                    }
                } else if(result.code == 200005) { //无法给自己赠送道具
                } else {
                    console.log(result);
                }
            }
        });
        Live.addScriptByText(`bh_sendGift(${this.currentGift.giftID}, ${this.countInput.val()}, ${this.currentGift.bagID});`);
    }
}
