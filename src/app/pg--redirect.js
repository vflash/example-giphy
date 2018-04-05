// тут формируются переопределения путей

import view from 'src/models/view/view.js';


var PATH_START_LOGIN = '/login';
var PATH_START_APP = '/';
var redi = false;

function getRedirect(url) {
    var q = url.replace(/^[^\?]+/, '').match(/(?:\?|&)redirect=([^&]+)/);
    return q ? decodeURIComponent(q[1]) : '';
};

view.on('location', () => {redi = false});

function onLocation(fn) {
    view.on('location', q => redi || fn(q));
};



onLocation(function(q) {
    if (q.match('/--background-app')) {
        q.path = '/';
        return;
    };
});

