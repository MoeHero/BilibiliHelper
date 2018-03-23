/* jshint undef:false */
ModuleLogger.info('萌园助手(MoeGarden Helper) Background Script V' + Helper.info.version);
ModuleLogger.info('萌园助手官网: https://bh.moehero.com');

ModuleStore.init();
ModuleCollection.init();

Helper.options = ModuleStore.getOptions();
function observe(obj) {
    Object.keys(obj).forEach(key => {
        let value = obj[key];
        if(Object.prototype.toString.call(value) == '[object Object]') observe(value);
        Object.defineProperty(obj, key, {
            get: () => value,
            set: v => {
                if(value === v) return;
                value = v;
                ModuleStore.setOptions(Helper.options);
            },
        });
    });
}
observe(Helper.options);
Helper.getUserInfo().then(r => {
    FuncSign.init();
    FuncTreasure.init();
    FuncSmallTV.init();
    FuncActivity.init();
    FuncBilibiliClient.init();
});
