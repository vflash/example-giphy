import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, bem, jr, t} = _cmps;

import './Page404.sass';
var b = bem('Page404');


cmps('Page404', {
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
            , ['+b', '404']
            , " Page not found!"
        ];
    },
});
