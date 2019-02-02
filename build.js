var browserify = require('browserify');
var fs = require('mz/fs');
var envify = require('envify/custom');

var env = process.argv.slice(2) || 'development';

function makeBundler(input, output) {
    var b = browserify({
        cache: {},
        packageCache: {},
        plugin: ['watchify'],
        standalone: 'gsonicApp'
    });
    b.on('update', bundle);
    b.on('log', console.log);

    b.add(input);

    b.transform(envify({
        NODE_ENV: env
    }));

    if (env === 'production') {
        b.transform('babelify', {presets: ['es2015']});
    }
    b.transform('pugvdomify');
    b.transform('browserify-postcss', {plugin: ['postcss-cssnext']});

    function bundle() {
        return b.bundle()
            .on('error', evt => console.error(evt.stack))
            .on('end', ()=> process.exit())
            .pipe(fs.createWriteStream(output));
    }

    return bundle;
}

return makeBundler('./src/scripts/app.js', "./dist/bundle.js")()
