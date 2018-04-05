import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, bem, jr, t} = _cmps;

import './FmButtonLabel.sass';
var b = bem('FmButtonLabel');


cmps('FmButtonLabel', {
    exComponentUpdate: function() {
        return [];
    },

    defaultProps: {
        autoFocus: false,
        disabled: false,
        onClick: null,
        target: null,
        value: '',
        skin: 'default', // light|default|red
        size: 'medium', // small|medium|large
        type: 'button',
        icon: null, // null || string
        href: null,
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

        var skin = props.skin;
        if (skin !== 'light' && skin !== 'red') {
            skin = 'default';
        };

        var isDisabled = !!props.disabled;
        var type = props.type || 'button';
        var tag;

        switch(type) {
            case 'link':
                tag = 'a';
                break;
            default:
                tag = 'button';
        };

        var mixDAFWSS = (''
            + ' -disabled' + (isDisabled ? '' : '-no')
            + ' -active' + (this._isActive ? '' : '-no')
            + ' -focus' + (this._isFocus ? '' : '-no')
            + ' -wait' + (props.wait ? '' : '-no')
            + ' -size-' + props.size
            + ' -skin-' + skin
        );

        var modeDS = ('DS'
            + (props.disabled ? '-1' : '-0')
            + (props.skin === 'light' ? '-L' : (props.skin === 'red' ? '-R' : '-D'))
        );

        return [
            {
                class: b('', props.mix, {mode: modeDS}, mixDAFWSS),
                tag: tag,
                autoFocus: props.autoFocus,
                disabled: isDisabled,
                target: type === 'link' ? props.target : null,
                type: type === 'link' ? null : type === 'submit' ? 'submit' : 'button',
                href: type === 'link' && !isDisabled ? props.href : null,

                onMouseLeave: this._onMouseLeave,
                onMouseDown: this._onMouseDown,
                onMouseUp: this._onMouseUp,
                onClick: !isDisabled ? this._onClick : null,
                onFocus: this._onFocus,
                onBlur: this._onBlur,

                tabIndex: 1,
                ref: 'button',
            }
            , [b('wrap')
                , (props.icon
                    ? [b('icon', props.mixIcon, {i: props.icon, size: props.size})]
                    : null
                )
                , (props.value || props.value === 0
                    ? ('' + props.value)
                    : null
                )
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

    oops: function() {
    },

    focus: function(x) {
        this.refs['button'].focus();
    },
});
