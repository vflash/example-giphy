'use strict';

import view from './view.js';
export default view;


view.init = function() {
    if (view.isInit) {
        return;
    };

    view.isInit = true;

    function replaceHistory(state) {
        var contextHistory = state.contextHistory || [];
        contextHistory.shift();

        var locationSearch = (location.search
            .replace(/(\?|&)emt=[^&]+/, '')
            .replace(/^&(?=.)/, '?')
        );

        var rePage = getRestoredPage();
        var href = location.pathname + locationSearch + location.hash;

        if (rePage ? rePage.NUMBER_PAGE === state.NUMBER_PAGE : false) {
            view.closePopup(true);
            return;
        };

        view.replace(href, {
            __contextHistory: contextHistory,
            data: state.data || null,
        });
    };

    window.onpopstate = function(event) {
        replaceHistory(event.state || {})
    };

    replaceHistory(history.state || {})
};

function getRestoredPage() {
    var pages = view.state.pages;
    var i = pages.length, page;
    var find = false;

    while(i--) {
        if (pages[i]) {
            if (find) {
                page = pages[i]
                break;
            };
            find = true;
        };
    };

    return page;
};


