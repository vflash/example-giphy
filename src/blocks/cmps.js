import '../fonts/AvenirNextCyr/font.css';
import './reset.sass';

import exComponentUpdate from 'ex-component-update';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import React from 'react';
import view from 'src/models/view/view.js';
import i18n from 'src/tools/i18n.js';
import bem from 'bem-name';
import jr from 'jso-to-react';


var getDOM = ReactDOM.findDOMNode;
var t = i18n.get;

export {exComponentUpdate, PropTypes, ReactDOM, React, getDOM, cmps, view, i18n, bem, jr, t};
export default cmps;

function getDOM(x) {
    return ReactDOM.findDOMNode(x);
};

/*
cmps('PageAbout', {
  displayName: 'SettingsNotifications',

  exComponentUpdate(props) {
    return [1,2,3];
  },

  defaultProps: {
    mix: '',
  },

  init() {
    this._value = 555;
  },

  render: function() {
    return [{
      class: cmps.EddsdJJdsfsd,
    }]
  },
});
*/


cmps('children', function() {
    var props = this.props;
    return [props.mix || ''
        , jr.children(props.self)
    ];
});

/**
 * Фабрика компонентов cmps (от слова components), через которую вызываются/создаются все компоненты. Фабрика cmps позволяет:
    - не делать bind в событиях, конструкторах и т.д., поскольку 'create-react-class' делает bind на все методы автоматически
    - не писать в компоненте конструктор
    - подсветить в коде все подключаемые компоненты, через поиск по строке 'cmps.'

 * Есть несколько вариантов использования:
 * 1 случай
 * @param {string} displayName - Название компонента
 * @param {object} A1 - Объект компонента

 * 2 случай
 * @param {string} displayName - Название компонента
 * @param {function} A1 - Функция из которой создастся объект, и к нему добавится метод render

 * 3 случай
 * @param {string} displayName - Название компонента
 * @param {boolean} A1 - Параметр для проверки на ShouldComponentUpdate:
    - false сравниваются только пропсы
    - true сравниваются в exComponentUpdate объекты ф-ции по типам, а простые значения на идентичность. Это нужно когда компоненту передается много ф-ций забинденых, чтобы изменение слушателей не влияло на обработчики событий во время рендера)
 * @param {function} A2 - Функция рендера
 */
function cmps(displayName, A1, A2) {
    var oxclass = A2 || A1;

    if (typeof oxclass === 'function') {
        let strict = !!A1;
        oxclass = (A2 && A1
            ? {render: oxclass, init: function() {exComponentUpdate(this, strict)}}
            : {render: oxclass}
        );
    };

    var componentWillUnmount = oxclass.componentWillUnmount;
    var defaultProps = oxclass.defaultProps;
    var context = oxclass.context;
    var init = oxclass.init;

    delete oxclass.defaultProps;
    delete oxclass.init;

    if (defaultProps) {
        oxclass.getDefaultProps = function() {
            return defaultProps;
        };
    };

    oxclass.componentWillUnmount = function() {
        this.isUnmount = true;

        if (componentWillUnmount) {
            componentWillUnmount.call(this);
        };
    };

    oxclass.getInitialState = function() {
        this.isUnmount = false;

        this.getContext = function(name, value) {
            var context = this.context;
            if (context) {
                var _context = context._context;
                if (_context) {
                    return _context(name, value);
                };
            };
        };

        this.def = function(name, prop) {
            var value = this[name];
            return value == null ? prop : value;
        };

        return (init && init.call(this)) || {};
    };

    if (context) {
        oxclass.childContextTypes = {_context: PropTypes.func};

        oxclass.getChildContext = function() {
            var self = this;
            return {
                _context: function(name, value) {
                    if (context && (name in context)) {
                        return context[name].call(self, value);
                    };

                    return self.getContext(name, value);
                },
            };
        };
    };

    oxclass.update = oxclass.update || function(prm, func) { // работает также как сетстейт + проверка изменилось ли значение
        var isFunc = typeof func === 'function';

        if (prm != null) {
            var hasChange = false;

            for(var name in prm) {
                var value = prm[name];
                if (this[name] !== value) {
                    this[name] = value;
                    hasChange = true;
                };
            };

            if (!hasChange) {
                isFunc && func();
                return false;
            };
        };


        if (!this.isUnmount) {
            this.setState({}, isFunc ? func : null);
        };

        return true;
    };


    oxclass.contextTypes = oxclass.contextTypes || {
        _context: PropTypes.func,
    };

    oxclass.g = function(model) {
        return this.getContext('g', model) || model;
    };

    oxclass.displayName = displayName;
    oxclass.render = jr.r(oxclass.render); // подмена рендера, который преобразует json

    return cmps[displayName] = createReactClass(oxclass); // добавление в общий списко компонентов, чтобы не было пересечений имен
    // также все компоненты хранятся в одной папке
};


