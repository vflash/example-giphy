'use strict';
module.exports = expand;

var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var defineProperty = Object.defineProperty;

function expand(target) {
    var i = 1, l = arguments.length, source, key;
    if (target == null) {
        target = {};
    };

    while (i < l) {
        if (source = arguments[i++]) {
            for (key in source) {
                if (source.hasOwnProperty(key)) {
                    defineProperty(target, key, getOwnPropertyDescriptor(source, key));
                    //target[key] = source[key];
                };
            };
        };
    };

    return target;
};
