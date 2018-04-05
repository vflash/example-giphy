import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;

import './FmButtonClose.sass';
var b = bem('FmButtonClose');


cmps('FmButtonClose', {
    defaultProps: {
        disabled: false,
        onClick: null,
        size: 'medium', // small|medium
        wait: false,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);

        this._isActive = false; // только для отображения
        this._isFocus = false; // только для отображения
    },

    render: function() {
        var props = this.props;
        var self = this;

        var isDisabled = !!props.disabled;
        var mixSize = {size: props.size};

        return [
            {
                class: b('+button', props.mix
                    , '-disabled' + (isDisabled ? '' : '-no')
                    , '-active' + (this._isActive ? '' : '-no')
                    , '-focus' + (this._isFocus ? '' : '-no')
                    , '-wait' + (props.wait ? '' : '-no')
                    , (mixSize)
                ),
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
            }
            , [b('icon'
                , '-wait' + (props.wait ? '' : '-no')
                , (mixSize)
            )]
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
