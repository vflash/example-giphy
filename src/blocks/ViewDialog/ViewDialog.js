import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;
import autoStopMouseWheel from 'src/tools/autoStopMouseWheel.js';
import modelDialogs from 'src/models/modelDialogs.js';
import modelDevice from 'src/models/modelDevice.js';

import '../DialogConfirm/DialogConfirm.js';
import '../DialogAlert/DialogAlert.js';

import './ViewDialog.sass';
var b = bem('ViewDialog');


cmps('ViewDialog', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        type: 'common',
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var isActive = (props.type === 'common'
            ? !modelDialogs.isShowError
            : true
        );

        var dialog = modelDialogs.get(props.type).current || null;
        var cmp = null;

        if (!dialog || !dialog.class) {
            dialog = null;
        };

        switch(dialog && dialog.class) {
            case 'Confirm':
                dialog.class = cmps.DialogConfirm;
                break;
            case 'Alert':
                dialog.class = cmps.DialogAlert;
                break;
        };

        var mixWebKit = this._isWebKit ? '-webkit' : '';
        var mixActive = '-active-' + (isActive && dialog ? '' : 'no');
        var mixOpen = dialog ? '-open' : '-close';
        if (dialog) {
            dialog.ref = 'dialog';
        };

        return [
            {
                onMouseDown: this._onClickClose,
                class: b('', props.mix
                    , ('-zindex-' + props.zIndex)
                    , (mixOpen)
                ),
                ref: 'root',
            }
            , [b('bg', mixOpen, 'x-close')]
            , (dialog
                ? [
                    {
                        onWheel: this._onWheel,
                        class: b('viewport', mixWebKit, mixOpen, 'x-close'),
                    }
                    , [b('wrap', mixWebKit, mixOpen, 'x-close', modelDevice.mix)
                        , [
                            {
                                class: b('box', mixActive, mixOpen, 'x-close', modelDevice.mix),
                                key: dialog.key || ('--uid' + dialog._uid),
                            }
                            , (dialog)
                        ]
                    ]
                ]
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

    componentDidMount: function() {
        try {
            var isWebKit = getComputedStyle(this.refs['root'], '::-webkit-scrollbar').display === 'none';
        } catch(e) {
            var isWebKit = false;
        };

        this.update({_isWebKit: isWebKit});
    },



    _onClickClose: function(e) {
        var n = e.target;
        if (n && n.classList.contains('x-close')) {

        };
    },


    _onClickClose: function(e) {
        var n = e.target;
        if (!n || !n.classList.contains('x-close')) {
            return;
        };

        e.preventDefault();
        if (e.button) {
            return;
        };

        var dialog = modelDialogs.get(this.props.type).current || null;
        if (!dialog) {
            return;
        };

        var isAutoClose = dialog.noAutoClose !== true;
        var cmp = this.refs['dialog'];
        if (cmp && cmp.checkAutoClose) {
            isAutoClose = !!cmp.checkAutoClose();
        };

        if (isAutoClose) {
            this._close();
        };
    },

    _onWheel: function(e) {
        autoStopMouseWheel(e, e.currentTarget, false, true);
    },

    _close: function() {
        modelDialogs.close(this.props.type);
    },

});
