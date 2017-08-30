let reg = window.location.hash.substr(1).match(/(^|&)access_token=([^&]*)(&|$)/);
if(reg != null) {
    window.localStorage.setItem('bh_token', window.decodeURIComponent(reg[2]));
}
window.location = '/options/options.html';