/* globals extensionID */
//消息拦截
window.server_callback = window._playerEventMap.player_event_0.callback;
window._playerEventMap.player_event_0.callback = json => {
    window.server_callback(json);
    chrome.runtime.sendMessage(extensionID, json);
};

console.log('%cInfo%c 直播间脚本注入成功(=・ω・=)~', 'color:#FFF;background-color:#57D2F7;margin-top:-10px;padding:5px;line-height:21px', '');
