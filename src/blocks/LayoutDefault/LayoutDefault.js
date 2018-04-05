import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, view, bem, jr, t} = _cmps;
import modelDevice from 'src/models/modelDevice.js';
import getContent from 'src/tools/getContentLayout.js';

import '../Page404/Page404.js';
import '../Page503/Page503.js';

import './LayoutDefault.sass';
var b = bem('LayoutDefault');


cmps('LayoutDefault', {
    exComponentUpdate: function() {
        return [
        ];
    },

    defaultProps: {
        mix: '',
    },

    init: function () {
        //exComponentUpdate(this, false);
    },

    render: function () {
        var props = this.props
        var page = props.page;
        var self = this;

        var content = getContent(page, null, false);
        if (!page || (content||false).class) {
            // null|content

        } else if (page.status == 500) {
            content = {
                class: cmps.Page503,
            };
        } else if (page.status == 404) {
            content = {
                class: cmps.Page404,
            };
        };

        return [b('', props.mix, modelDevice.mix)
            , [b('page', modelDevice.mix)
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

});
