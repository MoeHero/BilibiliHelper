/* globals ModuleDom,ALPlugin_SmallTV,ALPlugin_Activity */
class FuncAutoLottery {
    static init() {
        if(!Helper.option.live || !Helper.option.live) {
            return;
        }
        this.pluginList = [
            ALPlugin_SmallTV,
            ALPlugin_Activity,
        ];
        this.initDOM();
        this.addEvent();
        for(let plugin of this.pluginList) {
            plugin.init();
        }
    }

    static initDOM() { //TODO 上方小电视状态改为全部抽奖插件状态
        this.statinfoButton = $('<a>').addClass('link bili-link').text('抽奖统计信息');
        this.statinfoPanel = $('<div>').addClass('live-hover-panel arrow-top show bh-statinfo').hide();
        Helper.DOM.info.before($('<div>').addClass('ctrl-item').append(this.statinfoButton)).parent().before(this.statinfoPanel);
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
                statinfosContent.html() === '' && statinfosContent.text('暂无记录');
                this.statinfoPanel.append($('<h4>').addClass('bh-title').text(info.name), $('<span>').addClass('f-right').text(info.times + ' / ' + info.totalTimes), $('<hr>'), statinfosContent);
            }
            this.statinfoPanel.fadeIn(200);
        }
    }
}
