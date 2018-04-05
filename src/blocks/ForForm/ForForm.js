import * as _cmps from '../cmps.js'; const {exComponentUpdate, getDOM, cmps, view, bem, jr, t} = _cmps;
import modelDevice from 'src/models/modelDevice.js';
import stringMask from 'src/tools/stringMask.js';

import './ForForm.sass';
var isArray = Array.isArray;
var undefined;
var b = bem('ForForm');


export {createValueMap};
export {scrollToError};
export {defaultReset};
export {getValue};
export {def};
export {str}; // значение приводит к строке.  NULL и UNDEFINED вернет ''
export {rub}; // красивое отображение "10 руб. 45 коп."


// -----------------------------------------
// -----------------------------------------

cmps('ForForm_BoxPage', function() {
    var props = this.props;
    return [b('BoxPage', props.mix, modelDevice.mix)
        , jr.children(this)
    ];
});

cmps('ForForm_Box', function() {
    return [b('Box', this.props.mix)
        , jr.children(this)
    ];
});

cmps('ForForm_H1', function() {
    return [b('H1', this.props.mix)
        , jr.children(this)
    ];
});

cmps('ForForm_H2', function() {
    return [b('H2', this.props.mix, {indent: !!this.props.indent})
        , jr.children(this)
    ];
});

cmps('ForForm_H3', function() {
    return [b('H3', this.props.mix, {indent: !!this.props.indent})
        , jr.children(this)
    ];
});

cmps('ForForm_Block', function() {
    var props = this.props;

    return [b('Block', props.mix, {level: props.level || 2})
        , jr.children(this)
    ];
});

cmps('ForForm_Sub', function() {
    var props = this.props;

    return [b('Sub', props.mix, (props.mark ? '-mark' : ''), (props.error ? '-error' : ''))
        , [b('SubBody')
            , jr.children(this)
        ]
    ];
});

cmps('ForForm_Row', function() {
    var props = this.props;

    var mixIndent = {indent: props.indent || 'medium'};
    var children = props.children;
    var label = props.label;
    var cell = [], cells = [cell];

    if (isArray(children)) {
        children.forEach((x) => {
            if (x === '<--->') {
                cells.push(cell = []);
            } else {
                cell.push(x);
            };
        });
    };

    if (cells.length === 1) {
        return [b('Row', props.mix, mixIndent)
            , (label
                ? [b('RowLabel'), (label)]
                : null
            )
            , jr.children(this)
        ];
    };


    var mixLargeIndent = (/^(true|transparent)$/.test(props.vr)
        ? '-large'
        : ''
    );


    var mixVertical = props.vertical ? '-orie-vertical' : '';
    var mixSize = {
        size: cells.length,
        one: cells.length === 1 || 'no',
    };

    var mixCenterLine = props.centerLine ? '-centerLine' : '';

    var cels = jr.map(cells, (cell, index) => {
        return [
            {
                class: b('Cell', mixSize, mixVertical, mixLargeIndent, mixCenterLine),
                key: index,
            }
            , [1, cell]
        ]
    });

    return [b('Row', props.mix, mixSize, mixIndent)
        , (label
            ? [b('RowLabel'), (label)]
            : null
        )
        , [b('RowBox', mixVertical, props.vr === true ? '-vr' : '')
            , (cels)
        ]
    ];
});


cmps('ForForm_Right', function() {
    var props = this.props;

    var mixIndent = {indent: props.indent || 'medium'};
    var mixAlign = {align: props.align || null}; // center|baseline
    var mixNowrap = {nowrap: !!props.nowrap};
    var children = props.children;
    var label = props.label;
    var cell = [], cells = [cell];


    if (isArray(children)) {
        children.forEach((x) => {
            if (x === '<--->') {
                cells.push(cell = []);
            } else {
                cell.push(x);
            };
        });

    } else {
        cell.push(children);
    };


    while(cells.length < 2) {
        cells.unshift(null);
    };

    return [b('Right', props.mix, mixIndent, mixAlign)
        , jr.map(cells, (cell, index) => {
            var _mixNowrap = index > 0 ? mixNowrap : null;
            return [
                {
                    class: b('RightCell', _mixNowrap),
                    key: index,
                }
                , [1, cell]
            ]
        })
    ];
});

cmps('ForForm_Info', function() {
    return [b('Info', this.props.mix)
        , [b('InfoBox')
            , jr.children(this)
        ]
    ];
});

cmps('ForForm_ErrorText', function() {
    return [b('ErrorText')
        , jr.children(this)
    ];
});

cmps('ForForm_Error', function() {
    return [b('Error')
        , [b('ErrorBox')
            , jr.children(this)
        ]
    ];
});

cmps('ForForm_Hr', function() {
    var isHasChildren = !!this.props.children;
    return [b('Hr', this.props.mix, isHasChildren ? '-children' : '')
        , (isHasChildren
            ? [b('HrBox')
                , jr.children(this)
            ]
            : null
        )
    ];
});

cmps('ForForm_TableRows', function() {
    var props = this.props;
    var header = props.header;
    var rows = props.rows || [];

    return [b('TableRows', this.props.mix)
        , jr.map(rows.filter(x => !!x), (row, index) => {
            return [{class: b('RowBox', b('TableRowsRow')), key: index}
                , jr.map(row, (cell, index) => {
                    return [
                        {
                            class: b('Cell', '-large'),
                            key: index,
                        }
                        , (cell)
                    ]
                })
            ];
        })
    ];
});

cmps('ForForm_Table', function() {
    var props = this.props;
    var header = props.header;
    var rows = props.rows;

    return [b('Table')
        , (header
            ? [
                {
                    class: props.level === 3 ? cmps.ForForm_H3 : cmps.ForForm_H2,
                    mix: b('TableHeader'),
                }
                , (header)
            ]
            : null
        )
        , ['+table'
            , ['+tbody'
                , jr.map(rows, (row, index) => {
                    return (row
                        ? [{tag: 'tr', key: index}
                            , jr.map(row, (cell, index) => {
                                return [{tag: 'td', key: index}, cell];
                            })
                        ]
                        : null
                    );
                })
                , jr.children(this)
            ]
        ]
    ];
});

cmps('ForForm_TableLR', function() {
    var props = this.props;
    var rows = props.rows || [];
    var mixNowrap = props.nowrap ? {nowrap: true} : null;
    var mixTextAlign = props.textAlign ? {textAlign: props.textAlign} : null;

    return [b('TableLR', {indent: props.indent || 'small'}, props.mix)
        , jr.map(rows.filter(x => x != null), (item, index) => {
            return [{class: b('Right', {indent: 'mini', align: 'baseline'}), key: index}
                , [b('RightCell'), item[0]]
                , [b('RightCell', mixNowrap, mixTextAlign), item[1]]
            ];
        })
    ];
});


cmps('ForForm_MenuMobile', function() {
    var props = this.props;
    var mixHide = '-hide' + (props.show ? '-no' : '');

    return [
        {
            class: b('MenuMobile', props.mix, mixHide),
            onMouseDown: (e) => {
                if (e.currentTarget === e.target) {
                    props.onHide();
                };
            },
        }
        , [b('MenuMobileBox', mixHide)
            , jr.children(this)
        ]
    ];
});



// --------------------------------------------------------------------
// -----------------------------------------------------------------------
// --------------------------------------------------------------------

function createValueMap(map) {
    var map = map || {};

    //this._errMap = createErr(null);
    //var {cmpErr, isErr} = this._errMap;

    function setGlobalError(name, getGlobalError) {
        if (!getGlobalError) {
            return;
        };

        if (typeof getGlobalError !== 'function') {
            var context = getGlobalError;
            var get = function() {
                var details = context._verificationDetails || false;
                return details[name];
            };
        } else {
            var get = function() {
                return getGlobalError(getVerificationDetails);
            };
        };

        getErr(name).getGlobalError = get;
    };

    function getVerificationDetails(obj) {
        return obj ? obj._verificationDetails || false : false;
    };

    function getTextError(name) {
        var error = map[name] ? map[name].error : null;
        if (!error) {
            return '';
        };

        if (Array.isArray(error)) {
            error = error[0];
            if (!error) {
                return '';
            };
        };

        return error ? '' + error : '';
    };

    function getErr(name) {
        var error = null;
        var x = map[name];

        return x || (map[name] = {
            isContextObject: true,
            getGlobalError: null,
            set error(x) {error = x},
            get error() {
                if (error == null && this.getGlobalError) {
                    return this.getGlobalError();
                };

                return error;
            },
        });
    };

    return {
        setGlobalError: function(name, getGlobalError) {
            setGlobalError(name, getGlobalError);
        },

        getTextError: function(name) {
            return getTextError(name);
        },

        cmpErr: function(name) {
            var error = getTextError(name);
            if (!error) {
                return null;
            };

            return [
                {
                    class: cmps.ForForm_Error,
                }
                , '' + error
            ];
        },

        getErr: function(name, getGlobalError) {
            setGlobalError(name, getGlobalError);
            return map[name] || getErr(name);
        },

        isErr: function(name) {
            return map[name] ? !!map[name].error : false;
        },

        clear: function() {
            map = {};
        },

        map: map,

        get: function(refs, name, isWithContext, value, type) {
            if (refs) {
                value = getValue(refs[name]);
            };

            switch(type) {
                case 'integer':
                    value = Math.floor(+value);
                    value = value > 0 ? value : 0;
                    break;

                case '+number':
                    value = +value;
                    value = value > 0 ? value : 0;
                    break;

                case 'number':
                    value = +value;
                    value = value === value ? value : 0;
                    break;
            };

            if (!isWithContext) {
                return value;
            };

            var x = map[name] || getErr(name);
            x.value = value;

            return x;
        },
    };
};

function defaultReset(self) {
    if (!self) {
        return;
    };

    var refs = self.refs;

    for (var ref in refs) {
        var cmp = refs[ref];

        if (cmp && cmp.reset) {
            cmp.reset();
        };
    };

    if (self._initValues) {
        self._initValues();
    };

    self.update();
};

function getValue(node, def = '') {
    if (node) {
        var value = node.get();
        return typeof value === 'string' ? value.trim() : value;
    } else {
        return def;
    };
};


function def(value, def) {
    return value != null ? value : def;
};

function str(value, def) {
    return value != null ? '' + value : (def != null ? '' + def : '');
};

function rub(value, def = '', isCompact = false) {
    if (value == null) {
        return def;
    };

    var str = (+value || 0).toFixed(2).replace(/\.00$/, '');
    var m = str.split('.')

    m[0] = stringMask('RUBLES', m[0]);

    if (!isCompact) {
        var res = (m.length > 1
            ? t("{rub} руб. {penny} коп.", {rub: m[0], penny: m[1]})
            : t("{rub} руб.", {rub: m[0]})
        );

    } else {
        var res = (m.length > 1
            ? t("{rub},{penny}", {rub: m[0], penny: m[1]})
            : t("{rub}", {rub: m[0]})
        );
    };

    return res.replace(/\s/g, '\u00A0');
};


function scrollToError(self) {
    var win = self.getContext('win');
    setTimeout(go, 150);

    async function go() {
        var n = getDOM(self).querySelector('.x-inp-error');

        if (!n) {
            return;
        };

        var rc = n.getBoundingClientRect();
        var y = win.scrollY + rc.top - 140;

        var ok = await win.smoothScrollY(y);
        if (!ok || !win.isActive) {
            return;
        };

        var input = n.querySelector('input, select');
        if (input) {
            input.focus();
        } else {
            if (/^(a|button|input|select)$/i.test(n.tagName)) {
                n.focus();
            };
        };
    };

    //smoothScrollY
};

