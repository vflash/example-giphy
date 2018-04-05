var arraySlice = [].slice;

export default function minTimeout() {
    var tm = +new Date();

    return function(x, cb) {
        var resolve;
        var prom = new Promise(function(_resolve, reject) {
            resolve = _resolve;
        });

        var self = this;
        var args = [];

        if (cb && arguments.length > 2) {
            args = arraySlice.call(arguments, 2);
        };

        var func = () => {
            cb && cb.apply(this, args);
            resolve();
        };

        setTimeout(func, Math.min(x, x - (new Date() - tm)));
        return prom;
    };
};
