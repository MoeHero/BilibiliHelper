$(function() {
    let background = chrome.extension.getBackgroundPage();

    $('a[href=\\#]').on('click', (e) => e.preventDefault());
    $('input[type=checkbox]').bootstrapSwitch({
        size: 'small',
        onColor: 'info',
        onText: '启用',
        offText: '禁用',
        handleWidth: 30
    });

    $('input[type="checkbox"]').bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
        $('.' + this.id).bootstrapSwitch('disabled', !state);
        background.Option[this.id] = state;
        background.saveOption();
    });

    for(var i in background.Option) {
        $('.' + i).bootstrapSwitch('disabled', !background.Option[i]);
        $('#' + i).bootstrapSwitch('state', background.Option[i]);
    }

    $('.bh-version').text('V' + background.Info.version);
    $('.bh-updatelog').load('updatelog.html');
});
