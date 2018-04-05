import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;

import '../FmButtonClose/FmButtonClose.js';

import './Popup.sass';
var b = bem('Popup');


cmps('Popup', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        padding: true,
        onClose: null,
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
                class: b('', props.mix, {padding: !!this.props.padding}),
                onScroll: this._onScrollFix,
            }
            , jr.children(this)

            , (props.onClose
                ? ({
                    onClick: this._onClickClose,
                    class: cmps.FmButtonClose,

                    size: 'small',
                    mix: b('close', {padding: !!props.padding}),
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


    _onScrollFix: function(e) {
        e.currentTarget.scrollTop = 0;
    },

    _onClickClose: function () {
        var fn = this.props.onClose;
        if (fn) {
            fn();
        };
    },
});


cmps('Popup_Content', {
    /*
    exComponentUpdate: function(props, state) {
        return [];
    },
    */

    defaultProps: function() {
        return {
            header: null,
            html: null,
            text: '',
        };
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;

        var hasHeader = props.header ? '-has-header' : '';

        return [b('Content', props.mix)
            , (props.header
                ? [b('ContentHeader'), ('' + props.header)]
                : null
            )
            , (props.html
                ? ({
                    class: b('ContentBox', '-html', hasHeader),
                    dangerouslySetInnerHTML: {
                        __html: '' + props.html
                    }
                })
                : [b('ContentBox', '-text', hasHeader)
                    , '' + props.text
                ]
            )
        ];
    },
});
