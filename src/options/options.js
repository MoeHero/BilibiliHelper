$(function() {
    $('a[href=\\#]').on('click', (e) => e.preventDefault());
    $('input[type=checkbox]').bootstrapSwitch({
        size: 'small',
        onColor: 'info',
        onText: '启用',
        offText: '禁用',
        handleWidth: 40
    });


    /*
    var background = chrome.extension.getBackgroundPage();

    function setOption(key, value) {
        background.Option[key] = value;
        background.saveOption();
    }

    $('input[type="checkbox"]').bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
        $('.' + this.id).bootstrapSwitch('disabled', !state);
        setOption(this.id, state);
    });

    for(var i in background.Option) {
        $('.' + i).bootstrapSwitch('disabled', !background.Option[i]);
        $('#' + i).bootstrapSwitch('state', background.Option[i]);
    }

    $('.version').text('V' + background.Info.version);

    $.get('updatelog.html').done(function(result) {
        $('#updatelog').html(result);
    });*/
});
