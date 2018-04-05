import {exComponentUpdate, React, cmps, view, bem, jr, t} from '../cmps.js';

import './ExampleComponent.sass';
var b = bem('ExampleComponent');


cmps('ExampleComponent', {
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
            , jr.children(this)
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

});
