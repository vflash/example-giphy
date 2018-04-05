//import modelSession from 'src/models/modelSession.js';
import view  from 'src/models/view/view-init.js';

import 'src/blocks/ViewApp/ViewApp.js';
import {cmps} from 'src/blocks/cmps.js';

var isInitSession = false;
var isInitDOM = false;
var isInit = false;

view.classViewApp = cmps.ViewApp;
view.state.viewType = 'app';

initSession(function() {
    isInitSession = true;
    go();
});

domReady(window.appInitDOM = function() {
    isInitDOM = true;
    go();
});

function go() {
    if (isInit || !isInitSession || !isInitDOM || window._appNoSupport) {
        return;
    };

    isInit = true;
    view.init();
};


function domReady(fn) {
    document.addEventListener("DOMContentLoaded", function() {
        fn();
    });
};

function initSession(fn) {
    //modelSession.init(fn);
    fn();
};

