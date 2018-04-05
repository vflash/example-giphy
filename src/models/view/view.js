import expansionEvent from 'src/tools/expansionEvent.js';
import urlTransform from 'src/tools/urlTransform.js';
import urlMatch from 'src/tools/urlMatch.js';
import ReactDOM from 'react-dom';
import expand from 'src/tools/expand.js';
import React from 'react';


if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
};

var INDEX_PAGE = 0;
var HISTORY = {
    replace: function(path, data) {
        history.replaceState(data, null, path);
    },
    push: function(path, data) {
        history.pushState(data, null, path);
    }
};

var _timmerDelayRender = null; // пауза для renderUpdate
var _isProgressRender = false;
var waitsRender = []; // список слушателей которые ждут события рендера
var waitLoadNP = null; // номер страницы которой ожидаем загрузки
var view = window.view = {};

export function onLocation(fn) {fn && view.on('location', fn)};
export default view;


expand(view, expansionEvent, {
    CURRENT_NUMBER_PAGE: null,
    CURRENT_PATH: null,

    classViewApp: null, // cmps.View
    component: null,
    isInit: false, // пока не true рендер запрешен

    state: {
        NUMBER_PAGE: null,
        isLoading: false,
        viewType: 'app', //  app|auth|doc|.... string
        path: '/',
        zIndex: 0,
        pages: [null], // object|false
    },

    findContextHistory: findContextHistory,
    getContextHistory: getContextHistory,
    closePopup: closePopup, // закрыть страницу если она popup

    replace: function(path, options, end) {
        if (Array.isArray(path)) {
            path = urlTransform(path[0], path[1]);
        };

        return new Promise(function(_resolve) {
            _go(path, options, true, function(status) {
                _resolve((end && end(status)) || [status]);
            });
        });
    },

    go: function(path, options, end) {
        if (Array.isArray(path)) {
            path = urlTransform(path[0], path[1]);
        };

        return new Promise(function(_resolve) {
            _go(path, options, false, function(status) {
                _resolve((end && end(status)) || [status]);
            });
        });
    },

    reload: function(end) {
        var state = view.state;
        var pages = state.pages, i = pages.length;
        var page;

        while(page = i && pages[--i]) {
            break;
        };

        if (page) {
            _go(page.path, {data: page.data, reload: true}, true, end);
        } else {
            _go(state.path, null, true, end);
        };
    },

    historyReplace: function(path) {
        HISTORY.replace(path);
    },

    historyPush: function(path) {
        HISTORY.push(path);
    },

    getActivePage: getActivePage,

    getCurrentHref: function() {
        var page = getActivePage();
        return page ? page.href : null;
    },

    showError: function(context, status, result) {
        if (status === true) {
            return false;
        };

        var event = {name: 'showError', stop: false};
        view.emit(event, {context, status, result, ok});
        function ok() {
            event.stop = true;
        };

        return true;
    },

    closeDialog: function(type, key) {
        view.emit('closeDialog', {
            type: type || 'common', // common|error
            key: key,
        });
    },

    showDialog: showDialog,

    alertError: function(text, end) {
        showDialog('alertError', {text, end});
    },

    confirm: function(text, end) {
        showDialog('confirm', {text, end});
    },
    alert: function(text, end) {
        showDialog('alert', {text, end});
    },

    refresh: function(end) { // принудительный render
        var tm = +new Date();
        _render(end);

        return new Date() - tm;
    },

    update: function(end) { // сообшить что есть изменения
        renderUpdate(end);
    },
});


function showDialog(type, options) {
    var event = {name: 'showDialog', stop: false};
    view.emit(event, {
        options,
        type,
        ok: function() {
            event.stop = true;
        },
    });
};

function renderUpdate(end) { // render с ограниченым fps
    if (typeof end === 'function') {
        waitsRender.push(end);
    };

    if (_timmerDelayRender) {
        return;
    };

    _timmerDelayRender = setTimeout(function() {
        _timmerDelayRender = null;
        _render();
    }, 16);
};

function closePopup(isReplaceHistory) {
    var pages = [].concat(view.state.pages);
    var state = view.state;

    if (!(pages.length > 1)) {
        return;
    };

    var activePage;
    while(pages.length > 1 && !(activePage = pages.pop())) {};
    while(pages.length > 1 && !pages[pages.length - 1]) {
        pages.pop();
    };

    if (pages.length === 1 && state.zIndex > 1) {
        // если эта страница была прервой при загрузки
        // то проверяем нужно ли открыть другой попап

        /*
        var x = ('' + state.path).match(/^(\/users\/[^\/]+)\/(avatar)(\?|$)/);
        if (x) {
            view.go(x[1]);
            return;
        };
        */
    };

    if (pages.length < 1 && !pages[0]) {
        // если нету главной страницы
        view.go('/');
        return;
    };

    var page = pages[pages.length - 1];
    if (!page) {
        view.go('/');
        return;
    };

    if (page.hasChanged) {
        // если на страницы были изменения требуюшие перезагрузку
        view.go(page.path, {data: page.data});
        return;
    };

    // --------------------------------------
    // востанавливаем страницу как активной

    state.path = page.path; // путь который указан в истории
    state.NUMBER_PAGE = page.NUMBER_PAGE; // индекс страницы
    state.zIndex = +page.zIndex || 0;
    state.pages = pages;

    waitLoadNP = null;
    showLoading(false);


    var contextHistory = [].concat(activePage.contextHistory||[]);
    var pageContextId = page.pageContextId;

    if (contextHistory[0] != pageContextId) {
        contextHistory.unshift(pageContextId);
    };

    if (true) {
        page._stateHistory.contextHistory = contextHistory;
        page.contextHistory = contextHistory;
    };

    if (isReplaceHistory) {
        HISTORY.replace(page.href, page._stateHistory);
    } else {
        HISTORY.push(page.href, page._stateHistory);
    };

    _open(state);
};


function showLoading(isShow, page, _originalHref) {
    view._hrefLoadingPage = isShow ? _originalHref : null;
    view._timeLoadingPage = isShow ? +new Date() : null;

    view.state.isLoading = (isShow && page) || false;
    view.update();
};


function _location(param, end) {
    var ok = false, stop;
    var event;

    function getHash(href) {
        return Array.isArray(href) ? '' : ('' + href).replace(/^[^#]*#?/, '');
    };

    function getPath(href) {
        if(Array.isArray(href)) {
            href = urlTransform(href[0], href[1]);
        };
        return ('' + href).replace(/#.*$/, '');
    };

    function upHistory() {
        if (page === getActivePage()) {
            _updateHistory();
        };
    };

    var _path = getPath(param.href);
    var _hash = getHash(param.href);

    var page = {
        NUMBER_PAGE: param.NUMBER_PAGE,
        viewType: view.state.viewType,
        first: param.first,
        view: view,

        contextHistory: [].concat(param.contextHistory),
        pageContextId: null,
        target: param.target || null,

        content: null,
        status: null,
        data: param.data, // location data

        match: function(rule, ops) {
            return urlMatch(rule, _path, ops);
        },

        get pathname() {
            return _path.replace(/\?.*/, '');
        },

        set href(href) {
            _path = getPath(href);
            _hash = getHash(href);
            upHistory()
        },

        get href() {
            return _hash ? _path + '#' + _hash : _path;
        },

        set path(href) {
            _path = getPath(href);
            _hash = getHash(href);
            upHistory();
        },

        get path() {
            return _path;
        },

        set hash(value) {
            _hash = value;
            upHistory()
        },

        get hash() {
            return _hash;
        },

        setLocation: function(path, data) {
            if (typeof data !== 'undefined') {
                this.data = data;
            };

            _path = getPath(path);
            _hash = getHash(path);
        },

        ok: function() {
            event.stop = true;
            ok = true; // рабочий найден
        },

        end: function(status, result) {
            if (stop) {
                return;
            };

            event.stop = true;
            stop = true; // результат получен
            ok = true; // рабочий найден

            page.content = result == null ? null : result;
            page.status = status;

            end(status, page);
        }
    };

    view.emit(event = {name: 'locationBefore', stop: false}, page);
    if (!ok) {
        view.emit(event = {name: 'location', stop: false}, page);
    };

    return {page: page, ok: ok};
};

function createNumberPage() {
    var t = +new Date()
    var x = t - (t % 1000);
    return x + (++INDEX_PAGE % 1000);
};

function _go(_href, options, is_replace, end) {
    var isFirstPage = !view.CURRENT_NUMBER_PAGE;
    var has_history = false;
    var options = options || {};
    var end = end || function() {};

    var href = _href.trim().replace(/^[^\?\#]*/, function(x) {  // в конце url всегда без слеша
      return x.replace(/\/$/g, '').replace(/\/+/g, '/') || '/';
    });

    var isRestoreHistory = !!options.__contextHistory;
    var targetContextId = options.contextId || getPageContextId();
    var activePage = getActivePage();
    var data = options.data || null;


    // запускаем событие на поиск работника который достроит page
    // если главный контент не создан то создадим

    var NP = waitLoadNP = createNumberPage();

    initLoadPage(href);
    return;

    function initLoadPage(href) {
        var loading = true;

        var op = {
            contextHistory: (options.__contextHistory
                ? options.__contextHistory || [] // цепочка получина из истории браузера
                : (activePage
                    ? activePage.contextHistory
                    : []
                )
            ),
            NUMBER_PAGE: NP,
            target: options.target, // какой элемент интерфейса запустил загрузку
            first: isFirstPage,
            href: href,
            data: data,
        };

        var resultLocation = _location(op, function(status, page) {
            if (NP !== waitLoadNP) {
                // ктота уже запросил новую страницу
                end(false);
                return;
            };

            showLoading(loading = false);

            page.complete = true;
            page.status = status;

            if (!isFirstPage) {
                // если это не первая страница а также если ошибка сети то можно отобразить алерт
                if (status == 500 || status == 503) {
                    view.alertError("Cервис временно недоступен");
                    end(null);
                    return;
                };
            };

            switch(status) { // для статусов 404 и 500 стандартная страница
                case 503:
                case 500:
                    setPageError(500, page);
                    break;

                case 404:
                    setPageError(404, page);
                    break;
            };

            completeLoad(page);
        });

        var page = resultLocation.page;
        if (!resultLocation.ok) {
            showLoading(loading = false);

            // не нашли загрузчика. покажем 404
            setPageError(404, page);
            page.ok();

            completeLoad(page);
            return;
        };

        function setPageError(status, page) {
            page.viewType = view.state.viewType;
            page.complete = true;
            page.zIndex = isFirstPage && (status == 500) ? 0 : 1;
            page.status = status;
        };

        if (loading) {
            showLoading(true, page, _href);
        };
    };

    function completeLoad(page) {
        if (NP !== waitLoadNP) {
            // ктота уже запросил новую страницу
            if (end) {
                end(false);
            };
            return;
        };

        var viewType = page.viewType || view.state.viewType;
        page.viewType = viewType;

        var contextHistory = page.contextHistory;

        if (activePage && !isRestoreHistory && (contextHistory[0] != targetContextId)) {
            contextHistory.unshift(targetContextId);
        };
        if (contextHistory[0] != page.pageContextId) {
            contextHistory.unshift(page.pageContextId);
        };
        if (contextHistory.length > 12) {
            contextHistory.length = 12;
        };

        var stateHistory = page._stateHistory = {
            contextHistory: contextHistory,
            NUMBER_PAGE: page.NUMBER_PAGE,
            data: page.data,
        };

        var zIndex = +page.zIndex || 0;
        var pages = view.state.viewType == viewType
            ? [].concat(view.state.pages||[])
            : []
            ;

        pages.length = zIndex;
        pages[zIndex] = page;

        var href = page.href;

        var stateNew = {
            NUMBER_PAGE: NP, // индекс страницы
            viewType: viewType,
            path: page.path, // путь который указан в истории
            zIndex: +zIndex,
            pages: pages,
        };

        var curActivePage = getActivePage();
        var isNewPath = curActivePage ? curActivePage.path !== page.path : true;

        if (has_history || is_replace || !isNewPath) {
            HISTORY.replace(href, stateHistory);
        } else {
            HISTORY.push(href, stateHistory);
        };

        _open(stateNew);

        if (end) {
            end(true, page);
        };

        initMainPage();
    };

    function initMainPage() {
        if (view.state.pages[0]) {
            return;
        };

        var viewType = view.state.viewType;
        var bgPage = '/--background-' + (viewType || 'app');

        var op = {
            contextHistory: [],
            NUMBER_PAGE: createNumberPage(),
            first: false,
            href: bgPage,
            data: null,
        };

        _location(op, function(status, page) {
            if (view.state.pages[0] || (page.path === bgPage)) {
                return; // уже есть главный контент
            };

            page.viewType = viewType;
            page.complete = true;
            page.status = status;
            page.zIndex = 0;

            page.contextHistory.unshift(page.pageContextId);

            var stateHistory = page._stateHistory = {
                contextHistory: page.contextHistory,
                NUMBER_PAGE: page.NUMBER_PAGE,
                data: page.data,
            };

            view.state.pages = [].concat(view.state.pages);
            view.state.pages[0] = page;
            view.update();
        });
    };
};

function getContextHistory() {
    var contextHistory = (view.getActivePage()||{}).contextHistory || [];
    return contextHistory[0] || 0;
};

function findContextHistory(cmp, rules) {
    var contextHistory = (view.getActivePage()||{}).contextHistory || [];
    var l = contextHistory.length;

    var rules = rules.map(function(x) {
        return x ? x.split('.') : x;
    });

    function checkRule(rule, context) {
        if (!rule) {
            return false;
        };

        var j = rule.length;
        while(j--) {
            if (context.indexOf(rule[j]) === -1) {
                return false;
            };
        };

        return true;
    };

    function findRule(context) {
        if (!context) {
            return;
        };

        var cList = context.split('.');
        var l = rules.length;
        var i = 0;

        for (; i < l; i++) {
            if (checkRule(rules[i], cList)) {
                return rules[i].join('.');
            };
        };

        return;
    };

    for (var i = 0; i < l; i++) {
        var context = contextHistory[i];
        if (!context) {
            continue;
        };

        var rule = findRule(context);
        if (rule) {
            return rule;
        };
    };

    return null;
};

function getActivePage(pages) {
    var pages = pages || view.state.pages;
    var i = pages.length, page;
    while(i--) {
        if (page = pages[i]) break;
    };

    return page;
};

function getPageContextId() {
    var page = getActivePage();
    return (page && page.pageContextId) || null;
};


function _render(end) {
    if (typeof end === 'function') {
        waitsRender.push(end);
    };

    if (_timmerDelayRender) {
        clearTimeout(_timmerDelayRender);
        _timmerDelayRender = null;
    };

    var classViewApp = view.classViewApp;

    if (!view.isInit || !classViewApp || view.state.NUMBER_PAGE == null) {
        return;
    };

    if (!_isProgressRender) {
        _isProgressRender = true;
        view.emit('beforeRender');
    };

    // _updateHistory();

    if (!view.component) {
        var rootNode = document.getElementById('appbox') || null;
        var cmp = React.createElement(classViewApp, {});

        view.component = ReactDOM.render(cmp, rootNode);
    };

    view.component.setState({}, _onCompletedRender);
};

function _onCompletedRender() {
    _isProgressRender = false;
    view.emit('render');

    var a = waitsRender;
    if (!a.length) {
        return;
    };

    waitsRender = [];

    var i = 0, fn;
    while(fn = a[i++]) {
        fn();
    };
};

function _updateHistory() {
    var locationSearch = (location.search
        .replace(/^&(?=.)/, '?')
    );

    var href = location.pathname + locationSearch + location.hash;
    var page = getActivePage();
    if (page && page.href !== href) {
        HISTORY.replace(page.href, page._stateHistory);
    };
};

function _open(param) {
    var page = getActivePage(param.pages);

    view.CURRENT_NUMBER_PAGE = page.NUMBER_PAGE;
    view.CURRENT_PATH = page.path;

    view.state.NUMBER_PAGE = page.NUMBER_PAGE;
    view.state.path = page.path;
    view.state.viewType = param.viewType;
    view.state.zIndex = param.zIndex;
    view.state.pages = param.pages;


    _render(function() {
        view.emit('openPage', page);
    });
};

