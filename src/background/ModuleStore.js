/* globals store */
class ModuleStore {
    static init() {
        this.storage = {
            get(key) {
                return JSON.parse(window.localStorage.getItem(`MGH_${key}`));
            },
            set(key, value) {
                window.localStorage.setItem(`MGH_${key}`, JSON.stringify(value));
            },
            del(key) {
                window.localStorage.removeItem(`MGH_${key}`);
            },
        };

        if(!this.storage.get('Version')) this.storage.set('Version', 1); //储存信息版本
        if(!this.storage.get('NoticeVersion')) this.storage.set('NoticeVersion', 0); //通知版本
        if(!this.storage.get('Options')) this.storage.set('Options', {}); //设置
        if(!this.storage.get('RoomIDs')) this.storage.set('RoomIDs', {}); //房间号


        // !store.get('BH_SignDate') && store.set('BH_SignDate', '1970/1/1');
        // !store.get('BH_TreasureDate') && store.set('BH_TreasureDate', '1970/1/1');
        // !store.get('BH_SmallTVStatInfo') && store.set('BH_SmallTVStatInfo', {});
        // !store.get('BH_SmallTVTimes') && store.set('BH_SmallTVTimes', 0);
        // !store.get('BH_SchoolTimes') && store.set('BH_SchoolTimes', 0);
        // !store.get('BH_HideSetting') && store.set('BH_HideSetting', {});

        //store.get('BH_SmallTVCount') !== undefined && store.set('BH_SmallTVTimes', store.get('BH_SmallTVTimes') + store.get('BH_SmallTVCount')) && store.remove('BH_SmallTVCount');



        // this.list = {
        //     'smallTV': 'BH_SmallTV',
        //     'school': 'BH_School',
        //     'summer': 'BH_Summer',
        //     'lighten': 'BH_Lighten',
        // };
    }

    static deepMerge(obj1, obj2) {
        Object.keys(obj2).forEach(key => {
            if(obj1[key] === undefined) obj1[key] = {};
            if(obj1[key].toString() === '[object Object]' && obj2[key].toString() !== '[object Object]') obj2[key] = obj1[key];
            if(obj2[key].toString() === '[object Object]') this.deepMerge(obj1[key], obj2[key]);
            else obj1[key] = obj2[key];
        });
        return obj1;
    }

    static getRoomID(shortID) {
        let room_ids = this.storage.get('RoomIDs');
        return room_ids === null ? 0 : room_ids[shortID] || 0;
    }
    static addRoomID(shortID, roomID) {
        if(Number.isInteger(roomID) === 0) return;
        let room_ids = this.storage.get('RoomIDs');
        room_ids[shortID] = roomID;
        this.storage.set('RoomIDs', room_ids);
    }

    static getOptions() {
        let options = this.deepMerge({
            live: {
                main: true,

                sign: true,
                treasure: true,
                smalltv: true,
                activity: true,
            },
            notify: {
                main: false,

                sign: {
                    main: true,
                    noLogin: true,
                    enabled: false,
                    award: true,
                },
                treasure: {
                    main: true,
                    noLogin: true,
                    noPhone: true,
                    enabled: false,
                    end: true,
                    award: true,
                },
                smalltv: {
                    main: true,

                    noLogin: true,
                },
                activity: {
                    main: true,

                    noLogin: true,
                },
            },
        }, this.storage.get('Options'));
        this.setOptions(options);
        return options;
    }
    static setOptions(options) {
        this.storage.set('Options', options);
    }



    static sign(key) {//TODO 删除
        switch(key) {
            case 'get':
                return store.get('BH_SignDate') == new Date().toLocaleDateString();
            case 'set':
                store.set('BH_SignDate', new Date().toLocaleDateString());
                break;
        }
    }

    static treasure(key) {//TODO 删除
        switch(key) {
            case 'getEnd':
                return store.get('BH_TreasureDate') == new Date().toLocaleDateString();
            case 'end':
                store.set('BH_TreasureDate', new Date().toLocaleDateString());
                break;
        }
    }

    static addTimes(key, number) {
        // key = this.list[key] + 'Times';
        // store.set(key, store.get(key) + number);
    }
    static getTimes(key) {
        // key = this.list[key] + 'Times';
        // return store.get(key) || 0;
    }

    static addStatinfo(key, awardKey, number) {
        // key = this.list[key] + 'StatInfo';
        // let statInfo = store.get(key);
        // statInfo[awardKey] = (statInfo[awardKey] || 0) + number;
        // store.set(key, statInfo);
    }
    static getStatinfo(key) {
        // key = this.list[key] + 'StatInfo';
        // return store.get(key) || [];
    }
}
