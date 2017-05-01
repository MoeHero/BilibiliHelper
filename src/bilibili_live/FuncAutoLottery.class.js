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
        ModuleDom.info.before($('<div>').addClass('ctrl-item').append(this.statinfoButton));
        $('.control-panel').before(this.statinfoPanel);
    }
    static addEvent() {
        this.statinfoButton.on('click', (e) => {this.openStatinfoPanel();e.stopPropagation();});
        this.statinfoPanel.on('click', (e) => e.stopPropagation());
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
                console.log(info);
                let statinfosContent = $('<ul>');
                for(let key in info.statinfo) {
                    statinfosContent.append($('<li>').text(key + 'x' + info.statinfo[key]));
                }
                this.statinfoPanel.append($('<h4>').addClass('bh-title').text(info.name))
                    .append($('<span>').addClass('f-right').text(info.times + ' 次')).append($('<hr>')).append(statinfosContent);
            }
            this.statinfoPanel.fadeIn(200);
        }
    }
}
