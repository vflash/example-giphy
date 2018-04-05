import urlParseSearch from 'src/tools/urlParseSearch.js';
import expansionEvent from 'src/tools/expansionEvent.js';
import expand from 'src/tools/expand.js';
import view from 'src/models/view/view.js';
import rest from 'src/models/rest/rest.js';


export default GiphySearchFeed;

function GiphySearchFeed(op) {
    var model = this;

    if (typeof op === 'string') {
        op = {feed: op};
    };

    var _countInitLoad = op.countInitLoad || +urlParseSearch(op.feed).limit || 15;
    var _countMaxLoad = op.countMaxLoad || 100;
    var _countMinLoad = op.countMaxLoad || 10;

    var _loading = false;
    var _waitsSync = []; // ожидаюшие синхронизации
    var _waits = []; // ожидаюшие

    var update = function() {
        model.emit('update');
        view.update();
    };

    expand(this, expansionEvent, {
        timeSync: null, // time когда была синхронизация. только для чтения

        loaded: false,
        error: null, // ошибка [status, result] если при загрузке произошла ошибка
        depth: 0, // заказанная глубина загрузки
        feed: op.feed, // /api/giphy/gifs/search
        list: null, // null|[]

        get waitSync() {
            return !!_waitsSync.length;
        },

        get options() { // параметры денты
            return urlParseSearch(this.feed);
        },

        get length() {
            return model.list ? model.list.length : 0;
        },

        load: function(depth) {
            var depth = +depth || 15;
            if (model.loaded || model.length >= depth) {
                return Promise.resolve([true, model])
            };

            if (model.depth < depth) {
                model.depth = depth;
            };

            var promise = new Promise(resolve => {_waits.push([depth, resolve])});

            if (!_loading) {
                _loading = true;
                _load();
            };

            return promise;
        },

        sync: sync,
    });

    function sync(time) {
        if (+new Date() - model.timeSync < (+time || 60000)) {
            return Promise.resolve([false]); // время еше не вышло
        };

        if (_loading && !_waitsSync.length) { // идет загрузка данных. синхронизация не возможна
            return Promise.resolve([false]);
        };

        // опрашиваю у всех кому сколько требуется, или отменяем если кто-то против
        // после всем сообшаю что обновил список

        var promise = new Promise(resolve => {_waitsSync.push(resolve)});

        if (_waitsSync.length === 1) {
            let eventSync = {name: 'startSync', stop: false};
            let length = null;

            model.emit(eventSync, {
                get length() {return length;},
                set length(value) {
                    if (length == null || +value > length) {
                        length = +value || null;
                    };
                },
                cansel: function() {
                    eventSync.stop = true;
                },
            });

            if (eventSync.stop) { // один из слушателей отменил синхронизацию
                return Promise.resolve([false]);
            };

            _syncLoad(length || model.length || 15);
        };

        return promise;
    };

    function _syncDelay() { // пауза пока не пройдет синхронизация
        return (_waitsSync.length
            ? new Promise(resolve => {_waitsSync.push(resolve)})
            : Promise.resolve([true])
        );
    };

    async function _syncLoad(length) {
        var [status, result] = await rest.get(
            [model.feed, {limit: length}]
        );

        var waits = _waitsSync;
        _waitsSync = [];

        if (status !== true) {
            end(false);
            return;
        };

        var list = [].concat(result.data);

        model.timeSync = +new Date();
        model.loaded = list.length < length;
        model.depth = list.length;
        model.list = list;

        model.emit('sync'); // сообшаем всем что прошла синхронизация
        update();

        end(true);

        function end() {
            waits.forEach(resolve => resolve([status]));
        };
    };

    // будем загружать пока не достигнем depth
    async function _load() {
        await _syncDelay(); // ждем пока не закончится синхронизация

        var list = model.list;

        var offset = list ? list.length : 0;
        var limit = (model.list
            ? Math.min(_countMaxLoad, Math.max(_countMinLoad, model.depth - list.length))
            : Math.max(_countInitLoad, model.depth)
        );

        if (model.depth < limit) {
            model.depth = limit;
        };

        var [status, result] = await rest.get(
            [model.feed, {offset, limit}]
        );

        if (status !== true) {
            _loading = false;
            _onError(status, result)
            return;
        };

        if (!offset) {
            model.timeSync = +new Date();
        };

        var resultList = result.data;

        model.loaded = resultList.length < limit;
        model.error = null;

        _push(resultList);
        _onLoad();

        if (!model.loaded && model.list.length < model.depth) {
            return _load();

        } else {
            _loading = false;
        };
    };

    function _push(result) {
        var list = model.list || (model.list = []);
        if (result.length) {
            model.list = (list).concat(result);
            update();
        };
    };

    function _onError(status, result) {
        model.error = [status, result];

        var waits = _waits;
        _waits = [];

        var i = 0;
        var x;

        while(x = waits[i++]) {
            (x[1])([status, result]);
        };
    };

    function _onLoad() {
        var length = model.list.length;
        var waits;

        if (!model.loaded) {
            waits = [];

            _waits = _waits.filter(function(x) {
                if (x[0] > length) {
                    return true;
                };

                waits.push(x);
                return false;
            });

        } else {
            waits = _waits;
            _waits = [];
        };

        var i = 0;
        var x;

        while(x = waits[i++]) {
            (x[1])([true, model]);
        };
    };

};

