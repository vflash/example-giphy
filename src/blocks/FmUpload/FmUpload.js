import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;
import 'src/tools/xdrag.js';

import './FmUpload.sass';
var b = bem('FmUpload');

cmps('FmUpload', {
    exComponentUpdate: function(props, state) {
        return [
            this.getContext('readonly'),
            state
        ];
    },

    defaultProps: {
        multiple: false,
        onEvent: null,
        upload: null, // загрузчик
        title: null,
        types: ['image'], // ['image', 'application/pdf'],
        drop: false,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);
        this._keyFile = 0;
        this._focus = false;
    },

    render: function() {
        var props = this.props;
        var self = this;

        var isReadonly = !!(this.props.readonly || this.getContext('readonly'));
        var title = props.title;
        if (title == null) {
            title = props.multiple ? t("Выбрать файл(ы)") : t("Выбрать файл");
        };

        if (isReadonly) {
            return [b('', props.mix)];
        };


        return [
            {
                class: b('+label', props.mix, this._focus ? '-focus' : ''),
                onDrop: props.drop ? this._onDrop : null,
            }
            , ({
                class: b('+input.input'),
                type: 'file',
                multiple: !!props.multiple,
                tabIndex: 1,
                onChange: this._onChange,
                onClick: this._onClick,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
                title: title,
                key: 'F' + this._keyFile,
                ref: 'input',
            })
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _onChange: function(e) {
        var createUploadFile = this.props.upload;
        var files = e.target.files;
        var self = this;

        if (!files || !files.length) {
            return;
        };

        this.update({_keyFile: this._keyFile + 1});

        function onEvent(type, data) {
            var onEvent = self.props.onEvent;
            if (onEvent) {
                onEvent({
                    target: self,
                    type: type,
                    data: data,
                });
            };
        };

        var filesWaitHasValid = false;
        var filesWait = +files.length;
        var options = this.props.options || {};
        var types = this.props.types;

        function waitFile(isOk) {
            if (isOk) {
                filesWaitHasValid = true;
            };

            if (--filesWait) {
                return;
            };

            if (!filesWaitHasValid) { // если нету валидных файлов
                onEvent('noFile');
            };
        };

        for (var i = 0; i < files.length; i++) {
            createUploadFile({
                ...options,
                types,
                file: files[i],
                onCompleted,
                onFile,
            });
        };

        function onCompleted(status) {
            waitFile(status === true);
        };

        function onFile(result) {
            onEvent('file', result);
        };
    },

    _onDrop: function(e) {
        this.drop(e);
    },

    _onClick: function() {
        var fn = this.props.onClick;
        if (fn) {
            fn({target: this});
        };
    },

    _onFocus: function() {
        this.update({_focus: true});
        var fn = this.props.onFocus;
        if (fn) {
            fn({target: this});
        };
    },

    _onBlur: function() {
        this.update({_focus: false});
        var fn = this.props.onBlur;
        if (fn) {
            fn({target: this});
        };
    },

    drop: function(e) {
        var data = e.dataTransfer;
        if (data) {
            this._onChange({target: data});
        };
    },

    click: function() {
        this.refs.input.click();
    },

});
