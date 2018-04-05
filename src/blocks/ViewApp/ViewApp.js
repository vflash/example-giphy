import * as _cmps from '../cmps.js'; const {exComponentUpdate, PropTypes, React, cmps, bem, jr, t} = _cmps;
import view from 'src/models/view/view.js';

import '../LayoutDefault/LayoutDefault.js';
import '../LayoutPopup/LayoutPopup.js';
import '../ViewDialog/ViewDialog.js';
import '../Viewport/Viewport.js';

import './ViewApp.sass';
var b = bem('ViewApp');


function getPageKey(page) {
    return '';
};


cmps('ViewApp', {
    exComponentUpdate: function() {
        return [];
    },

    defaultProps: {
    },

    context: {
        rootFloatBoxInputNode() {
            return this.refs['floatBoxInput'];
        },
        rootFloatBoxNode() {
            return this.refs['floatBox'];
        },
    },

    init: function () {
        // exComponentUpdate(this, false);
    },

    render: function () {
        var self = this;

        // -------------
        var viewState = view.state;
        var pages = this._pages();


        function viewport(zpage, index) {
            var page = zpage ? zpage.page : null;

            var pageContent = page && page.content;
            var layoutType = pageContent ? pageContent.layoutType : null;
            var layout = null;

            switch(layoutType) {
                case 'popup':
                    layout = cmps.LayoutPopup;
                    break;

                default:
                    if (typeof layoutType === 'function') {
                        layout = layoutType;
                        break;
                    };

                    if (index > 0) {
                        layout = cmps.LayoutPopup;
                        break;
                    };

                    layout = cmps.LayoutDefault;
                    break;
            };

            // var key = page && (page.content || {}).key || null;
            // if (!key) {
            //     key = page ? page.NUMBER_PAGE : null;
            // };

            return ({
                class: cmps.Viewport,
                isActive: zpage.isActive,
                isPopup: index > 0,
                layout: layout,
                page: zpage ? zpage.page : null,

                mix: index > 0 ? b('pagePopup') :  b('pageMain'),
                key: 'n' + index, // + (key ? '-' + key : ''),
                ref: 'n' + index,
            });
        };

        return [
            {
                onClick: this._onClick,
                class: b(''),
            }
            , [b('loading', viewState.isLoading ? '-show' : '')
                , ['text', t("загрузка")]
            ]
            , ({
                class: cmps.ViewDialog,
                zIndex: 1,
                type: 'error',
            })

            , ({
                class: cmps.ViewDialog,
                zIndex: 0,
                type: 'common',
            })

            , ({
                class: b('floatBox'),
                ref: 'floatBox',
                key: 'floatBox',
            })
            , ({
                class: b('floatBox'),
                ref: 'floatBoxInput',
                key: 'floatBoxInput',
            })

            , viewport(pages[0], 0)

            , ({
                class: b('blind', pages.length > 1 ? '-show' : '-hide')
            })

            , (pages.length > 1
                ? jr.map(pages, function(zpage, index) {
                    if (index === 0) {
                        return null;
                    };

                    return viewport(zpage, index);
                })
                : null
            )

        ];
    },

    //componentWillUnmount: function() {},

    componentWillReceiveProps: function(nextProps) {
    },

    componentDidUpdate: function() {
    },

    componentDidMount: function() {
    },

    _pages: function() {
        var pages = view.state.pages;
        var list = [];

        list.push({
            isActive: false,
            zIndex: 0,
            page: pages[0] || null,
        });

        for(var i = 1, page; i < pages.length; i++) {
            if (page = pages[i]) {
                list.push({
                    isActive: false,
                    zIndex: i,
                    page: page,
                });
            };
        };

        list[list.length - 1].isActive = true;
        return list;
    },


    _onClick: function(event) {
        var e = event.nativeEvent || event;

        if (event.metaKey || event.ctrlKey || e.button || e.defaultPrevented || view.isGlobalError) {
            return;
        };

        var n = e.target;
        for(; n; n = n.parentNode) {
            if (n.nodeName === 'A') {
                break;
            };
        };

        if (!n) {
            return;
        };

        var href = n.getAttribute('href');
        if (href === '') {
            event.preventDefault();
        };

        if (!/^\/($|[^\/])/.test(href) || n.classList.contains('x-href-native')) {
            return;
        };

        event.preventDefault();

        if (view._hrefLoadingPage == href) { // зашита от частого нажатия ссылки
            var dt = +new Date() - view._timeLoadingPage;
            if (dt > 0 && dt < 5000) {
                return
            };
        };

        /*
        if (showRequirementsAccess('link', href)) {
            return;
        };
        */

        var context = (function(n) {
            for(; n && n.nodeType === 1; n = n.parentNode) {
                var context = n.getAttribute('data-context');
                if (!context || !(context = context.trim())) {
                    continue;
                };

                return context;
            };
        })(n);

        view.go(href, context ? {contextId: context} : null);
    },

});


