'use strict';
$(function() {
    let background = chrome.extension.getBackgroundPage();

    $('a[href=\\#]').on('click', (e) => e.preventDefault());
    $('input[type=checkbox]').bootstrapSwitch({
        size: 'small',
        onColor: 'info',
        onText: '启用',
        offText: '禁用',
        handleWidth: 30
    }).on('switchChange.bootstrapSwitch', function(event, state) {
        $('.' + this.id).bootstrapSwitch('disabled', !state);
        background.Options[this.id] = state;
        background.saveOptions();
    });

    for(let i in background.Options) {
        $('.' + i).bootstrapSwitch('disabled', !background.Options[i]);
        $('#' + i).bootstrapSwitch('state', background.Options[i]);
    }

    $('.bh-version').text('V' + background.Info.version);
    $('.bh-updatelog').load('updatelog.html');

    if(window.localStorage.getItem('bh_token') !== null) {
        $.ajaxSetup({headers: {Authorization: `Bearer ${window.localStorage.getItem('bh_token')}`}});
        $.post('https://bh.moehero.com/oauth/checkToken').done(r => {
            if(r.code === 0) {
                $('#binding-account').hide();
                $('#is-binding').show();
                $.post('https://bh.moehero.com/oauth/checkTreasure').done(r => {
                    background.Options.idle_treasureOn = r.code === 0;
                    background.saveOptions();
                    $('#live_autoTreasure').bootstrapSwitch('disabled', background.Options.idle_treasureOn);
                });
            } else {
                window.localStorage.removeItem('bh_token');
            }
        });
    }
});
