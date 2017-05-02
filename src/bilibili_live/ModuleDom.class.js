class ModuleDom {
    static init() {
        {
            this.info = $('<div>').addClass('seeds-buy-cntr');
            let bhInfo = $('<div>').addClass('ctrl-item')
                .html(`${Live.localize.helper} V${Live.info.version}　QQ群:<a class="bili-link" target="_blank" href="//jq.qq.com/?k=47vw4s3">285795550</a>`);
            this.info.append(bhInfo);
            $('.control-panel').prepend(this.info);
        } //瓜子数量 左

        if(Live.option.live && (Live.option.live_autoTreasure || Live.option.live_autoSmallTV)) {
            this.funcInfoRow = $('<div>').addClass('bh-func-info-row');
            this.funcInfoRow.append($('<div>').addClass('func-info v-top').html(`<span>分区: </span>${$('.room-info-row a')[0].outerHTML}`));
            $('.anchor-info-row').css('margin-top', 0).after(this.funcInfoRow);

            $('.room-info-row').remove();
        } //主播信息 下
    }
}
