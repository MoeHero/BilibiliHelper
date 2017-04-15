class FuncGiftPackage {
    constructor() {
        this.package = $('.items-package').clone();
        $('.items-package').after(this.package).remove();

        this.packagePanel = this.package.find('.gifts-package-panel');
        this.openButton = this.package.find('a').on('click', () => {
            this.package.find('.has-new').remove();
            this.packagePanel.show();
        });

        this.packagePanel.find('.live-tips').remove();
    }
}