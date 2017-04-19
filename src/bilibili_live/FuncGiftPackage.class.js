/* globals ModuleConsole,ModuleDom,ModuleNotify,ModuleStore */
class FuncGiftPackage {
    static init() {
        this.package = $('.items-package').clone();
        $('.items-package').after(this.package).remove();

        this.packagePanel = this.package.find('.gifts-package-panel').on('click', (event) => event.stopPropagation());
        this.packagePanelContent = this.packagePanel.find('.gifts-package-content');
        $(document).on('click', () => this.packagePanel.fadeOut(200));
        this.openButton = this.package.find('a').on('click', () => this.openGiftPackage());
        this.packagePanel.find('.live-tips').remove();

        this.sendPanel = $('#gift-package-send-panel').clone().show();
        $('#gift-package-send-panel').after(this.sendPanel).remove();
        this.sendPanel.find('.panel-content').append(`
        <div class="number-group">
            <span class="number-btn">1</span><span class="number-btn">5</span><span class="number-btn">10</span><span class="number-btn">50</span><span class="number-btn">100</span>
            <span class="number-btn">5%</span><span class="number-btn">10%</span><span class="number-btn">50%</span><span class="number-btn">80%</span><span class="number-btn">MAX</span>
        </div>`);

    }

    static openGiftPackage() {
        if(this.packagePanel.css('display') == 'none') {
            $.getJSON('/gift/playerBag').done((result) => {
                if(result.code === 0) {
                    this.loadGiftPackage(this.sortGifts(result.data));
                    this.packagePanel.show();
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
                gift.expireat = parseInt(gift.expireat);
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
                    'gift_id': id,
                    'bag_id': gift.id
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
                giftDom.append(giftItemDom, giftCounterDom);
                giftsDom.append(giftDom);
            }
            this.packagePanelContent.append(giftsDom);
        }
    }

}