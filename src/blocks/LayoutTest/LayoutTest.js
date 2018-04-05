import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, bem, jr, t} = _cmps;
import getContent from 'src/tools/getContentLayout.js';

import './LayoutTest.sass';
var b = bem('LayoutTest');


cmps('LayoutTest', {
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
        var props = this.props;
        var self = this;

        var content = getContent(props.page);

        return [b('', props.mix)
            , (content)
        ];
    },
});
