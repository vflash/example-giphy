export default new function () {
    var decodeURIComponent = window.decodeURIComponent;
    var unescape = window.unescape;

    return function decodeURI(x) {
        try {
            return decodeURIComponent(x);
        } catch(e) {
            return unescape(x);
        };
    };
};
