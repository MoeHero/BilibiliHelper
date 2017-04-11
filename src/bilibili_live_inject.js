/* globals extensionID */
window._server_callback = window.server_callback;
window.server_callback = function(json) {
    chrome.runtime.sendMessage(extensionID, json);
    window._server_callback(json);
};
