import decodeURI from 'src/tools/decodeURI.js';
export default urlParseSearch;

function urlParseSearch(url) {
    var query = ('' + url).replace(/^[^\?]*\??/, '').replace(/#.*$/, '');
    var rgx = /([^&#=]+)(?:\=([^&#]*))?/g;
    var res = {}, x;

    while (x = rgx.exec(query)) {
        res[decodeURI(x[1])] = x[2] ? decodeURI(x[2]) : '';
    };

    return res;
};
