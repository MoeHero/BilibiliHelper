$(function() {
    function openVideo() {
        if($('#av-number').val() !== '') {
            window.open('https://www.bilibili.com/video/av' + $('#av-number').val());
        }
    }
    $('#video').on('click', () => openVideo());
    $('#av-number').on('keypress', e => {
        e.keyCode == 13 && openVideo();
    });
    $('#reload').on('click', () => {
        let background = chrome.extension.getBackgroundPage();
        background.Sign.delSign();
        background.Treasure.delTreasure();
        background.SmallTV.delSmallTV();
        background.Activity.delActivity();
    });
});
