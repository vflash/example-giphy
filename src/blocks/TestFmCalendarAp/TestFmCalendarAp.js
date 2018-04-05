import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, view, bem, jr, t} = _cmps;

import '../FmCalendarAp/FmCalendarAp.js'

import './TestFmCalendarAp.sass';
var b = bem('TestFmCalendarAp');


cmps('TestFmCalendarAp', {
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
                onChange: (e) => {
                    console.log(e.value);
                },
                class: cmps.FmCalendarAp,
                select: true,
                local: 'DD.MM.YYYY',
                point: null,
                value: '22.04.2018',
                min: '22.04.2010',
                max: '22.04.2020',
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


cmps('TestFmCalendarAp_Days', {
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

        return [b('', props.mix, '-fixed')
            , ({
                class: cmps.FmCalendarAp_Days,
                point: new Date('04/01/2018 00:00:00 GMT'),
                value: new Date('04/15/2018 00:00:00 GMT'),
                min: new Date('04/05/2018 00:00:00 GMT'),
                max: new Date('05/04/2018 00:00:00 GMT'),
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

cmps('TestFmCalendarAp_Years', {
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

        return [b('', props.mix, '-fixed')
            , ({
                class: cmps.FmCalendarAp_Years,
                point: 2020,
                value: 2018,
                min: 2017,
                max: 2026,
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

cmps('TestFmCalendarAp_Months', {
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

        return [b('', props.mix, '-fixed')
            , ({
                class: cmps.FmCalendarAp_Months,
                value: 4,
                min: 2,
                max: 7,
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

