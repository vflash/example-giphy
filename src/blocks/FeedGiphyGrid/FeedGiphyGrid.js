import {exComponentUpdate, React, cmps, view, bem, jr, t} from '../cmps.js';

import './FeedGiphyGrid.sass';
var b = bem('FeedGiphyGrid');


cmps('FeedGiphyGrid', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        imageSize: 'fixed_width_small', // 'original',
        columns: 4,
        length: 20,
        feed: null,
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;


        var columnsList = [];
        var columnsSize = [];
        var imageSize = props.imageSize;
        var columns = props.columns;

        var feed = props.feed || false;
        var list = feed.list || [];

        for (let i = columns; i--;) {
            columnsList.push([]);
            columnsSize.push(0);
        };

        function getMinColumn() {
            var min = columnsSize[0] || 0;
            var res = 0;

            for (var i = 1; i < columns; i++) {
                var size = columnsSize[i];
                if (size < min) {
                    min = size;
                    res = i;
                };
            };

            return res;
        };

        for (let i = 0, l = Math.min(props.length, list.length); i < l; i++) {
            let data = list[i];

            let images = data.images;
            let image = images[imageSize];
            let r = image.height / image.width;

            let indexColumn = getMinColumn();
            let column = columnsList[indexColumn];

            columnsSize[indexColumn] += r;
            column.push([data, image]);
        };

        return [b('', props.mix)
            , jr.map({length: columns}, (x, index) => {
                var columnList = columnsList[index];
                return [{class: b('column'), key: index}
                    , jr.map(columnList, ([data, image], index) => {
                        return ({
                            class: cmps.FeedGiphyGrid_Image,
                            image,
                            data,
                            key: index,
                        });
                    })
                ];
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


cmps('FeedGiphyGrid_Image', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        image: null,
        data: null,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var image = props.image;
        var data = props.data;
        var r = image.height / image.width;

        return [{
            target: '_blank',
            class: b('+a.image', props.mix),
            href: data.bitly_url,
            style: {
                backgroundImage: 'url(' + (image.url) + ')',
                paddingTop: (r * 100) + '%',
            },
        }];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

});
