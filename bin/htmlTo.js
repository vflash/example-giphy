var regxMaster = require('regx-master');
var crypto = require('crypto');
var makeDir = require('make-dir');
var fs   = require('fs');

var LIMIT_DATAURL = 6500;
var PATH_BUILD = './out/build';
var PATH_REPO = '.';


var RGX_STATIC = /"\/-static\/xxx(\/[^"\r\n]+)/g;
var buff = '';


function stderr(x) {process.stderr.write('' + x + '\n')};
function stdout(x) { process.stdout.write(x)};

process.stdin.setEncoding('utf8');
process.stdin.on('readable', (e) => {
    var chunk = process.stdin.read();
    if (chunk !== null) {
        buff += chunk;
    };
});
process.stdin.on('end', () => {
    stdout(replaceTo(buff));
});


function replaceTo(data) {
    data = data.replace(RGX_STATIC, function(s, src) {
        try {
            var content = fs.readFileSync(PATH_REPO + '/static' + src);
        } catch(e) {
            return s;
        };

        var shasum = crypto.createHash('md5')
            .update(content)
            .digest('hex')
            .substr(0, 12)
            ;

        return '"/-static/' + shasum + src;
    });

    return data;
};

