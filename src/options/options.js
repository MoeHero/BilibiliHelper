$(function() {
    var background = chrome.extension.getBackgroundPage();

    function setOption(key, value) {
        background.Option[key] = value;
        background.saveOption();
    }

    var switchDefault = $.fn.bootstrapSwitch.defaults;
    switchDefault.state = false;
    switchDefault.size = 'sm';
    switchDefault.onText = '开启';
    switchDefault.offText = '关闭';
    switchDefault.handleWidth = 80;
    $('input[type="checkbox"]').bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
        $('.' + this.id).bootstrapSwitch('disabled', !state);
        setOption(this.id, state);
    });

    for(var i in background.Option) {
        $('.' + i).bootstrapSwitch('disabled', !background.Option[i]);
        $('#' + i).bootstrapSwitch('state', background.Option[i]);
    }

    $.get('updatelog.html').done(function(result) {
        $('#updatelog').html(result);
    });
});
