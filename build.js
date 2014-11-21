
var FILE_ENCODING = 'utf-8',
    SRC_DIR = 'dev/src',
    DIST_DIR = 'dist',
    DIST_NAME = 'crossroads.js',
    DIST_MIN_NAME = 'crossroads.min.js',
    DIST_PATH = DIST_DIR +'/'+ DIST_NAME,
    DIST_MIN_PATH = DIST_DIR +'/'+ DIST_MIN_NAME;


var _fs = require('fs'),
    _path = require('path'),
    _pkg = JSON.parse(readFile('package.json')),
    _now = new Date(),
    _replacements = {
        NAME : _pkg.name,
        AUTHOR : _pkg.author.name,
        VERSION_NUMBER : _pkg.version,
        HOMEPAGE : _pkg.homepage,
        LICENSE : _pkg.licenses[0].type,
        BUILD_DATE : _now.getUTCFullYear() +'/'+ pad(_now.getUTCMonth() + 1) +'/'+ pad(_now.getUTCDate()) +' '+ pad(_now.getUTCHours()) +':'+ pad(_now.getUTCMinutes())
    };


function purgeDeploy(){
    [DIST_PATH, DIST_MIN_PATH].forEach(function(filePath){
        if( _fs.existsSync(filePath) ){
            _fs.unlinkSync(filePath);
        }
    });
    console.log(' purged deploy.');
}


function build(){
    var wrapper = readFile(SRC_DIR + '/wrapper.js'),
        deploy = tmpl(wrapper, {
            // TODO: refactor this!! Use build tool like gulp or gobble
            // Perhaps use node RequireJS and dist via WebPack to simplify file dependencies ;)
            LICENSE       : readFile(SRC_DIR + '/license.txt'),
            INTRO_JS      : readFile(SRC_DIR + '/intro.js'),
            CROSSROADS_JS : readFile(SRC_DIR + '/crossroads.js'),
            ROUTE_JS      : readFile(SRC_DIR + '/route.js'),
            LEXER_JS      : readFile(SRC_DIR + '/util/pattern_lexer.js'),

            SIGNAL_HELPER   : readFile(SRC_DIR + '/signal/signal_helper.js'),
            SIGNAL_AWARE    : readFile(SRC_DIR + '/signal/signal_aware.js'),

            REQUEST_PARSER  : readFile(SRC_DIR + '/router/request_parser.js'),
            ROUTE_COMPOSER  : readFile(SRC_DIR + '/router/route_composer.js'),
            ROUTE_MATCHER   : readFile(SRC_DIR + '/router/route_matcher.js'),
            ROUTER_PIPER    : readFile(SRC_DIR + '/router/router_piper.js'),
            ROUTER_SIGNALS  : readFile(SRC_DIR + '/router/router_signals.js'),

            ROUTE_REQUEST_PARSER    : readFile(SRC_DIR + '/router/route_request_parser.js'),
            ROUTE_VALIDATION        : readFile(SRC_DIR + '/router/route_validation.js'),

            ROUTE_ACTIVATOR         : readFile(SRC_DIR + '/router/signal/route_activator.js'),
            ROUTE_SWITCHER          : readFile(SRC_DIR + '/router/signal/route_switcher.js'),
            ROUTE_SIGNAL_HELPER     : readFile(SRC_DIR + '/router/signal/route_signal_helper.js'),
            ROUTE_SIGNALS           : readFile(SRC_DIR + '/router/signal/route_signals.js'),

        }, /\/\/::(\w+)::\/\//g);

    _fs.writeFileSync(DIST_PATH, tmpl(deploy, _replacements), FILE_ENCODING);
    console.log(' '+ DIST_PATH +' built.');
}


function readFile(filePath) {
    return _fs.readFileSync(filePath, FILE_ENCODING);
}


function tmpl(template, data, regexp){
    function replaceFn(match, prop){
        return (prop in data)? data[prop] : '';
    }
    return template.replace(regexp || /::(\w+)::/g, replaceFn);
}


function uglify(srcPath) {
    var
      uglyfyJS = require('uglify-js'),
      jsp = uglyfyJS.parser,
      pro = uglyfyJS.uglify,
      ast = jsp.parse( _fs.readFileSync(srcPath, FILE_ENCODING) );

    ast = pro.ast_mangle(ast);
    ast = pro.ast_squeeze(ast);

    return pro.gen_code(ast);
}


function minify(){
    var license = tmpl( readFile(SRC_DIR +'/license.txt'), _replacements );
    // we add a leading/trailing ";" to avoid concat issues (#73)
    _fs.writeFileSync(DIST_MIN_PATH, license +';'+ uglify(DIST_PATH) +';', FILE_ENCODING);
    console.log(' '+ DIST_MIN_PATH +' built.');
}


function pad(val){
    val = String(val);
    if (val.length < 2) {
        return '0'+ val;
    } else {
        return val;
    }
}


// --- run ---
purgeDeploy();
build();
minify();

