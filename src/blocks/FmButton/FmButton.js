import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, bem, jr, t} = _cmps;

import './FmButton.sass';
var b = bem('FmButton');


cmps('FmButton', {
    exComponentUpdate: function(props, state) {
        return [state];
    },

    defaultProps: {
        disabled: false,
        onClick: null,
        value: t("Далее"),
        type: 'button',
        wait: false,
        size: 'medium', // small|medium
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

        var isDisabled = !!props.disabled;
        var size = props.size || 'medium';

        var mixFLAGS = [
            , '-disabled' + (isDisabled ? '' : '-no')
            , '-active' + (this._isActive ? '' : '-no')
            , '-focus' + (this._isFocus ? '' : '-no')
            , '-size-' + (size)
            , '-wait' + (props.wait ? '' : '-no')
        ];

        return [
            {
                class: b('+button', mixFLAGS, props.mix),
                disabled: isDisabled,
                type: props.type,
                onMouseLeave: this._onMouseLeave,
                onMouseDown: this._onMouseDown,
                onMouseUp: this._onMouseUp,
                onClick: !isDisabled ? this._onClick : null,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
                tabIndex: 1,
                ref: 'button',
            }
            //, [b('icon')]
            , [b('wrap')
                , ('' + props.value)
            ]
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

