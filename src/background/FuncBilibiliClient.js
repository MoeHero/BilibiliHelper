/* globals FuncSmallTV,FuncActivity */
class FuncBilibiliClient {
    static init() {
        this.ws = new WebSocket('wss://broadcastlv.chat.bilibili.com:2245/sub');
        this.ws.binaryType = 'arraybuffer';
        this.ws.onopen = () => {
            this.sendData(7, JSON.stringify({uid: Helper.userInfo.uid, roomid: 22440, protover: 1, platform: 'web', clientver: '1.3.0'}));
            this.heartbeatTimer = Helper.timer(3e4, () => this.sendData(2));
        };
        this.ws.onmessage = e => {
            this.parseData(e.data);
        };
        this.ws.onclose = e => {
            this.heartbeatTimer.clearTimer();
            this.init();
        };
    }

    static sendData(type, data = '') {
        if(this.ws.readyState !== WebSocket.OPEN) return;
        let length = 16 + data.length;
        let view = new DataView(new ArrayBuffer(length));
        view.setInt32(0, length); //包总长度
        view.setInt16(4, 16); //头部长度
        view.setInt16(6, 1); //版本
        view.setInt32(8, type); //类型
        view.setInt32(12, 1); //设备
        if(data !== '') for(let i = 0; i < data.length; i++) view.setInt8(i + 16, data[i].charCodeAt());
        this.ws.send(view);
    }

    static parseData(buffer) {
        buffer = new DataView(buffer);
        let dataLength = buffer.byteLength;
        if(dataLength < 16 || dataLength > 0x100000) return;
        let packageLength = buffer.getUint32(0);
        if(packageLength > dataLength || packageLength < 16 || packageLength > 0x100000) return;
        switch(buffer.getInt32(8)) {
            // case 1:
            // case 2:
            // case 3:
            //     //emit('commentInLine', data.readUInt32BE(packageIndex + 16));
            //     break;
            case 4:
            case 5:
                let bytes = [];
                for(let i = 0; i < packageLength - 16; i++) bytes.push(buffer.getUint8(16 + i));
                this.parseDanmaku(JSON.parse(byteToString(bytes)));
                break;
            // case 8:
            //     emit('serverSuccess', '服务器连接成功');
            //     break;
            // case 17:
            //     emit('serverUpdate', '服务器升级中');
            //     break;
        }
        function byteToString(arr) {
            return decodeURIComponent(arr.reduce((p, c) => p + '%' + c.toString(16), ''));
        }
    }
    static parseDanmaku(danmaku) {
        switch(danmaku.cmd) {
            case 'SYS_MSG':
                if(Helper.options.live.smalltv && danmaku.tv_id != null) FuncSmallTV.join(danmaku.tv_id, danmaku.real_roomid);
                break;
            case 'SYS_GIFT':
                // if(Helper.options.live.activity && danmaku.roomid != null) FuncActivity.join(danmaku.roomid);
                break;
        }
    }
}
