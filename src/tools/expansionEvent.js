'use strict';

var functionCall = Function.call;

module.exports = {
    eventsList: null,

    /*
    checkEventListener: function(eventName) {
        var eventsList = this.eventsList;
        if (!eventsList) {
            return false;
        };

        var list = eventsList[eventName];
        return (list
            ? list.length > 0
            : false
        );
    },
    */

    removeEventListener: removeEventListener,
    off: removeEventListener,

    addEventListener: addEventListener,
    on: addEventListener,

    emit: function(event) {
        if (!this.eventsList) {
            return;
        };

        if (typeof event === 'object') {
            emitObject(this, event, arguments);
            return;
        };

        var eventName = '' + event;
        var list = this.eventsList[eventName];
        if (!list) {
            return;
        };

        var args = arguments;
        var i = 0, func;

        args[0] = this;

        while(func = list[i++]) {
            if (typeof func === 'function') {
                functionCall.apply(func, args);
            };
        };
    }
};


function emitObject(self, event, args) {
    var list = self.eventsList[event.name];
    if (!list) {
        return;
    };

    var i = 0, func;
    args[0] = self;

    while(func = list[i++]) {
        if (typeof func === 'function') {
            functionCall.apply(func, args);
            if (event.stop) {
                return;
            };
        };
    };
};


function removeEventListener(event, func) {
    if (!this.eventsList) {
        return;
    };

    if (typeof event === 'string') {
        event = {name: event, stop: false};
    };

    var list = this.eventsList[event.name];
    if (!list) {
        return;
    };

    var i = list.indexOf(func);
    if (i >= 0) {
        list.splice(i,1);
    };
};


function addEventListener(name, func, top) {
    var eventsList = this.eventsList || (this.eventsList = []);
    var list = eventsList[name] || (eventsList[name] = []);

    if (typeof func === 'function') {
        top ? list.unshift(func) : list.push(func);
    };
};

