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
});
