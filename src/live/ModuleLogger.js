class ModuleLogger {
    static debug(msg) {
        console.debug(this.getMessage('Debug', msg), this.getStyle('Debug'), '');
    }
    static info(msg) {
        console.info(this.getMessage('Info', msg), this.getStyle('Info'), '');
    }
    static warning(msg) {
        console.warn(this.getMessage('Warning', msg), this.getStyle('Warning'), '');
    }
    static error(msg) {
        console.error(this.getMessage('Error', msg), this.getStyle('Error'), '');
    }



    static getMessage(level, msg) {
        function getDate(format) {
            let time = new Date();
            let formatList = {
                'M+': time.getMonth() + 1, //月份
                'd+': time.getDate(), //日
                'h+': time.getHours(), //小时
                'm+': time.getMinutes(), //分
                's+': time.getSeconds(), //秒
                'S': time.getMilliseconds() //毫秒
            };
            if(/(y+)/.test(format)) format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length));
            for(let k in formatList) {
                if(!new RegExp('(' + k + ')').test(format)) continue;
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? formatList[k] : (('00' + formatList[k]).substr((formatList[k] + '').length)));
            }
            return format;
        }
        return `%c${level}%c [${getDate('yyyy-MM-dd hh:mm:ss.S')}] ${msg}`;
    }
    static getStyle(level) {
        let color = '';
        switch(level) {
            case 'Debug':
            case 'Info':
                color = '0CF';
                break;
            case 'Warning':
                color = 'FC3';
                break;
            case 'Error':
                color = 'F33';
                break;
        }
        return `color:#FFF;background-color:#${color};padding:5px;line-height:21px`;
    }

    static printUntreated(json) {
        let callerName = '';
        try {
            throw new Error();
        } catch(e) {
            let regex = /.+?at (.+?) /g;
            regex.exec(e.stack);
            let match = regex.exec(e.stack);
            callerName = match[1] || 'Unknown';
        }
        this.warning(`${callerName} 未处理返回 ${JSON.stringify(json)}`);
    }
}
