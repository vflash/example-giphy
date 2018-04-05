import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, getDOM, view, cmps, bem, jr, t} = _cmps;
import {MASK} from 'src/tools/stringMask.js';
import expand from 'src/tools/expand.js';

import '../FmSuggestOptions/FmSuggestOptions.js';

import './FmInput.sass';
var b = bem('FmInput');

var UID_NUMBER = 1;
var isArray = Array.isArray;

function getMask(self) {
    var mask = self.props.mask;
    return (typeof mask === 'string' ? MASK[mask] : mask) || false;
};

function str(value, def) {
    return value != null ? '' + value : (def != null ? '' + def : '');
};


cmps('FmInput_DataList', true, function() {
    var props = this.props;
    var list = props.list;

    if (!Array.isArray(list)) {
        var data = list;
        var list = [];
        for (let i in data) {
            list.push(data[i]);
        };
    };

    return [
        {
            class: b('+datalist.datalist'),
            id: props.id,
        }
        , jr.map(props.list, function(value, index) {
            return [{tag: 'option', key: index}
                , '' + value
            ];
        })
    ];
});


cmps('FmInput', {
    exComponentUpdate: function(props, state) {
        var error = props.error || false;

        return [
            error.isContextObject ? !!error.error : !!error,
            !!this.getContext('readonly'),
            props.rightButton,
            props.dataList,
            this._isFocus,
            state,
        ];
    },

    defaultProps: {
        onChangeBefore: null, // только для коррекции ввода
        onMouseDown: null,
        onKeyDown: null, // только для индикации события
        onChange: null,
        onFocus: null,
        onBlur: null,


        placeholderAsText: false, // выглядит как текст
        placeholder: null, // string
        autoFocus: false,
        disabled: false,
        dataList: null, // ['value', 'value', ...] // сам обьект является ключем кеширования render
        readonly: false,
        label: 'Empty label',
        error: false,
        rightButton: null,
        rightType: null, // null|limit|count  (null это текст из props.right)
        right: null,  // правый placeholder
        type: 'input', // textarea
        icon: null, // тип(search|..) или css-класс иконки
        value: '',
        mask: null,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._isFocus = false;
        this._value = null;
        this._uid = '' + (++UID_NUMBER);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var rightButton = props.rightButton;
        var dataList = props.dataList;
        var right = props.right != null ? ('' + props.right) || null : null;
        var error = props.error || false;
        var limit = props.limit;
        var type = props.type;
        var mask = getMask(this);

        var placeholder = str(props.placeholder, (mask || false).placeholder);
        var label = str(props.label);

        var iconSize = props.iconSize || '';
        var icon = props.icon || null;

        switch(icon) {
            case 'search':
                icon = {img: icon};
                break;
            default:
                if (typeof icon === 'string' && icon[0] === '-') {
                    icon = {img: icon.substr(1)};
                };
        };

        var isError = error.isContextObject ? !!error.error : !!error;
        var isFocus = this._isFocus;
        var value = this._value;
        if (value == null) {
            value = props.value != null ? '' + props.value : '';
            if (mask) {
                if (mask.input) {
                    value = mask.input(value);
                };

                value = (!mask.use
                    ? mask.apply(value, false)
                    : mask.use(value)
                );
            };
        };

        var count = value.length;
        var limit = props.limit;
        if (mask) {
            if (+mask.limit > 0) {
                limit = mask.limit;
            };
            if (mask.count) {
                count = mask.count(value);
            };

            if (!isError && (this._value != null || !!value) && mask.error) {
                let errorText = mask.error(value, !isFocus);
                if (errorText) {
                    isError = true;

                    if (error.isContextObject && !error.error) {
                        error.error = errorText;
                        view.update();
                    };
                };
            };
        };

        switch(props.rightType) {
            case 'limit':
                right = +(limit > 0
                    ? '' + (Math.max(0, limit - count) || '')
                    : ''
                );
                break;
            case 'count':
                right = '' + (+count || '');
                break;
        };

        var isRightPad = !!right;
        var isModeON = isFocus || !!value || value === 0 || !!props.modeActive;
        var mixMode = {
            modeOFF: !isModeON,
            modeON: isModeON
        };

        var mixFLAGS = (''
            + ' -rightButton' + (!!rightButton ? '' : '-no')
            + ' -disabled' + (props.disabled ? '' : '-no')
            + ' -rightPad' + (isRightPad ? '' : '-no')
            + ' -error' + (isError ? '' : '-no')
            + ' -focus' + (isFocus ? '' : '-no')
            + ' -label' + (label ? '' : '-no')
            + ' -icon' + (icon ? (iconSize ? '-' + iconSize : '') : '-no')


        );

        this._renderValue = '' + value;

        var isDataListNative = false && !!dataList; // modelDevice.isMobileAgent;
        var cmpDataList = (dataList
            ? (!isDataListNative
                ? ({
                    onSelect: this._onSelectSuggest,
                    class: cmps.FmSuggestOptions,
                    reFocus: (x => this.refs.input.focus()),
                    getNear: (x => this.refs.input),
                    list: dataList,
                    ref: 'suggest',
                })
                : ({
                    class: cmps.FmInput_DataList,
                    list: dataList,
                    id: 'datalist-' + self._uid,
                })
            )
            : null
        );

        return [b('', props.mix, mixFLAGS, mixMode, isError ? 'x-inp-error' : '')
            , (cmpDataList)

            , [b('border', mixFLAGS)]
            , icon ? [b('icon', icon)] : null
            , (placeholder || true
                ? [b('placeholder'
                    , {hide: label ? !!value || !isModeON : !!value}
                    , {pale: props.placeholderAsText ? 'no' : true}
                    , (props.mixPadRight)
                    , (mixFLAGS)
                )
                    , ('' + placeholder)
                ]
                : null
            )
            , (right
                ? [b('rightText', mixFLAGS, {hide: !isModeON})
                    , ('' + right)
                ]
                : null
            )
            , (label
                ? [b('label', mixFLAGS, mixMode)
                    , (label + ' ')
                    , (props.labelButton
                        ? [{class: b('+a.labelButton'), onClick: this._onClickLabelButton}
                            , ('' + props.labelButton)
                        ]
                        : null
                    )
                ]
                : null
            )
            , ({
                class: b('input', mixFLAGS, mixMode, props.mixPadRight, {
                    disabled: !!props.disabled,
                    hasValue: !!value,
                    isError: isError,
                }),
                maxLength: props.maxLength,
                tag: type == 'textarea' ? type : 'input', // 'textarea'
                ref: 'input',
                key: 'in',
                'data-label': props.label,

                autoComplete: props.autocomplete ? 'on' : 'off',
                autoFocus: props.autoFocus,
                tabIndex: 1,
                disabled: !!props.disabled,
                list: isDataListNative ? 'datalist-' + self._uid : null,
                name: props.name,
                type: /^(text|password|tel)$/.test(type) ? type : 'text',


                onMouseDown: this._onMouseDown,
                onKeyPress: this._onKeyPress,
                onKeyDown: this._onKeyDown,
                onChange: this._onChange,
                onFocus: this._onFocus,
                onBlur: this._onBlur,
                onCopy: this._onCopy,

                title: props.title,
                value: value,
            })
            , (rightButton
                ? [b('rightButtonWrap')
                    , (rightButton)
                ]
                : null
            )
            , jr.children(this)
        ];
    },

    //componentDidUpdate: function() {},

    componentWillUnmount : function() {
        clearTimeout(this._timmerSelection);
        clearTimeout(this._timmerBlur);
    },

    _onMouseDown: function() {
        var fn = this.props.onMouseDown;
        if (fn) {
            fn({
                preventDefault: () => e.preventDefault(),
                target: this,
            });
        };
    },

    _onKeyPress: function(e) {
        var fn = this.props.onKeyPress;
        if (fn) {
            fn({
                preventDefault: () => e.preventDefault(),
                target: this,
                key: e.key
            });
        };
    },

    _onKeyDown: function(e) {
        this._lastKeyDown = {
            time: +new Date(),
            key: e.key,
        };

        var fn = this.props.onKeyDown;
        if (fn) {
            fn({
                preventDefault: () => e.preventDefault(),
                target: this,
                key: e.key
            });
        };
    },

    _onKeyDown: function(e) {
        this._lastKeyDown = {
            time: +new Date(),
            key: e.key,
        };

        var isBreak;
        var fn = this.props.onKeyDown;
        if (fn) {
            fn({
                preventDefault: () => {e.preventDefault();isBreak = true},
                target: this,
                key: e.key
            });
        };

        if (isBreak) {
            return;
        };

        var cmpSuggest = this.refs.suggest;
        if (cmpSuggest) {
            if (e.key === 'Escape') {
                if (cmpSuggest.hide()) {
                    e.preventDefault();
                };
                return;
            };

            if (e.key === 'Enter') {
                if (cmpSuggest.enter()) {
                    e.preventDefault();
                };
                return;
            };

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                cmpSuggest.down(this._renderValue);
                return;
            };

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                cmpSuggest.up()
                return;
            };
        };
    },

    _onSelectSuggest: function(e) {
        var value = e.value;
        var l = value.length;
        this.setValue(value, [l, l]);
    },

    _onChange: function(e) {
        var isReadonly = !!(this.props.readonly || this.getContext('readonly'));
        if (isReadonly) {
            return;
        };

        var n = e.target;

        var selectionStart = n.selectionStart;
        var selectionEnd = n.selectionEnd;
        var error = this.props.error || false;
        var value = n.value;
        var self = this;

        function setSelection(a, b) {
            function set() {
                n.selectionStart = a;
                n.selectionEnd = b == null ? a : b;
            };

            clearTimeout(self._timmerSelection);
            self._timmerSelection = setTimeout(set, 0); // fix for mobile
            set();
        };

        var fn = this.props.onChangeBefore;
        if (fn) {
            let selection = [n.selectionStart, n.selectionEnd];
            let isCancel = false;
            let e;

            fn(e = {
                selection: selection,
                cancel: function() {isCancel = true},
                target: this,
                value: value,
            });

            if (e.value !== value) {
                value = (n.value = '' + e.value);
            };

            if (e.selection !== selection) {
                setSelection(selectionStart, selectionEnd);
                selectionStart = n.selectionStart;
                selectionEnd = n.selectionEnd;
            };

            if (isCancel) {
                return;
            };
        };

        var mask = getMask(this);
        if (mask) {
            let lastValue = this._renderValue;
            let isAdd = lastValue.length <= value.length;
            let vA = mask.apply(value.substring(0, selectionStart), isAdd || isKey('Delete'), value);
            let vB = mask.apply(value.substring(0, selectionEnd), isAdd || isKey('Delete'), value);

            value = n.value = mask.apply(value, isAdd);

            if (isKey('Delete') && (value === lastValue) && (selectionStart === vA.length)) {
                // xak
                setSelection(selectionStart + 1);
            } else {
                setSelection(vA.length, Math.max(vA.length, vB.length));
            };
        };

        function isKey(key) {
            var last = self._lastKeyDown || false;

            return (last.key === key
                ? +new Date() - last.time < 100
                : false
            );
        };


        var value = n.value;
        var fn = this.props.onChange;

        if (fn) {
            let selection = [n.selectionStart, n.selectionEnd];
            let isCancel = false;
            let e;

            fn(e = {
                selection,
                cancel: function() {isCancel = true},
                target: this,
                value: value,
            });

            if (isCancel) {
                return;
            };

            if (e.value !== value) {
                value = (n.value = '' + e.value);
            };

            if (e.selection !== selection) {
                setSelection(e.selection[0], e.selection[1]);
                //n.selectionStart = e.selection[0];
                //n.selectionEnd = e.selection[1];
            };
        };

        var cmpSuggest = this.refs.suggest;
        if (cmpSuggest) {
            cmpSuggest.search(value);
        };

        this.getContext('changeEvent');

        if (error.isContextObject && !!error.error) {
            if (this._renderValue !== value) {
                error.error = false;
                this.update({_value: value});
                view.update();
            };
            return;
        };

        this.update({_value: value});
    },

    _onBlur: function() {
        var fn = this.props.onBlur;
        if (fn) {
            fn({target: this});
        };


        this._timmerBlur = setTimeout(() => {
            this.update({_isFocus: false});

            var cmpSuggest = this.refs.suggest;
            if (cmpSuggest) {
                cmpSuggest.hide();
            };

        }, 10);
    },

    _onFocus: function() {
        var fn = this.props.onFocus;
        if (fn) {
            fn({target: this});
        };

        clearTimeout(this._timmerBlur);
        this.update({_isFocus: true});
    },

    _onCopy: function(e) {
        var mask = MASK[this.props.mask];
        var n = e.target;

        if (!mask || !mask.copy) {
            return;
        };
        var selectionStart = n.selectionStart;
        var selectionEnd = n.selectionEnd;
        var value = n.value.substring(n.selectionStart, n.selectionEnd);

        e.clipboardData.setData('text/plain', mask.copy(value));
        e.preventDefault();
    },

    setSelection: function (a, b) {
        var n = this.refs.input;

        function set() {
            n.selectionStart = a;
            n.selectionEnd = b == null ? a : b;
        };

        clearTimeout(self._timmerSelection);
        self._timmerSelection = setTimeout(set, 0); // fix for mobile
        set();
    },

    getDomInput: function() {
        return this.refs['input'];
    },

    setValue: function(value, selection) { // иметация ввода
        var n = getDOM(this.refs.input);
        var {selectionStart, selectionEnd} = n;

        if (selection) {
            [selectionStart, selectionEnd] = selection;
        };

        n.value = value;
        n.selectionStart = selectionStart;
        n.selectionEnd = selectionEnd;

        this._onChange({target: n});
    },

    reset: function() {
        this.update({_value: null});
    },

    focus: function() {
        this.refs['input'].focus();
    },


    get: function() {
        var propsValue = this.props.value;
        var value = this._value;
        var mask = MASK[this.props.mask];

        return '' + (value == null
            ? (propsValue == null ? '' : '' + propsValue)
            : (mask && mask.output
                ? mask.output(value)
                : value
            )
        );
    },

});
