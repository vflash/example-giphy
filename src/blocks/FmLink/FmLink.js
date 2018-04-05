import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, bem, jr, t} = _cmps;
import urlTransform from 'src/tools/urlTransform.js';

import './FmLink.sass';
var b = bem('FmLink');


cmps('FmLink', {
    /*
    exComponentUpdate: function() {
        return [];
    },
    */

    defaultProps: {
        onClick: null,
        size: 'medium', // medium|small|inherit
        target: null,
        wait: false,
        href: null,
        text: null,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var mixWait = props.wait ? '-wait' : '';
        var mixIcon = (props.icon
            ? '-icon -icon-' + props.icon
            : ''
        );

        var href = props.href;
        if (Array.isArray(href)) {
            href = urlTransform(href[0], href[1]);
        };

        return [
            {
                class: b('+a', props.mix, {size: props.size}, mixWait, mixIcon),
                onClick: this._onClick,
                target: props.target,
                tabIndex: 1,
                href,
            }
            , (props.icon
                ? [b('icon', '-i-' + props.icon)]
                : null
            )
            , (props.text != null ? '' + props.text : null)
            , jr.children(this)
        ];
    },

    _onClick: function(e) {
        if (this.props.href == null) {
            e.preventDefault();
        };

        var fn = this.props.onClick;
        if (fn) {
            fn({
                cancel: function() {
                    e.preventDefault()
                },
                target: this,
                event: e,
            });
        };
    },
});


/*
нужно закончить состояние Focus
*/
