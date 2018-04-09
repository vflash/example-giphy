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
    var _waits = []; // ожидаюшие

    var update = function() {
        model.emit('update');
        view.update();
    };

    expand(this, expansionEvent, {
        loaded: false,
        error: null, // ошибка [status, result] если при загрузке произошла ошибка
        depth: 0, // заказанная глубина загрузки
        feed: op.feed, // /api/giphy/gifs/search
        list: null, // null|[]

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
    });


    // будем загружать пока не достигнем depth
    async function _load() {
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

