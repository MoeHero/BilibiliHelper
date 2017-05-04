/* globals ModuleDom,ALPlugin_SmallTV,ALPlugin_Lighten */
class FuncAutoLottery {
    static init() {
        if(!Live.option.live || !Live.option.live) {
            return;
        }
        this.pluginList = [
            ALPlugin_SmallTV,
            ALPlugin_Lighten
        ];
        this.initDOM();
        this.addEvent();
        for(let key in this.pluginList) {
            let plugin = this.pluginList[key];
            plugin.init();
        }
    }

    static initDOM() {
        this.statinfoButton = $('<a>').addClass('link bili-link').text('抽奖统计信息');
        this.statinfoPanel = $('<div>').addClass('live-hover-panel arrow-top show bh-statinfo').hide();
        Live.DOM.info.before($('<div>').addClass('ctrl-item').append(this.statinfoButton)).parent().before(this.statinfoPanel);
    }
    static addEvent() {
        this.statinfoButton.on('click', () => this.openStatinfoPanel()).stopPropagation();
        this.statinfoPanel.stopPropagation();
        $(document).on('click', () => this.statinfoPanel.fadeOut(200));
    }

    static openStatinfoPanel() {
        if(this.statinfoPanel.css('display') == 'none') {
            this.statinfoPanel.empty();
            let infoList = [];
            for(let key in this.pluginList) {
                let plugin = this.pluginList[key];
                infoList.push(plugin.getInfo());
            }
            for(let i in infoList) {
                let info = infoList[i];
                let statinfosContent = $('<ul>');
                for(let key in info.statinfo) {
                    statinfosContent.append($('<li>').text(key + 'x' + info.statinfo[key]));
                }
                this.statinfoPanel.append($('<h4>').addClass('bh-title').text(info.name), $('<span>').addClass('f-right').text(info.times + ' 次'), $('<hr>'), statinfosContent);
            }
            this.statinfoPanel.fadeIn(200);
        }
    }
}
