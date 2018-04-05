/*
t("Осталось {plural} {секунда|секунды|секунд}", {
    plural: this._delay,
})
t("Выполнено {completed} {:completed шаг|шага|шагов} из {all}", {
    completed: 2,
    all: 5
})

ru - 1|2|5
ru 0 2
ru 1 0
ru 2 1
ru 5 2

*/

var model;

export default model = {
    currentLang: 'ru',
    data: {

    },

    getText: getText,
    get: get,
};

function getText(key) {
    var value = model.data[key];
    return value != null ? value : key;
};

function get(key, op) {
    var value = model.data[key];
    var lang = model.currentLang;

    if (value == null) {
        value = key;
    };

    if (!op) {
        return value;
    };

    return value.replace(/\{([^\{\}]+)\}/g, function(s, value) {
        if (value.indexOf('|') !== -1) { // plural
            var x = value.match(/^\:(\w+)[ ]+/);
            var prm = x ? x[1] : 'plural';

            var num = op[prm];
            if (num == null) {
                return s;
            };

            var x = value.match(/([^\s]+)$/);
            var list = (x ? x[1] : '').split('|');

            var plural = getPluralN(lang, num);
            var res = list[plural];
            if (res == null) {
                res = list[0];
            };

            return res;
        };

        var res = op[value];
        return (res != null
            ? res
            : s
        );
    });
};

/*
[0,1,2,5].forEach(function(n, index) {
    console.log(model.currentLang, n, getPluralN(model.currentLang, n));
});
*/


function getPluralN(lang, n) {

    switch (lang) {
        case 'ru': // Russian
        case 'uk':
            return n % 10 == 1 && n % 100 != 11 ?
                0 :
                n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ?
                    1 : 2;

        case 'en': // English
        case 'de': // German
        case 'it': // Italian
        case 'es': // Spanish
        case 'pt': // Portuguese
            return n !== 1 ? 1 : 0;

        case 'fr': // French
            return n > 1 ? 1 : 0;

        default:
            return 0;
    };

};

