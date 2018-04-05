import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, bem, jr, t} = _cmps;

import './Page503.sass';
var b = bem('Page503');


cmps('Page503', {
    exComponentUpdate: function() {
        return [];
    },

    defaultProps: {
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        return [b('')
            , ['+b', '503']
            , " Service Unavailable"
        ];
    },
});
