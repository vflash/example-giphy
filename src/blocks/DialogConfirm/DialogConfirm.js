import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;

import '../FmButtonLabel/FmButtonLabel.js';
import '../Popup/Popup.js';

import './DialogConfirm.sass';
var b = bem('DialogConfirm');


cmps('DialogConfirm', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        buttonSkinA: 'default',
        buttonTextA: t("ОК"),
        buttonSkinB: 'light',
        buttonTextB: t("Отмена"),
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        return [
            {
                onClose: this._close,
                class: cmps.Popup,
                mix: b('', props.mix),
            }
            , ({
                class: cmps.Popup_Content,
                header: props.header,
                html: props.html,
                text: props.text,
                mix: b('content')
            })
            , [b('foot')
                , ({
                    class: cmps.FmButtonLabel,
                    autoFocus: props.autoFocus === 'A',
                    onClick: this._onClickA,
                    value: props.buttonTextA,
                    skin: props.buttonSkinA,
                    size: 'small',
                    wait: this._wait === 'A',
                    mix: b('submit', {pos: 'a'}),
                    ref: 'submit',
                })
                , ({
                    class: cmps.FmButtonLabel,
                    autoFocus: props.autoFocus === 'B',
                    onClick: this._onClickB,
                    value: props.buttonTextB,
                    skin: props.buttonSkinB,
                    size: 'small',
                    wait: this._wait === 'B',
                    mix: b('submit', {pos: 'b'}),
                })
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    componentDidMount: function () {
        this.refs.submit.focus(true);
    },

    componentWillUnmount: function() {
        if (!this._isFinish && this.props.end) {
            this.props.end(null, function(){});
        };
    },

    _onClickB: function(e) {
        this._end(false)
    },

    _onClickA: function() {
        this._end(true)
    },

    _end: function(statusButton) {
        if (this._wait) return;
        var x;

        if (!this.props.end) {
            this._close();
            return;
        };

        this.props.end(statusButton, (status) => {
            this.update({_wait: false});
            x = true;

            if (status !== false) {
                this._isFinish = true;
                this._close();
                return;
            };

            if (this.refs['submit'] && statusButton) {
                this.refs['submit'].oops();
            };
        });

        if (!x) {
            this.update({_wait: statusButton ? 'A' : 'B'});
        };
    },

    _close: function() {
        this.props._close();
    },

});
