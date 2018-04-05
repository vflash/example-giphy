import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, view, bem, jr, t} = _cmps;

import './FmRangeNative.sass';
var b = bem('FmRangeNative');


function getValue(self, plus) {
    var value = self._value;
    var props = self.props;
    var min = +props.min || 0;
    var max = +props.max || 0;

    if (value == null) {
        value = +props.value;
    };

    if (plus != null) {
        value += plus;
    };

    return Math.max(min, Math.min(max, value));
};

cmps('FmRangeNative', {
    exComponentUpdate: function(props, state) {
        return [state];
    },

    defaultProps: {
        onChange: null,
        onReset: null,
        buttons: false,
        value: '0',
        step: 1,
        max: 100,
        min: 0,
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

        var isShowButtons = !!props.buttons;
        var value = getValue(this);
        var min = +props.min || 0;
        var max = +props.max || 0;

        var mixFLAGS = [
            , '-showButtons' + (isShowButtons ? '' : '-no')
            , '-active' + (this._isActive ? '' : '-no')
            , '-focus' + (this._isFocus ? '' : '-no')
        ];

        return [{class: b('', props.mix, mixFLAGS)}
            , (isShowButtons
                ? ({
                    onClick: this._onClickMinus,
                    class: cmps.FmRangeNative_Button,
                    icon: 'minus',
                })
                : null
            )

            , [b('box')
                , [b('line', mixFLAGS)
                    , ({
                        class: b('value', mixFLAGS),
                        style: {
                            width: (100 * (value - min || 0) / (max - min)) + '%',
                        }
                    })
                ]
                , ({
                    onChange: this._onChange,
                    onMouseLeave: this._onMouseLeave,
                    onMouseDown: this._onMouseDown,
                    onMouseUp: this._onMouseUp,
                    onFocus: this._onFocus,
                    onBlur: this._onBlur,
                    class: b('+input.input'),
                    value: value,
                    type: 'range',
                    step: props.step,
                    max: props.max,
                    min: props.min,
                    ref: 'input',
                    tabIndex: 1,
                })
            ]

            , (isShowButtons
                ? ({
                    onClick: this._onClickPlus,
                    class: cmps.FmRangeNative_Button,
                    icon: 'plus',
                })
                : null
            )
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    componentWillUnmount : function() {
        clearTimeout(this._timmerBlur);
    },

    _onClickMinus: function() {
        this._change(getValue(this, -this.props.step || 1));
    },

    _onClickPlus: function() {
        this._change(getValue(this, +this.props.step || 1));
    },

    _onChange: function() {
        var value = +this.refs.input.value || 0;
        this._change(value);
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

    _change: function(value) {
        var error = this.props.error || false;
        var props = this.props;

        var fn = this.props.onChange;
        if (fn) {
            let isCancel = false;
            let e;

            fn(e = {
                cancel: function() {isCancel = true},
                target: this,
                value: value,
            });

            if (isCancel) {
                return;
            };

            if (+e.value !== value) {
                let min = +props.min || 0;
                let max = +props.max || 0;
                value = Math.max(props.min, Math.min(props.max, +e.value));
                value = min + Math.round((value - min) / step) * step;
            };
        };

        if (getValue(this) === value) {
            return;
        };

        if (error.isContextObject && !!error.error) {
            error.error = false;
            this._value = value;
            this.update();
            view.update();
            return;
        };

        this.update({_value: value});
    },

    focus: function(x) {
        this.refs['button'].focus();
    },

    reset: function() {
        var fn = this.props.onReset;
        if (fn) {
            if (this._value != null) {
                fn({target: this});
            };
        };

        this.update({_value: null});
    },

    get: function() {
        return getValue(this);
    },
});



cmps('FmRangeNative_Button', {
    exComponentUpdate: function(props, state) {
        return [state];
    },

    defaultProps: {
        disabled: false,
        onClick: null,
        icon: 'plus',
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._isActive = false; // только для отображения
        this._isFocus = false; // только для отображения
    },

    render: function() {
        var props = this.props;
        var self = this;

        var mixFLAGS = [
            , '-active' + (this._isActive ? '' : '-no')
            , '-focus' + (this._isFocus ? '' : '-no')
            , '-icon-' + props.icon
        ];

        return [
            {
                class: b('+button.button', mixFLAGS, props.mix),
                onMouseLeave: this._onMouseLeave,
                onMouseDown: this._onMouseDown,
                onMouseUp: this._onMouseUp,
                onClick: props.disabled ? null : this._onClick,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
                tabIndex: 1,
            }
            , [b('buttonIcon', mixFLAGS)]
        ];

    },

    componentWillUnmount : function() {
        clearTimeout(this._timmerBlur);
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

    _onClick: function(e) {
        var fn = this.props.onClick;
        if (fn) {
            fn({target: this});
        };
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

});

