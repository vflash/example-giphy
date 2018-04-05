import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, view, bem, jr, t} = _cmps;

import '../TestFmSuggestOptions/TestFmSuggestOptions.js';
import '../TestFmRangeNative/TestFmRangeNative.js';
import '../TestFmCalendarAp/TestFmCalendarAp.js';
import '../TestFmSelectFind/TestFmSelectFind.js';

import './PageTests.sass';
var b = bem('PageTests');



cmps('PageTests', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        groupName: null,
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var groupName = props.groupName;
        var listGroups = [];
        var listTest = [];
        var groups = {};

        for (let name in cmps) {
            var clss = cmps[name];
            if (typeof clss !== 'function') {
                continue;
            };

            if (!/^Test[A-Z]./.test(name)) {
                continue;
            };

            let group = /_/.test(name) ? name.replace(/_.+$/, '') : name;
            groups[group] = true;

            if (name.indexOf(groupName) === 0) {
                listTest.push([name, clss]);
            };
        };

        for (let name in groups) {
            if (groups[name] === true) {
                listGroups.push(name)
            };
        };

        listGroups.sort();

        function group(name, child, key) {
            return [
                {
                    class: b('group'),
                    key: key,
                }
                , [b('groupLabel'), '' + name]
                , [b('groupBox')
                    , (child)
                ]
            ];
        };

        return [b('', props.mix)
            , [b('H1')
                , ({
                    class: b('+a.backLink'),
                    href: '/',
                })
                , "Вернуться"
            ]


            , [b('tabs')
                , jr.map(listGroups, function(name, index, push) {

                    return [
                        {
                            class: b('+a.groupLink', {select: name == groupName}),
                            href: '/tests/' + name,
                            key: 'g' + index,
                        }
                        , ('' + name).replace(/^Test|01$/g, '')
                    ];
                })
            ]

            , [b('hr')]


            , jr.map(listTest, function([name, clss], index) {
                return group(name, {class: clss}, index);
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
