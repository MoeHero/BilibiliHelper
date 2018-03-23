class ModuleToast {
    static success(msg, element, fixed = false) {
        this.showToast(msg, 'success', element, fixed);
    }
    static info(msg, element, fixed = false) {
        this.showToast(msg, 'info', element, fixed);
    }
    static warning(msg, element, fixed = false) {
        this.showToast(msg, 'caution', element, fixed);
    }
    static error(msg, element, fixed = false) {
        this.showToast(msg, 'error', element, fixed);
    }

    static showToast(msg, type, element, fixed) {
        let offset = $(element).offset();
        let toast = $('<div>').addClass('link-toast ' + type + (fixed ? ' fixed' : ''))
            .append($('<span>').addClass('toast-text').text(msg))
            .css({'left': offset.left + $(element).width()})
            .css({'top': offset.top + $(element).height()});
        $('body').append(toast);
        Helper.countdown(5, () => {
            toast.addClass('out');
            Helper.countdown(0.4, () => toast.remove());
        });
    }
}
