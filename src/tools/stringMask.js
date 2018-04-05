// 'MASK.PASSPORT_DEPARTMENT_CODE'
import {PHONE_RULES} from './dataPhones.js';


export default function stringMask(type, string) {
    if (string == null) {
        return '';
    };

    var value = '' + string;
    var mask = MASK[type];
    return mask ? mask.apply(value, false) : value;
};

function str(source) {
    return source != null ? '' + source : ''
};

var MAP_PHONE_RULES = {};

// placeholder: - placeholder для поля
// apply: применить маску
// output: очистит значение перед тем как вернуть значение во вне (к примеру метод get() возврашает очишенное значение)
// check: - проверяет что значение сооответствует маске
// chars: - правила для символов
// rule: - правило маски
// copy: - при копировании текста дает возможность очистить значение
// use: - сделать по вовозможности красиво (check + apply)
// limit: - лимит символов (число)
// count: - метод возврашает колличество символов в строке

export var MASK = {
    RU_PASSPORT_DEPARTMENT_CODE: {
        placeholder: '___ ___',
        apply: function(source, isPositive) {
            return maskDefault(this.rule, this.chars, source, !!isPositive);
        },
        chars: {'X': /\d/},
        rule: 'XXX-XXX',
    },

    RU_PASSPORT_SERIAL_NUMBER: {
        placeholder: '__ __ ______',
        apply: function(source, isPositive) {
            return maskDefault(this.rule, this.chars, source, !!isPositive);
        },
        chars: {'X': /\d/},
        rule: 'XX XX XXXXXX',
    },

    DRIVER_LICENSE: {
        placeholder: '__ __ _______',
        apply: function(source, isPositive) {
            var value = (str(source)
                .replace(/\s+/g, '').substr(0, 10)
                .replace(/(.{4})/, '$1 ')
                .replace(/(.{2})/, '$1 ')
            );

            return isPositive ? value : value.trim();
        },
        check: function(source) {
            return str(source).replace(/\s+/g, '').length <= 10;
        },
        use: function(value) { // сделать красиво
            return (this.check(value)
                ? this.apply(value, false)
                : str(value)
            );
        },
    },

    YYYYMMDD: {
        placeholder: 'гггг.мм.дд',
        apply: function(source, isPositive) {
            var value = maskDefault(this.rule, this.chars, source, !!isPositive);
            return (isPositive ? value : value.trim());
        },
        chars: {
            'Y': /\d/,
            'M': /\d/,
            'D': /\d/,
        },
        rule: 'YYYY.MM.DD',
    },

    DDMMYYYY: {
        placeholder: 'дд.мм.гггг',
        apply: function(source, isPositive) {
            var value = maskDefault(this.rule, this.chars, source, !!isPositive);
            return (isPositive ? value : value.trim());
        },
        chars: {
            'Y': /\d/,
            'M': /\d/,
            'D': /\d/,
        },
        rule: 'DD.MM.YYYY',
    },

    YYYY: {
        placeholder: 'гггг',
        apply: function(source, isPositive) {
            var value = maskDefault(this.rule, this.chars, source, !!isPositive);
            return (isPositive ? value : value.trim());
        },
        chars: {'Y': /\d/},
        rule: 'YYYY',
    },

    RUBLES_PENNY: {
        apply: function(source, isPositive, rule) {
            if (rule) {
                var maskRule = this.apply(rule, isPositive).replace(/\d/g, 'X');
                let value = maskDefault(maskRule, {X: /\d/}, source, !!isPositive);
                return (isPositive ? value : value.trim());
            };

            var valueString = str(source);
            var rubles = MASK.RUBLES.apply(source);
            var penny = valueString.replace(/^[^,\.]*[,\.]?/, '').replace(/[^\d]+/g, '').substr(0, 2);

            var isPenny = !!penny || (isPositive && /[,\.]/.test(valueString));
            return  rubles + (isPenny ? ',' + penny : '');
        },

        output: function(source) {
            var valueString = str(source);
            var rubles = valueString.replace(/[,\.].*$/, '').replace(/[^\d]+/g, '');
            var penny = valueString.replace(/^[^,\.]*[,\.]?/, '').replace(/[^\d]+/g, '').substr(0, 2);
            var penny = (penny + '00').substr(0, 2);

            return rubles + (penny != '00' ? '.' + penny : '');
        },

        use: function(source) {
            var valueString = str(source);
            var rubles = MASK.RUBLES.apply(source);
            var penny = valueString.replace(/^[^,\.]*[,\.]?/, '').replace(/[^\d]+/g, '').substr(0, 2);
            var penny = (penny + '00').substr(0, 2);

            return rubles + (penny != '00' ? ',' + penny : '');
        },
    },

    RUBLES: {
        apply: function(source, isPositive, rule) {
            if (rule) {
                var maskRule = this.apply(rule, isPositive).replace(/\d/g, 'X');
                let value = maskDefault(maskRule, {X: /\d/}, source);
                return (isPositive ? value : value.trim());
            };

            var value = str(source).replace(/[,\.].*$/, '').replace(/[^\d]+/g, '');
            var x = value.length % 3;

            return (x > 0
                ? value.substr(0, x) + value.substr(x).replace(/(\d{3})/g, ' $1')
                : value.replace(/(\d{3})/g, ' $1').substr(1)
            );
        },

        output: function(value) {
            return str(value).replace(/[,\.].*$/, '').replace(/[^\d]+/g, '');
        },
    },

    BANK_ACCOUNT: {
        apply: function(source) {
            return str(source).replace(/[^\d]+/g, '').substr(0, 20).replace(/(\d{5})/g, '$1 ').trim();
        },

        output: function(value) {
            return str(value).replace(/[^\d]/g, '').substr(0, 20);
        },
        copy: function(value) {
            return str(value).replace(/[^\d]/g, '');
        },
        limit: 20,
        count: function(value) {
            return this.output(value).length;
        },
    },

    RU_PHONE: {
        placeholder: '+7 (123) 456-78-90',
        apply: function(source, isPositive) {
            var phone = str(source).replace(/[^\d]+/g, '');
            if (phone) {
                if (phone[0] === '8') {
                    phone = '7' + phone.substr(1);
                };
                if (phone[0] !== '7') {
                    phone = '7' + phone;
                };
            };

            return maskDefault(this.rule, this.chars, phone, !!isPositive);
        },
        chars: {'X': /\d/},
        rule: '+X (XXX) XXX-XX-XX',

        check: function(source) {
            if (/[^\d\(\)\s\-\+]/.test(source)) {
                return false;
            };

            var source = str(source).replace(/[^\d]+/g, '');
            if (source && source[0] !== '7') {
                return false;
            };

            return source.length <= 11;
        },

        use: function(value) { // сделать красиво
            return (!this.check(value)
                ? MASK.PHONE.use(value, false)
                : this.apply(value, false)
            );
        },
    },

    PHONE: {
        placeholder: '+7 (123) 456-78-90',
        apply: function(source, isPositive) {
            var source = source != null ? '' + source : '';

            var phone = source.replace(/[^\d]+/g, '');
            var rule = find(phone);
            function find(value) {
                while(value) {
                    var rule = MAP_PHONE_RULES[value];
                    if (rule) {
                        return rule;
                    };
                    value = value.slice(0, -1);
                };

                return '';
            };


            if (!rule) {
                //return phone ? '+' + phone : '';
                return source;
            };

            var res = maskDefault(rule, {'X': /\d/}, source, !!isPositive);

            var resLength = res.replace(/[^\d]+/g, '').length;
            if (resLength < phone.length) {
                return res + ' ' + phone.substr(resLength);
            };

            return res;
        },

        check: function(source) {
            return !/[^\d\(\)\s\-]/.test(source);
        },

        use: function(value) {
            return (this.check(value)
                ? MASK.PHONE.apply(value, false)
                : value
            );
        },
    },

    PHONE_INCODE: {
        placeholder: '1234',
        apply: function(source) {
            return source.replace(/\s+/g, '').substr(0, 4);
        },
    },

    RU_ZIP: {
        placeholder: '123456',
        apply: function(source) {
            return source.replace(/[^\d]+/g, '').substr(0, 6);
        },
    },

    PTS: {
        placeholder: '__ __ ______',
        apply: function(source, isPositive) {
            /*
            var en = 'QWERTYUIOP[{]}ASDFGHJKL;:"\'ZXCVBNM,<.>';
            var ru = 'ЙЦУКЕНГШЩЗХХЪЪФЫВАПРОЛДЖЖЭЭЯЧСМИТЬББЮЮ';
            source = source.toLocaleUpperCase().replace(/[^\s\d]/g, function(char) {
                var i = en.indexOf(char);
                return i >= 0 ? ru[i] : char;
            });
            */

            return maskDefault(this.rule, this.chars, source.toLocaleUpperCase(), !!isPositive);
        },
        check: function(source) {
            var source = source.replace(/\s+/g, '').toLocaleUpperCase();
            var value = maskDefault(this.chars, 'DDSSDDDDDD', source);
            return source === value;
        },
        chars: {
            'S': /[А-ЯЁ]/,
            'D': /\d/,
        },
        rule: 'DD SS DDDDDD',
    },

    VIN: {
        placeholder: '___ ______ ________',
        limit: 17,
        count: function(source) {
            return maskDefault('WWWWWWWWWWWWWWWWW', this.chars, source).length;
        },
        apply: function(source, isPositive) {
            /*
            var en = 'QWERTYUIOP[{]}ASDFGHJKL;:"\'ZXCVBNM,<.>';
            var ru = 'ЙЦУКЕНГШЩЗХХЪЪФЫВАПРОЛДЖЖЭЭЯЧСМИТЬББЮЮ';
            source = source.toLocaleUpperCase().replace(/[^\s\d]/g, function(char) {
                var i = ru.indexOf(char);
                return i >= 0 ? en[i] : char;
            });
            */

            return maskDefault(this.rule, this.chars, source.toLocaleUpperCase(), !!isPositive);
        },
        check: function(source) {
            var source = source.replace(/\s+/g, '').toLocaleUpperCase();
            var value = maskDefault(this.rule, this.chars, source);
            return source === value;
        },
        chars: {
            'W': /\w/,
            'S': /[\dABCDEFGHJKLMNPRSTUVWXYZ]/i,
            'X': /[\dX]/,
            'D': /\d/,
        },
        //rule: 'SSS SSSSSX SSSSDDDD',
        rule: 'WWWWWWWWWWWWWWWWW',
    },

};


PHONE_RULES.forEach(function(value) {
    if (!value) {
        return;
    };

    var rule = value.replace(/\d/g, 'X');
    var key = value.replace(/[^\d]+/g, '');

    for(; key; key = key.slice(0, -1)) {
        if (MAP_PHONE_RULES[key]) {
            break;
        };

        MAP_PHONE_RULES[key] = rule;
    };
});



// бегу по маске и ишу символы в исходнике
export function maskDefault(rule, chars, source, isPositive) {
    var sourceLength = source.length;
    var charSource;
    var value = '';
    var l = rule.length;
    var z = 0; // символов из маски в конце
    var j = 0;
    var i = 0;

    for(; i < l; i++) {
        var charRule = rule[i];
        var rgx = chars[charRule];
        if (!rgx) {
            value += charRule;
            z += 1;
            continue;
        };

        while(charSource = source[j++]) {
            if (rgx.test(charSource)) {
                value += charSource;
                z = 0;
                break;
            };
        };

        if (!charSource) {
            break;
        };
    };

    return (!isPositive && !!z
        ? value.slice(0, -z)
        : value
    );
};

