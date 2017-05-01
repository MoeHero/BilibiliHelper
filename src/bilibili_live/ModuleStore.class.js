/* globals store */
class ModuleStore {
    static init() {
        !store.get('BH_RoomID') && store.set('BH_RoomID', {});
        !store.get('BH_SignDate') && store.set('BH_SignDate', '1970/1/1');
        !store.get('BH_TreasureDate') && store.set('BH_TreasureDate', '1970/1/1');
        !store.get('BH_SmallTVStatInfo') && store.set('BH_SmallTVStatInfo', {});
        !store.get('BH_SmallTVTimes') && store.set('BH_SmallTVTimes', 0);
        !store.get('BH_LightenTimes') && store.set('BH_LightenTimes', 0);

        store.get('BH_SmallTVCount') && store.set('BH_SmallTVTimes', store.get('BH_SmallTVCount')) && store.remove('BH_SmallTVCount');

        this.list = {
            'lighten': 'BH_Lighten',
            'smallTV': 'BH_SmallTV'
        };
    }

    static roomID_get(showID) {
        return store.get('BH_RoomID')[showID] || 0;
    }
    static roomID_add(showID, roomID) {
        var o = store.get('BH_RoomID');
        o[showID] = roomID;
        store.set('BH_RoomID', o);
    }

    static sign(key) {
        switch(key) {
            case 'get':
                return store.get('BH_SignDate') == new Date().toLocaleDateString();
            case 'set':
                store.set('BH_SignDate', new Date().toLocaleDateString());
                break;
        }
    }

    static treasure(key) {
        switch(key) {
            case 'getEnd':
                return store.get('BH_TreasureDate') == new Date().toLocaleDateString();
            case 'end':
                store.set('BH_TreasureDate', new Date().toLocaleDateString());
                break;
        }
    }

    static addTimes(key, number) {
        key = this.list[key] + 'Times';
        store.set(key, store.get(key) + number);
    }
    static getTimes(key) {
        key = this.list[key] + 'Times';
        return store.get(key);
    }

    static addStatinfo(key, awardKey, number) {
        key = this.list[key] + 'StatInfo';
        let statInfo = store.get(key);
        statInfo[awardKey] = (statInfo[awardKey] || 0) + number;
        store.set(key, statInfo);
    }
    static getStatinfo(key) {
        key = this.list[key] + 'StatInfo';
        return store.get(key);
    }
}
