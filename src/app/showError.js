import view  from 'src/models/view/view.js';
import i18n from 'src/tools/i18n.js';

var t = i18n.get;

view.on('showError', function({context, status, result, ok}) {
    ok();

    if (status === 'errorNetwork') {
        view.alertError(t("Сервис временно недоступен"));
        return;
    };

    if (status === 'error') {
        // if (result.code == 422) {
        //     return;
        // };

        view.alertError(result.message);
        return;
    };
});