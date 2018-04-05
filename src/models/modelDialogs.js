import expansionEvent from 'src/tools/expansionEvent.js';
import expand from 'src/tools/expand.js';
import view from 'src/models/view/view.js';

var UINX = 0;
var model;
var UID = 0;

export default model = {
    common: new Dialog(),
    error: new Dialog(),

    get isShowCommon() {
        return !!model.common.current;
    },

    get isShowError() {
        return !!model.error.current;
    },

    get: function(type) {
        return model[type];
    },

    close: function(type, key) {
        if (type === 'common') {
            if (model.common.close(key)) {
                model.error.close();
            };
            return;
        };

        if (type === 'error') {
            model.error.close(key);
            return;
        };
    },

    open: function(type, option) {
        if (type === 'common') {
            model.error.close();
            model.common.open(option);
            return;
        };

        if (type === 'error') {
            model.error.open(option);
            return;
        };
    },
};


view.on('showDialog', function(e) {
    var options = e.options;
    var type = e.type;

    if (type === 'confirmError') {
        e.ok();
        viewConfirm('error', options.text, options.end);
        return;
    };

    if (type === 'alertError') {
        e.ok();
        viewAlert('error', options.text, options.end);
        return;
    };

    if (type === 'confirm') {
        e.ok();
        viewConfirm('common', options.text, options.end);
        return;
    };

    if (type === 'alert') {
        e.ok();
        viewAlert('common', options.text, options.end);
        return;
    };

    if (type === 'common' || type === 'error') {
        model.open(type, options);
        return;
    };

});

view.on('closeDialog', function(e) {
    var type = e.type;

    if (type === 'common' || type === 'error') {
        e.ok();
        model.close(type);
        return;
    };
});

function Dialog() {
    var _update = function() {
        view.update();
    };

    var model = expand(this, {
        current: null,
        close: close,
        open: open,
    });

    function open(data) {
        if (!data) {
            return;
        };

        var dialog = expand(null, data, {
            _dialogKey: {active: true},
            _close: function() {
                close(dialog._dialogKey);
            },
            _uid: ++UID,
        });

        _setDialog(dialog);

        return dialog._dialogKey;
    };

    function close(dialogKey) {
        if (dialogKey != null && dialogKey !== (model.current||0)._dialogKey) {
            return false;
        };

        if (!model.current) {
            return true;
        };

        _setDialog(null);
        return true;
    };


    function _setDialog(dialog) {
        var old = model.current;
        if (old) {
            old._dialogKey.active = false;
        };

        model.current = dialog;
        _update();
    };
};


function viewConfirm(dialogType, text, end) {
    var p = text && typeof text === 'object' ? text : {text: '' + text};

    model.open(dialogType, {
        class: 'Confirm',
        key: 'vpc' + (++UINX),
        header: p.header,
        html: p.html,
        text: p.text,
        buttonCancelTheme: p.buttonCancelTheme,
        buttonOkTheme: p.buttonOkTheme,
        buttonCancel: p.buttonCancel,
        buttonOk: p.buttonOk,
        end: end || p.end
    });
};

function viewAlert(dialogType, text, end) {
    var p = text && typeof text === 'object' ? text : {text: '' + text};

    model.open(dialogType, {
        class: 'Alert',
        key: 'vpa' + (++UINX),
        header: p.header,
        html: p.html,
        text: p.text,
        end: end
    });
};

