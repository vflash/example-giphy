import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, view, bem, jr, t} = _cmps;

import '../FmRangeNative/FmRangeNative.js';

import './TestFmRangeNative.sass';
var b = bem('TestFmRangeNative');


cmps('TestFmRangeNative', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        return [b('', props.mix)
            , ({
                class: cmps.FmRangeNative,
                value: 30,
                mix: b('input'),
            })
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

});
