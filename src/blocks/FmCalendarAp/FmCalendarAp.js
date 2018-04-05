import * as _cmps from '../cmps.js'; const {exComponentUpdate, React, cmps, view, bem, jr, t} = _cmps;

import './FmCalendarAp.sass';
var b = bem('FmCalendarAp');


const MONTHS_HEADER = t("Январь,Февраль,Март,Апрель,Май,Июнь,Июль,Август,Сентябрь,Октябрь,Ноябрь,Декабрь").split(',');
const MONTHS_TABLE = t("Янв,Фев,Мар,Апр,Май,Июн,Июл,Авг,Сен,Окт,Ноя,Дек").split(',');
const WEEK_DAYS = t("Пн,Вт,Ср,Чт,Пт,Сб,Вс").split(',');

function getTodayUTCDate() { // строка dd/mm/yyyy
    var d = new Date();
    return new Date((d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear() + ' 00:00:00 GMT');
};

function localToUTCDate(local, value) {
    if (!value) {
        return null;
    };

    if (typeof value === 'object') {
        return new Date(value);
    };

    var local = local.toLocaleUpperCase().match(/\w+/g).map(x => x[0]);
    var a = ('' + value).split(/[\/\-\.]+/g).map(x => +x);
    var y, m, d;

    local.forEach((x, i) => { // YMD
        if (x === 'Y') {
            y = a[i];
            return;
        };
        if (x === 'M') {
            m = +a[i] || 0;
            return;
        };
        if (x === 'D') {
            d = +a[i] || 1;
            return;
        };
    });

    return new Date(Date.UTC(y, m - 1, d));
};

function getFirstYear(year) {
    return year - year % 16;
};

function getMaxDate(y, m) {
    if (m < 0) {
        y += (m - (m % 12) / 12) - 1;
        m = 12 + (m % 12);
    };

    if (m > 11) {
        y = (m - (m % 12)) / 12;
        m = m % 12;
    };

    if (m == 1) {
        return y % 4 || (!(y % 100) && y % 400) ? 28 : 29;
    };

    return m === 3 || m === 5 || m === 8 || m === 10 ? 30 : 31;
};


cmps('FmCalendarAp', {
    exComponentUpdate: function(props, state) {
        return [state, props.value, props.point, props.min, props.max];
    },

    defaultProps: {
        onChange: null,
        select: false, // по умолчанию предлагать выбор с год->месяц->день
        local: 'DD.MM.YYYY',
        value: null,
        point: null,
        min: null,
        max: null,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, true);

        this._initValues = function() {
            this._selected = null; // null|false|[2018][2018,null] - этапы выбора даты
            this._value = null;
            this._point = null;
        };

        this._initValues();
    },

    render: function() {
        var props = this.props;
        var self = this;

        var local = props.local;
        var value = this._value || localToUTCDate(local, props.value) || null;
        var point = this._point || localToUTCDate(local, props.point) || value || getTodayUTCDate();
        var min = localToUTCDate(local, props.min);
        var max = localToUTCDate(local, props.max);

        if (min) {
            var minY = min.getUTCFullYear();
            var minM = min.getUTCMonth();
            var minD = min.getUTCDate();
        };
        if (max) {
            var maxY = max.getUTCFullYear();
            var maxM = max.getUTCMonth();
            var maxD = max.getUTCDate();
        };

        var pointMonth = point.getUTCMonth();
        var pointYear = point.getUTCFullYear();

        var selected = this._selected;
        if (selected == null) {
            min && (minY === maxY)
            selected = (props.select
                ? min && (minY === maxY) ? [pointYear, null] : [pointYear]
                : false
            );
        };

        var cmpBoxForm;
        var cmpTitle;

        var firstYear;
        var year;

        switch(selected.length) {
        case 1:
            year = selected[0];
            firstYear = getFirstYear(year);
            cmpBoxForm = ({
                onSelect: (year) => {
                    this.update({_selected: [year, 1]});
                },
                class: cmps.FmCalendarAp_Years,
                value: value ? value.getUTCFullYear() : null,
                point: year,
                min: min ? min.getUTCFullYear() : null,
                max: max ? max.getUTCFullYear() : null,
                ref: 'years',
            });
            cmpTitle = '' + firstYear + ' - ' + (firstYear + 16);
            break;

        case 2:
            year = selected[0];
            cmpBoxForm = ({
                onSelect: (year, month) => {
                    this.update({
                        _selected: false,
                        _point: new Date(Date.UTC(year, month, 1)),
                    });
                },
                class: cmps.FmCalendarAp_Months,
                value: value && (value.getUTCFullYear() === year) ? value.getUTCMonth() : null,
                year,
                min: min && min.getUTCFullYear() === year ? min.getUTCMonth() : 0,
                max: max && max.getUTCFullYear() === year ? max.getUTCMonth() : 11,
                ref: 'months',
            });
            cmpTitle = '' + selected[0];
            break;

        default:
            cmpBoxForm = ({
                onSelect: this._onSelect,
                class: cmps.FmCalendarAp_Days,
                point,
                value,
                min,
                max,
                ref: 'days',
            });
            cmpTitle = MONTHS_HEADER[pointMonth] + ' ' + pointYear;
        };

        var isDisabledPast = false;
        var isDisabledNext = false;
        if (!selected.length) {
            let past = new Date(Date.UTC(pointYear, pointMonth, 0));
            let pastY = past.getUTCFullYear();
            let pastM = past.getUTCMonth();
            isDisabledPast = pastY < minY || (pastY === minY && pastM < minM);

            let next = new Date(Date.UTC(pointYear, pointMonth + 1, 1));
            let nextY = next.getUTCFullYear();
            let nextM = next.getUTCMonth();
            isDisabledNext = nextY > maxY || (nextY === maxY && nextM > maxM);
        };
        if (selected.length === 1) {
            isDisabledPast = getFirstYear(selected[0]) <= minY;
            isDisabledNext = getFirstYear(selected[0]) + 16 > maxY
        };
        if (selected.length === 2) {
            isDisabledPast = selected[0] - 1 < minY;
            isDisabledNext = selected[0] + 1 > maxY;
        };


        return [b('', props.mix)
            , [b('header')
                , ({
                    class: b('button', '-left', isDisabledPast ? '-disabled' : ''),
                    onClick: () => {
                        if (isDisabledPast) {
                            return;
                        };
                        if (!selected.length) {
                            this.update({_point: new Date(Date.UTC(pointYear, pointMonth - 1, 7))});
                            return;
                        };
                        if (selected.length === 1) {
                            this.update({_selected: [selected[0] - 16]});
                            return;
                        };
                        if (selected.length === 2) {
                            this.update({_selected: [selected[0] - 1, null]});
                            return;
                        };
                    },
                })
                , [
                    {
                        class: b('title'),
                        onClick: () => {
                            this.update({
                                _selected: (!selected
                                    ? min && (minY === maxY) ? [pointYear, null] : [pointYear]
                                    : false
                                ),
                            });
                        },
                    }
                    , (cmpTitle)
                ]
                , ({
                    class: b('button', '-right', isDisabledNext ? '-disabled' : ''),
                    onClick: () => {
                        if (isDisabledNext) {
                            return;
                        };
                        if (!selected.length) {
                            this.update({_point: new Date(Date.UTC(pointYear, pointMonth + 1, 7))});
                            return;
                        };
                        if (selected.length === 1) {
                            this.update({_selected: [selected[0] + 16]});
                            return;
                        };
                        if (selected.length === 2) {
                            this.update({_selected: [selected[0] + 1, null]});
                            return;
                        };
                    },
                })
            ]
            , [b('box')
                , (cmpBoxForm)
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _onSelect: function(Y, M, D) {
        var fn = this.props.onChange;
        if (fn) {
            let isCancel = false;
            let local = this.props.local;
            let m = M + 1;
            let e;

            let value = (local
                .replace(/Y+/i, Y > 9 ? Y : '0' + Y)
                .replace(/M+/i, m > 9 ? m : '0' + m)
                .replace(/D+/i, D > 9 ? D : '0' + D)
            );

            fn(e = {
                cancel: function() {isCancel = true},
                target: this,
                value,
                ymd: [Y, M, D],
            });

            if (isCancel) {
                return;
            };

            if (e.value !== value) {
                let value = localToUTCDate(local, e.value);
                if (+value !== +value) {
                    return;
                };

                this.update({_value: value, _point: value});
                return;
            };
        };

        this.update({
            _value: new Date(Date.UTC(Y, M, D)),
            _point: new Date(Date.UTC(Y, M, D)),
        });
    },

    reset: function() {
        this._initValues();
        this.update();
    },

    get: function() {
        var props = this.props;
        var local = props.local;
        var value = this._value || localToUTCDate(local, props.value);

        if (!value) {
            return '';
        };

        var Y = value.getUTCFullYear();
        var M = value.getUTCMonth() + 1;
        var D = value.getUTCDate();

        return (local
            .replace(/Y+/i, Y > 9 ? Y : '0' + Y)
            .replace(/M+/i, M > 9 ? M : '0' + M)
            .replace(/D+/i, D > 9 ? D : '0' + D)
        );
    },
});


cmps('FmCalendarAp_Months', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        onSelect: null,
        value: null, // 0 - 11
        min: 0,
        max: 11,
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var todayMonth = +new Date().getMonth();
        var todayYear = +new Date().getFullYear();
        var value = props.value;
        var year = props.year;
        var min = +(props.min || 0);
        var max = +(props.max || 11);

        return [b('+table.monthsTable')
            , ['+tbody'
                , jr.map({length: 4}, (row, indexA) => {
                    return [{class: '+tr', key: indexA}
                        , jr.map({length: 3}, (cell, indexB) => {
                            var month = indexA * 3 + indexB;
                            var isDisabled = month < min || month > max;

                            var mix = [
                                , (year === todayYear && month === todayMonth  ? '-today' : '')
                                , (month === value ? '-selected' : '')
                                , (isDisabled ? '-disabled' : '')
                            ];

                            return [
                                {
                                    onClick: isDisabled ? null : (e) => {this._click(+year, +month)},
                                    class: b('+td.td', mix),
                                    key: indexB,
                                }
                                , ('' + MONTHS_TABLE[month])
                            ];
                        })
                    ];
                })
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _click: function(year, month) {
        var fn = this.props.onSelect;
        if (fn) {
            fn(year, month);
        };
    },

});


cmps('FmCalendarAp_Years', {
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        onSelect: null,
        point: null, // number
        value: null, // number
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var todayYear = new Date().getFullYear();
        var point = props.point || todayYear;
        var firstYear = getFirstYear(point);

        var value = props.value; if (value != null) value = +value;
        var min = props.min;
        var max = props.max;

        return [b('+table.YearsTable')
            , ['+tbody'
                , jr.map({length: 4}, (row, indexA) => {
                    return [{class: '+tr', key: indexA}
                        , jr.map({length: 4}, (row, indexB) => {
                            var year = firstYear + indexA * 4 + indexB;
                            var isDisabled = (min != null && year < min) || (max != null && year > max);
                            var mix = [
                                , (isDisabled ? '-disabled' : '')
                                , (year === todayYear ? '-today' : '')
                                , (year === value ? '-selected' : '')
                            ];

                            return [
                                {
                                    onClick: isDisabled ? null : (e) => {this._click(+year)},
                                    class: b('+td.td', mix),
                                    key: indexB,
                                }
                                , ['text', ('' + year)]
                            ]
                        })
                    ];
                })
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _click: function(year) {
        var fn = this.props.onSelect;
        if (fn) {
            fn(year);
        };
    },

});


cmps('FmCalendarAp_Days', { // список дней в выбранном месяце
    exComponentUpdate: function(props, state) {
        return [];
    },

    defaultProps: {
        onSelect: null,
        point: null, // день для которого нужно показать календарь месяца // UTCDate
        value: null, // день который нужно отобразить выбранным // UTCDate
        min: null, // первый день который можно выбрать
        max: null, // последний день который можно выбрать
        mix: '',
    },

    init: function() {
        exComponentUpdate(this, false);
    },

    render: function() {
        var props = this.props;
        var self = this;

        var minDate = props.min;
        if (minDate) {
            var minY = minDate.getUTCFullYear();
            var minM = minDate.getUTCMonth();
            var minD = minDate.getUTCDate();
        };

        var maxDate = props.max;
        if (maxDate) {
            var maxY = maxDate.getUTCFullYear();
            var maxM = maxDate.getUTCMonth();
            var maxD = maxDate.getUTCDate();
        };

        if (props.value) {
            var valueDate = new Date(props.value);
            var valueY = valueDate.getUTCFullYear();
            var valueM = valueDate.getUTCMonth();
            var valueD = valueDate.getUTCDate();
        };

        var todayDate = new Date();
        var todayY = todayDate.getFullYear();
        var todayM = todayDate.getMonth();
        var todayD = todayDate.getDate();

        var pointDate = props.point ? new Date(props.point) : getTodayUTCDate();
        var Y = pointDate.getUTCFullYear();
        var M = pointDate.getUTCMonth();
        var D = pointDate.getUTCDate();

        var date = new Date(Date.UTC(Y, M, 1));
        var day = date.getUTCDay();

        date.setUTCDate(day === 1 ? -6 : day ? 2 - day : -5);


        var itemMonthDay = (cell, index) => {
            var xY = date.getUTCFullYear();
            var xM = date.getUTCMonth();
            var xD = date.getUTCDate();

            date.setUTCDate(date.getUTCDate() + 1);

            var isDisabled = (false
                || minDate && (xY < minY || (xY === minY && (xM < minM || (xM === minM && xD < minD))))
                || maxDate && (xY > maxY || (xY === maxY && (xM > maxM || (xM === maxM && xD > maxD))))
            );

            var mixDay = [
                , valueY === xY && valueM === xM && valueD === xD ? '-selected' : ''
                , todayY === xY && todayM === xM && todayD === xD ? '-today' : ''
                , isDisabled ? '-disabled' : ''
                , xY === Y && xM === M ? '-m-current' : '-m-other'
                , ''
            ];

            return [
                {
                    onClick: isDisabled ? null : (e) => {this._click(xY, xM, xD)},
                    class: b('+td.monthDay', mixDay),
                    key: index,
                }
                , ['text', ('' + xD)]
            ];
        };

        return [b('+table.monthTable', props.mix)
            , ['+thead'
                , ['+tr'
                    , jr.map(WEEK_DAYS, (weekDay, i) => {
                        return [{class: b('+td.monthHeader'), key: i}
                            , ['text', weekDay]
                        ]
                    })
                ]
            ]
            , ['+tbody'
                , jr.map({length: 6}, (row, index) => {
                    return [{class: '+tr', key: index}
                        , jr.map({length: 7}, itemMonthDay)
                    ];
                })
            ]
        ];
    },

    /*
    componentWillReceiveProps: function(nextProps) {},
    componentWillUnmount: function() {},
    componentDidUpdate: function() {},
    componentDidMount: function() {},
    */

    _click: function(xY, xM, xD) {
        var fn = this.props.onSelect;
        if (fn) {
            fn(xY, xM, xD);
        };
    },

});
