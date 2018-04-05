import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, bem, jr, t} = _cmps;

import './FmSwitch.sass';
var b = bem('FmSwitch');


cmps('FmSwitch', {
    exComponentUpdate: function(props, state) {
        return [
            props.text,
            state
        ];
    },

    defaultProps: {
        onChange: null, // function
        readonly: false,
        disabled: false,
        value: false, // true|false
        text: [t("Да"), t("Нет")],
        size: 'medium', //'small'
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._isActive = false; // только для отображения
        this._isFocus = false; // только для отображения
        this._value = null;
    },

    render: function() {
        var props = this.props;
        var self = this;

        var isDisabled = !!props.disabled;
        var value = this._value;
        var text = props.text;
        if (text && (typeof text === 'string')) {
            text = [text, text];
        };

        if (value == null) {
            value = !!this.props.value;
        };

        var mixDAFC = (''
            + ' -disabled' + (isDisabled ? '' : '-no')
            + ' -active' + (this._isActive ? '' : '-no')
            + ' -focus' + (this._isFocus ? '' : '-no')
            + ' -check' + (value ? '' : '-no')
            + ' -wait' + (props.wait ? '' : '-no')
        );

        var mixSize = {
            size: props.size,
        }

        return [b('', props.mix, mixDAFC, mixSize)
            , ({
                class: b('+button.button', mixDAFC, mixSize),
                disabled: isDisabled,
                type: 'button',
                onMouseLeave: this._onMouseLeave,
                onMouseDown: this._onMouseDown,
                onMouseUp: this._onMouseUp,
                onClick: !isDisabled ? this._onClick : null,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
                tabIndex: 1,
                ref: 'button',

            })
            , (text
                ? [
                    {
                        onClick: this._onClick,
                        class: b('text', mixDAFC),
                    }
                    , (value ? text[0] : text[1])
                ]
                : null
            )
        ];
    },

    componentWillUnmount : function() {
        clearTimeout(this._timmerBlur);
    },

    _onClick: function(e) {
        var isReadonly = !!(this.props.readonly || this.getContext('readonly'));
        if (isReadonly || this.props.disabled) {
            return;
        };

        var value = this._value;
        if (value == null) {
            value = !!this.props.value;
        };

        var fn = this.props.onChange;
        if (fn) {
            var isCancel = false;

            fn({
                cancel: function() {isCancel = true},
                target: this,
                value: !value,
            });

            if (isCancel) {
                return;
            };
        };

        this.update({_value: !value});
    },

    _onMouseLeave: function() {
        this.update({_isActive: false});
    },

    _onMouseDown: function(e) {
        this._timeMouseDown = +new Date();
        this.update({
            _isActive: true,
            _isFocus: false,
        });
    },

    _onMouseUp: function() {
        this.update({_isActive: false});
    },

    _onBlur: function() {
        this._timmerBlur = setTimeout(() => {
            this.update({_isFocus: false});
        }, 10);
    },

    _onFocus: function() {
        clearTimeout(this._timmerBlur);

        this.update({
            _isFocus: !((new Date() - this._timeMouseDown) < 500),
        });
    },

    focus: function(x) {
        this.refs['button'].focus();
    },

    reset: function() {
        this.update({_value: null});
    },

    get: function() {
        var value = this._value;
        return value == null ? !!this.props.value : !!value;
    },

});
