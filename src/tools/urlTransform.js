'use strict';
//-------------------------------------
module.exports = urlTransform;

/*
var url = urlTransform('/xxx/{userId}/aaaa', {
    userId: '253474735673',
    limit: 10,
});

console.log(url); // '/xxx/253474735673/aaaa?limit=10'
*/


function urlTransform(url, data) {
    // undefined - игнорируемый параметр data
    // null - удаляет из аргументов запроса
    // null - в path, оставляет шаблон как есть

    if (!data) {
        return url;
    };

    var undf, a = [], smap = {}, no = {}, key;

    if (url = url || '') {
        url = url.replace(/{([-\w\.]+)}/g, function(x, key) {
            if (key in data) {
                no['_' + key] = true;
                var v = data[key];

                if (v != null) {
                    return typeof v !== 'object' ? encodeURIComponent(v) : '' + v;
                };
            };

            return x;
        });

        url = url.replace(/\?(.*)$/, function(a, s) {
            s.replace(/([^&=]+)(?:=[^&]*)/g, function(s, name) {
                return smap['_' + name] = s;
            });

            return '';
        });
    };

    for (key in data) {
        var v = data[key];

        if (v === undf || no['_' + key]) {
            continue;
        };

        smap['_' + key] = (v != null
            ? encodeURIComponent(key) + '=' + (typeof v !== 'object' ? encodeURIComponent(v) : v)
            : null
        );
    };

    for (key in smap) {
        if (smap[key] != null) {
            a.push(smap[key]);
        }
    }

    if (a.length) {
        url += '?' + a.join('&');
    }

    return url;
};
