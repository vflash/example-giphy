import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, bem, jr, t} = _cmps;

import './FmSelectNative.sass';
var b = bem('FmSelectNative');

cmps('FmSelectNative', {
    exComponentUpdate: function(props, state) {
        var error = props.error || false;

        return [
            error.isContextObject ? !!error.error : !!error,
            !!this.getContext('readonly'),
            props.options,
            state
        ];
    },

    defaultProps: {
        onlyOption: false, // метод get возврашает значения только из списка option
        onChange: null, // function

        placeholder: '',
        autoFocus: false,
        valueNull: null, // значение которое означает не "выбран"
        textNull: '', // текст в списке для постого выбора
        disabled: false,
        options: [],
        error: false,
        label: '',
        title: '',
        value: '', // only string
        name: null, // string
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._timmerBlur = null;
        this._isFocus = false;

        this._initValues = function() {
            this._value = null;
        };

        this._initValues();
    },

    render: function() {
        var props = this.props;
        var self = this;

        var placeholder = props.placeholder;
        var error = props.error || false;
        var value = this._value;
        if (value == null) {
            value = props.value != null ? props.value : '';
        };
        var text = null;

        var optionsElems = jr.map(props.options || [], function(x, index) {
            if (x[0] == value) {
                text = x[1];
            };

            return [
                {
                    value: '' + x[0],
                    tag: 'option',
                    key: index,
                }
                , ('' + x[1])
            ];
        });

        var isNullText = value === props.valueNull || text == null;
        var isError = error.isContextObject ? !!error.error : !!error;
        var isModeON = !isNullText;

        var mixDFEMN = (''
            + ' -disabled' + (props.disabled ? '' : '-no')
            + ' -focus' + (this._isFocus ? '' : '-no')
            + ' -error' + (isError ? '' : '-no')
            + ' -mode' +  (isModeON ? '-on' : '-off')
            + ' -null' + (isNullText ? '' : '-no')
        );

        return [b('', props.mix, mixDFEMN, isError ? 'x-inp-error' : '')
            , [b('label', mixDFEMN)
                , ('' + props.label)
            ]
            , [b('text', mixDFEMN)
                , (isNullText ? placeholder || '' : text)
            ]
            , [b('pic', mixDFEMN)]
            , [
                {
                    class: b('+select.input', mixDFEMN),
                    autoFocus: !!props.autoFocus,
                    onChange: this._onChange,
                    onKeyUp: this._onKeyUp,
                    onFocus: this._onFocus,
                    onBlur: this._onBlur,
                    title: props.title,
                    name: props.name,
                    value: value,
                    tabIndex: 1,
                    ref: 'select',
                    'data-label': props.label,
                }
                , (text == null
                    ? [
                        {
                            class: '+option.-null',
                            value: value,
                            key: 'nullkey'
                        }
                        , props.textNull || ''
                    ]
                    : null
                )
                , (optionsElems)
            ]
        ];
    },

    componentWillUnmount : function() {
        clearTimeout(this._timmerBlur);
    },

    _onChange: function(e) {
        var isReadonly = !!(this.props.readonly || this.getContext('readonly'));
        if (isReadonly) {
            return;
        };

        var error = this.props.error || false;
        var fn = this.props.onChange;
        var n = e.target;

        if (fn) {
            var isCancel = false;

            fn({
                cancel: function() {isCancel = true},
                target: this,
                value: n.value,
            });

            if (isCancel) {
                return;
            };
        };

        this.getContext('changeEvent');

        if (error.isContextObject && !!error.error) {
            this._value = n.value;
            error.error = false;

            view.update();
            return;
        };

        this.update({
            _value: n.value,
        });
    },

    _onKeyUp: function(e) {
        var select = this.refs['select'];
        var value = select.value;

        var _value = this._value;
        if (_value == null) {
            _value = this.props.value || '';
        };

        if (this.props.onChange && _value != value) {
            this.props.onChange({target: this, value: _value});
        };
    },

    _onBlur: function() {
        this._timmerBlur = setTimeout(() => {
            this.update({_isFocus: false});
        }, 10);
    },

    _onFocus: function() {
        clearTimeout(this._timmerBlur);
        this.update({_isFocus: true});
    },

    reset: function() {
        this._initValues();
        this.update();
    },

    focus: function() {
        this.refs['select'].focus();
    },

    set: function(value) {
        var option = find(this.props.options, value);
        if (option) {
            this._onChange({target: {value: '' + option[0]}});
        };
    },

    get: function() { // strict - только из options
        var value = this._value;
        var props = this.props;

        value = value == null ? props.value : value;

        if (props.onlyOption) {
            return find(props.options, value) ? value : null;
        };

        return value;
    },

});

function find(options, value) {
    var options = options || [];
    var i = options.length;

    while(i--) {
        var x = options[i];
        if (!x) {
            continue;
        };

        if (x[0] == value) { // value в select всегда строки
            return x;
        };
    };
};
