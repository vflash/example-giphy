'use strict';

// var dragLayer = new DragLayer(document);

export default function getDragLayer(d) {
    return d._dragLayer || (d._dragLayer = new DragLayer(d));
};

function DragLayer(d, cursor) {
    this.document = d;
    this.cursor = cursor || null;

    var n = this.document.createElement('div');
    n.style.cssText = ''
        + 'display:none; overflow: hidden;background-color:transparent;'
        + 'position:fixed;left:0px;top:0px;bottom:0px;right:0px;'
        + 'z-index:9999999999;'
    ;

    this.document.body.appendChild(n);
    this.layer = n;
};

DragLayer.prototype = {
    cursor: null,
    layer: null,
    isShow: false,

    show: function (cursor) {
        var s = this.layer.style;

        var cursor = cursor || this.cursor;

        s.cursor = typeof cursor == 'string' ? cursor : 'default';
        s.display = 'block';
        this.isShow = true;
    },

    hide: function () {
        var s = this.layer.style;
        s.display = 'none';
        //this.document.body.removeChild(n);
        this.isShow = false;
    },
};


function create(self) {
    if (self.layer) {
        return;
    };

    var n = self.document.createElement('div');
    n.style.cssText = ''
        + 'display:none; overflow: hidden;background-color:transparent;'
        + 'position:fixed;left:0px;top:0px;bottom:0px;right:0px;'
        + 'z-index:9999999999;'
    ;

    self.document.body.appendChild(n);
    self.layer = n;
};

function remove(self) {
    var layer = self.layer;
    if (layer) {
        layer.parentNode.removeChild(layer);
    };
};

