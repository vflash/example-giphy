import {exComponentUpdate, React, cmps, view, bem, jr, t} from '../cmps.js';
import minTimeout from 'src/tools/minTimeout.js';

import '../FmButtonLabel/FmButtonLabel.js';
import '../FeedGiphyGrid/FeedGiphyGrid.js';
import '../FmInput/FmInput.js';
import '../ForForm/ForForm.js';

import './PageGiphyFeed.sass';
var b = bem('PageGiphyFeed');


cmps('PageGiphyFeed', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        countMore: 10,
        length: 10,
        mix: '',
    },

    init: function() {
        //exComponentUpdate(this, false);
        var props = this.props;
        this._length = Math.min(props.length, props.feed.length);
        this._wait = false;

        console.log('PageGiphyFeed');
    },

    render: function() {
        var props = this.props;
        var self = this;

        var length = this._length;
        var feed = props.feed || false;

        return [b('', props.mix)
            , [{class: b('+form.form'), onSubmit: this._onSubmit}
                , [cmps.ForForm_Right
                    , ({
                        class: cmps.FmInput,
                        placeholder: "Giphy search",
                        value: props.search,
                        label: null,
                        ref: 'input',
                    })
                    , '<--->'
                    , ({
                        class: cmps.FmButtonLabel,
                        type: 'submit',
                        value: t("Go"),
                        wait: this._wait,
                    })
                ]
            ]
            , (feed.length
                ? ({
                    class: cmps.FeedGiphyGrid,
                    columns: 3,
                    length,
                    feed,
                    mix: b('grid'),
                    ref: 'grid',
                })
                : null
            )

            , (!feed.loaded || (length < feed.length)
                ? [b('moreBox')
                    , ({
                        onClick: this._onClickMore,
                        class: cmps.FmButtonLabel,
                        value: t("More"),
                        skin: 'light', // light|default|red
                        wait: this._waitMore,
                    })
                ]
                : null
            )
       ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _onSubmit: function(e) {
        e.preventDefault();
        this._go();
    },

    _onClickMore: function() {
        this._loadMore();
    },

    _go: async function() {
        var q = this.refs.input.get().trim();

        this.update({_wait: true});
        await view.go(q ? ['/', {q}] : '/');

        this.update({_wait: false});
    },

    _loadMore: async function(length) {
        if (this._waitMore) {
            return;
        };

        var newLength = this._length + this.props.countMore;
        var minTm = minTimeout();

        this.update({_waitMore: true});

        var [status] = await this.props.feed.load(newLength);
        await minTm(500);

        this.update({_waitMore: false});

        if (status !== true) {
            return;
        };

        this.update({_length: newLength});
    },

});
