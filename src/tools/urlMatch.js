/*
urlMatch('/users/{userId}/albums/{albumId}', url, {
    albumId: /\d+/,
    userId: /\d+/
});
*/

import urlParseSearch from 'src/tools/urlParseSearch.js';
export default urlMatch;


function urlMatch(rule, url, keys) {
    var rmap = [];

    var sreg = rule.replace(/\{([\w\.]+)\}|[.*+?^${}()|[\]\\]/g, function(c, x) {
        if (x) {
            rmap.push(x);

            if (keys) {
                var kRegx = keys[x];
                if (kRegx) {
                    return '(' + kRegx.source + ')';
                };
            };

            return '([^\/\?]+)';

        } else {
            return '\\' + c;
        };
    });

    var arr = url.match(
        new RegExp('^' + sreg + '(?:\\?|$)', 'i')
    );

    if (arr) {
        var res = urlParseSearch(url);
        var i = arr.length;

        while(--i) {
            res[rmap[i - 1]] = arr[i];
        };

        return res;
    };

    return null;
};
