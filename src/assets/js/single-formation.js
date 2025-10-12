(function ($) {
    $(document).ready(function () {
        $('.printBtn').on("click", function () {
            $('.tab-pane').show();
            printJS({
                printable: 'printJS-details',
                type: 'html',
                targetStyles: ['*'],
                ignoreElements: ['no-print-1', 'no-print-2', 'no-print-3'],
                maxWidth: '100%',
                style: '.tab-content>.tab-pane { visibility: visible!important; display:block!important; opacity:1!important }',
            })
            setTimeout(function () {
                $('.tab-pane').hide();
                $('.tab-pane.active').show();
            }, 500);
        });
    });
})(jQuery);