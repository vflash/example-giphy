var imageminSvgo = require('imagemin-svgo');
var regxMaster = require('regx-master');
var imagemin = require('imagemin');
var crypto = require('crypto');
var makeDir = require('make-dir');
var PATH = require('path');
var pify = require('pify');
var mime = require('mime');
var fs   = require('fs');
var fsP = pify(fs);


var LIMIT_DATAURL = 6500;
var PATH_BUILD = './out/build';
var PATH_REPO = '.';

var rgxCSS = regxMaster(/url\(([:str2:]|[^)]+)\)|[:css:]/g, {
    str2: true,
    str1: true,
    css: true,
});


var CONTENTS = {};
var buff = '';
var str = process.argv[2];
var cwd = process.cwd() || '';


function stdout(x) {
    process.stdout.write(x)
};

function stderr(x) {
    process.stderr.write('' + x + '\n');
};


process.stdin.setEncoding('utf8');

process.stdin.on('readable', (e) => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        buff += chunk;
    };
});

process.stdin.on('end', () => {
    optimizeLoad(buff).then(function() {
        stdout(replaceTo(buff));
    });
});


function replaceTo(data) {
    data = data.replace(rgxCSS, function(s, url) {
        if (!url) {
            return s;
        };

        if (url[0] == '"') {
            try {url = JSON.parse(url)} catch(e) {
                return s
            };
        };

        if (!/^\/./.test(url)) {
            return s;
        };

        return url2url(url);
    });

    return data;
};

function optimizeLoad(data) {
    var paths = [];

    data.replace(rgxCSS, function(s, url) {
        if (!url) {
            return s;
        };

        if (url[0] == '"') {
            try {url = JSON.parse(url)} catch(e) {
                return s
            };
        };

        if (!/^\/./.test(url)) {
            return s;
        };

        var src = url.replace(/\?.*$/, '');

        switch(src.match(/[^\.]+$/, '')[0]) {
            case 'svg':
                paths.push(src);
                break;

        };

        return s;
    });


    var list = paths.map(function(path) {
        return {
            data: fs.readFileSync(PATH_REPO + path),
            path: path,
        };
    });

    var op = {
        plugins: [
            imageminSvgo()
        ]
    };

    return Promise.all(
        list.map((x) => imagemin.buffer(x.data, op))

    ).then(function (files) {
        files.forEach((optimize, i) => {
            CONTENTS[list[i].path] = optimize;
        });

        return true;
    });
};

function url2url(src) {
    var isInc = /\?inc$/.test(src);
    src = src.replace(/\?.*$/, '');

    var mimetype = mime.getType(src);
    var content = CONTENTS[src] || fs.readFileSync(PATH_REPO + src);

    if (!isInc && (content.length <= LIMIT_DATAURL)) {
        if (false && mimetype == 'image/svg+xml') { // bug ie11
            var r = encodeOptimizedSVGDataUri(content.toString());
        } else {
            var r = JSON.stringify('data:' + (mimetype ? mimetype + ';' : '') + 'base64,' + content.toString('base64'));
            return 'url(' + r + ')';
        };

        return 'url("' + r + '")';
    };

    var type = src.match(/[^\.]+$/, '')[0];
    var shasum = crypto.createHash('md5')
        .update(content)
        .digest('hex')
        .substr(0, 12)
        ;

    var path = '/static/inc/-' + shasum + '.' + type;

    //stderr('move to inc: ' + src);

    saveFile(content, PATH_BUILD + path);

    return 'url("' + path + '")';
};

function saveFile(data, path) {
    return makeDir(PATH.dirname(path))
        .then(() => fsP.writeFile(path, data))
        ;
};

function encodeOptimizedSVGDataUri(svgString) {
    var uriPayload = encodeURIComponent(svgString.replace(/\n+/g, '')) // remove newlines
        .replace(/%22/g, '\'') // replace quotes with apostrophes (may break certain SVGs)
        .replace(/%20/g, ' ') // put spaces back in
        .replace(/%3D/g, '=') // ditto equals signs
        .replace(/%3A/g, ':') // ditto colons
        .replace(/%2F/g, '/') // ditto slashes

        .replace(/%3E/g, '>') // only css
        .replace(/%3C/g, '<') // only css
        ;

    return 'data:image/svg+xml,' + uriPayload;
};


