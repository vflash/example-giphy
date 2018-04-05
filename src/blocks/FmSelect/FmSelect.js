import * as _cmps from '../cmps.js'; const {exComponentUpdate, cmps, bem, jr, t} = _cmps;
import modelDevice from 'src/models/modelDevice.js';

import '../FmSelectNative/FmSelectNative.js';
import '../FmSelectFind/FmSelectFind.js';

//import './FmSelect.sass';
var b = bem('FmSelect');

var isSelenium = /selenium/i.test(navigator.userAgent);

cmps('FmSelect', {
    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        return [{
            ...this.props,
            class: (modelDevice.isMobileAgent || isSelenium
                ? cmps.FmSelectNative
                : cmps.FmSelectFind
            ),
            ref: 'input',
        }];
    },

    update: function(a, b) {
        return this.refs.input.update(a, b);
    },

    reset: function() {
        return this.refs.input.reset();
    },

    focus: function() {
        return this.refs.input.focus();
    },

    set: function(value) {
        return this.refs.input.set(value);
    },

    get: function() {
        return this.refs.input.get();
    },
});
