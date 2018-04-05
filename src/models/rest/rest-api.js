import expansionEvent from 'src/tools/expansionEvent.js';
import urlTransform from 'src/tools/urlTransform.js';
//import modelToken, {PATH_SERVER_API} from 'src/models/modelToken.js';
import urlMatch from 'src/tools/urlMatch.js';
import expand from 'src/tools/expand.js';
import 'whatwg-fetch';

var PATH_SERVER_API = '';
var isArray = Array.isArray;
var lastCSRF;
var rest;

export default rest = expand(null, expansionEvent, {
    error: function(code, status, result) {
        return status === 'error' && result.code == code;
    },

    post: post,
    del: del,
    put: put,
    get: get,
    mix: mix,
    url: urlTransform,
});

window._rest = rest;

/*
xhr({
    method: 'post',
    data: {},
    url: '/api/...',
})
*/
function xhr(opts) {
    var resolve;
    var prom = new Promise(function(_resolve, reject) {
        resolve = _resolve;
    });

    if (isArray(opts.url)) {
        opts.url = urlTransform(opts.url[0], opts.url[1]);
    };

    function onResponse(status, response) {
        function end(status, result) {
            if (opts.end) {
                var res = (opts.end)(status, result, request);
            };

            resolve(res
                ? [res[0], res[1], request]
                : [status, result, request]
            );
        };

        if (status !== true) {
            end(status, response);
            return;
        };

        if (response.error) {
            end('error', response.error);
            return;
        };

        emitResult(request, response);
        end(status, response.result);
    };

    function getURL(method, url) { // для глобальной смены версии
        var url = url.replace(/#.*/, '');
        return url;

        // if (/^\/api\/v\d+\//.test(url)) {
        //     return url.replace(/^\/api\//, '/');
        // };
        //
        // return url.replace(/^\/api\//, '/v1/'); // '/api/v1/'
    };

    var method = opts.method ? ('' + opts.method).toLocaleLowerCase() : 'get';

    var request = expand({}, expansionEvent, {
        complete: false,
        headers: {},
        method: method,
        data: opts.data,
        opts: opts,
        type: 'json',

        url: getURL(method, opts.url),

        end: function(status, response) {
            if (request.complete) {
                return;
            };

            request.complete = true;

            let error = (status === true ? response.error || false : false);
            // if (error.code == 401 && modelToken.userId) {
            //     // если видим что сессия протухла то сбрасываем ее
            //     modelToken.set(false);
            //     return;
            // };

            request.emit('complete', status, response);
            onResponse(status, response);
        },
    });


    if (/^\/api\/giphy\//.test(request.url)) {
        sendGiphy(request);
    } else {
        send(request);
    };

    return prom;
};

function emitResult(request, response) {
    var method = request.method;
    var url = request.url;

    var path = url.replace(/^\/v\d+\//, '/api/');

    var event = {
        response: response,
        request: request,
        method: method,
        set result(result) {
            event.response.result = result;
        },
        get result() {
            return event.response.result;
        },
        match: function(rule, ops) {
            return urlMatch(rule, event.path, ops);
        },
        pathname: path.replace(/\?.*/, ''),
        path: path,
        ver: (url.match(/^\/(v\d+)\//)||[,'v1'])[1],
        url: url,
    };

    rest.emit('_' + method, event); // для тех кто подменяет данные
    rest.emit(method, event); // для тех кто ожидает данные
};


function getFormData(request) {
    var data = request.data;

    if (request.method == 'post' && urlMatch('/api/----', request.opts.url)
    ) {
        var formData = new FormData()
        formData.append('---]', data.xxxx);
        return formData;
    };
};

function sendGiphy(request) {
    async function checkStatus(response) {
        var contentType = response.headers.get('Content-Type');
        if (!/application\/json/i.test(contentType)) {
            errorResponse(response);
            return;
        };

        var responseText = await response.text();
        var data;

        try {
            data = JSON.parse(responseText);
        } catch(e) {
            errorResponse(response);
            return;
        };

        if (!data && typeof data !== 'object') {
            errorResponse(response);
            return;
        };

        var code = response.status;
        if (code == 200 || code == 201) {
            if (data.data) {
                return {result: data};
            };
            if (data.message) {
                return {error: {code: 'GIPHY_ERROR', message: data.message, data}};
            };
        };

        errorResponse(response);
    };

    function errorResponse(response) {
        var error = new Error(response.statusText);
        error.response = response;
        error.status = code;
        throw error;
    };

    var url = request.url.replace('/api/giphy/', 'https://api.giphy.com/v1/');

    return fetch(url, {
        credentials: 'same-origin', //'same-origin',
        //headers: expand(null, {...contentType}),
        method: request.method,
        body: JSON.stringify(request.data),
    })
    .then(checkStatus)
    .then(function(data) {
        return [true, data];
    }).catch(function(error) {
        return ['errorNetwork', null];
    })
    .then(function(res) {
        request.end(res[0], res[1]);
        return res;
    });
};

function send(request) {
    async function checkStatus(response) {
        var contentType = response.headers.get('Content-Type');
        if (!/application\/json/i.test(contentType)) {
            errorResponse(response);
            return;
        };

        var responseText = await response.text();
        var data;

        try {
            data = JSON.parse(responseText);
        } catch(e) {
            errorResponse(response);
            return;
        };

        if (!data && typeof data !== 'object') {
            errorResponse(response);
            return;
        };

        var code = response.status;
        if (code == 200 || code == 201) {
            return data;
        };

        errorResponse(response);
    };

    function errorResponse(response) {
        var error = new Error(response.statusText);
        error.response = response;
        error.status = code;
        throw error;
    };

    var formData = getFormData(request); // для спец запросов
    //var token = modelToken.token || null;

    var contentType = {
        'X-Requested-With': 'XMLHttpRequest',
    };
    if (!formData) {
        contentType['content-type'] = 'application/json';
    };
    if (lastCSRF) {
        contentType['X-CSRF-Token'] = lastCSRF;
    };

    return fetch(PATH_SERVER_API + request.url, {
        credentials: 'include', //'same-origin',
        headers: expand(null, request.headers, {
            ...contentType,
            //'authorization': token ? 'Bearer ' + token : null,
        }),
        method: request.method,
        body: formData || JSON.stringify(request.data),
    })
    .then(checkStatus)
    .then(function(data) {
        return [true, data];
    }).catch(function(error) {
        return ['errorNetwork', null];
    })
    .then(function(res) {
        request.end(res[0], res[1]);
        return res;
    });
};


function post(url, data, end) {
    return xhr({
        method: 'POST',
        data: data,
        url: url,
        end: end,
    });
};

function del(url, end) {
    return xhr({
        method: 'DELETE',
        url: url,
        end: end,
    });
};

function put(url, data, end) {
    return xhr({
        method: 'PUT',
        data: data,
        url: url,
        end: end,
    });
};

function get(url, end) {
    return xhr({
        method: 'GET',
        url: url,
        end: end,
    });
};

async function mix(map, end) {
    var xStatus = {};
    var xResult = {};
    var isError = false;

    var keys = [];
    var m = [];

    for (var name in map) {
        var cmd = map[name];
        if (!cmd) {
            continue;
        };

        keys.push(name);

        if (isArray(cmd) || typeof cmd === 'string') {
            m.push(rest.get(cmd));
        } else {
            m.push(cmd);
        };
    };


    var xres = await Promise.all(m);
    xres.forEach((res, index) => {
        if (res[0] !== true) {
            isError = true;
        };

        var key = keys[index];
        xStatus[key] = res[0];
        xResult[key] = res[1];
    });

    if (end) {
        await end(isError ? xStatus : true, xResult);

        isError = false;
        keys.forEach((key) => {
            if (xStatus[key] !== true) {
                isError = true;
            };
        });
    };

    return [isError ? xStatus : true, xResult];
};

