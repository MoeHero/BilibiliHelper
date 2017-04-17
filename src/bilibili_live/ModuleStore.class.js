/* globals store */
class ModuleStore {
    static init() {
        !store.get('BH_RoomID') && store.set('BH_RoomID', {});
        !store.get('BH_SignDate') && store.set('BH_SignDate', '1970/1/1');
        !store.get('BH_TreasureDate') && store.set('BH_TreasureDate', '1970/1/1');
        !store.get('BH_SmallTVStatInfo') && store.set('BH_SmallTVStatInfo', {});
        !store.get('BH_SmallTVCount') && store.set('BH_SmallTVCount', 0);
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
            case 'getCount':
                return store.get('BH_SmallTVCount');
            case 'addCount':
                store.set('BH_SmallTVCount', store.get('BH_SmallTVCount') + 1);
                break;
        }
    }

    static smallTV_addStatInfo(key, count) {
        var statInfo = store.get('BH_SmallTVStatInfo');
        statInfo[key] = (statInfo[key] || 0) + count;
        store.set('BH_SmallTVStatInfo', statInfo);
    }
    static smallTV_getStatInfo() {
        return store.get('BH_SmallTVStatInfo');
    }
}
