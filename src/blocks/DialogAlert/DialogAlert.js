import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;

import '../FmButtonLabel/FmButtonLabel.js';
import '../Popup/Popup.js';

import './DialogAlert.sass';
var b = bem('DialogAlert');


cmps('DialogAlert', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        header: null,
        html: '',
        text: '',
        end: null,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        return [
            {
                onClose: this.close,
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
                    autoFocus: true,
                    onClick: this._onSubmit,
                    value: t("Закрыть"),
                    size: 'small',
                    wait: this._wait,
                    mix: b('submit'),
                    ref: 'submit',
                })
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function () {},
    */

    componentWillUnmount: function() {
        var end = this.props.end;
        if (end) {
            end(null, function(){});
        };
    },

    _onSubmit: function(e) {
        if (this._wait) {
            return;
        };

        var end = this.props.end;
        var x;

        if (!end) {
            this.close();
            return;
        };

        end(true, (status) => {
            this.update({_wait: false});
            x = true;

            if (status !== false) {
                this.close();
            };
        });

        if (!x) {
            this.update({_wait: true});
        };
    },

    close: function() {
        var fn = this.props._close;
        if (fn) {
            fn();
        };
    },
});
