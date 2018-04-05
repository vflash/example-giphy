import * as _cmps from '../cmps.js'; const {exComponentUpdate, view, cmps, bem, jr, t} = _cmps;
import modelDevice from 'src/models/modelDevice.js';
import getContent from 'src/tools/getContentLayout.js';

import '../Page404/Page404.js';
import '../Page503/Page503.js';

import './LayoutPopup.sass';
var b = bem('LayoutPopup');


cmps('LayoutPopup', {
    exComponentUpdate: function() {
        return [
        ];
    },

    defaultProps: {
        layoutTheme: null,
        isActive: false,
        mix: '',
    },

    context: {
        close() {
            return this._close
        },
    },

    init: function () {
        // exComponentUpdate(this, false);
    },

    render: function () {
        var props = this.props
        var page = props.page;

        var isActive = props.isActive;
        var self = this;

        var content = getContent(page);
        var theme = props.layoutTheme || content.layoutTheme || 'default';

        if (page && !content.class) {
            switch(page.status) {
                case 404:
                    content.class = cmps.Page404;
                    theme = 'error';
                    break;

                case 503:
                default:
                    content.class = cmps.Page503;
                    theme = 'error';
            };
        };

        var mixNoActive = {noActive: !isActive};
        var mixTheme = '-theme-' + theme;

        return [
            {
                class: b('', props.mix, mixTheme, mixNoActive, modelDevice.mix),
                onClick: this._onOutsideClick,
            }
            , [b('page', mixTheme, modelDevice.mix)
                , (content)
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _onOutsideClick: function(e) {
        if (e.button) return;
        if (e.target !== e.currentTarget) {
            return;
        };

        e.preventDefault();
        this._close();
    },

    _close: function() {
        var coNode = this.refs['content'];
        if (coNode && coNode.getPermissionClose) {
            if (!coNode.getPermissionClose()) {
                return;
            };
        };

        view.closePopup();
    },

});
