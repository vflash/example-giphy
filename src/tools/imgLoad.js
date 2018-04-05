export default imgLoad;

function imgLoad(src, end) {
    var img = document.createElement('img');

    var resolve;
    var prom = new Promise(function(_resolve, reject) {
        resolve = _resolve;
    });

    function _end(status, img) {
        resolve(end && end(status, img) || [status, img]);
    };

    img.onerror = function() {
        img.onerror = null;
        img.onload = null;

        _end('noimg');
    };

    img.onload = function() {
        img.onerror = null;
        img.onload = null;

        if (!img.width || !img.height) {
            return _end('noimg');
        };

        _end(true, img);
    };

    img.src = src;
    return prom;
};
