var jsSHA = require('jssha');
var xml2js = require('xml2js');
var MusicLibraryInterface = require('./music-library-interface');

// 'server/xml.server.php?action={{action}}&auth={{passphrase}}&timestamp={{timestamp}}&version=350001&user={{user}}'
class Song {
    constructor(opts) {
        this._id = opts._id;
        this.title = opts.title;
        this.url = opts.url;
        this.type = opts.type;
    }
}

class AmpacheInterface extends MusicLibraryInterface {
    constructor(opts) {
        super(Object.assign({
            apiPath: 'server/xml.server.php',
            transforms: {
                request: function(response) {
                    return response.text()
                        .then(xml => {
                            return new Promise(function(resolve, reject){
                                    var parser = new (xml2js.Parser);
                                    parser.parseString(xml, (err, result) => {
                                        if (err) reject(err)
                                        resolve(result);
                                    });
                                })
                        })
                        .then(json => {
                            return json.root.error ? Promise.reject(json.root.error) : json.root;
                        })
                },
                auth: function(json){
                    return json.auth[0] || Promise.reject(json);
                },
                ping: function(json) {
                    if (json.version[0]) {
                        return json;
                    }
                    return Promise.reject(json);
                },
                songs: function(data) {
                    var songs = data.song.map(obj => new Song({
                        _id: obj.$.id,
                        title: obj.title[0],
                        url: obj.url[0],
                        type: 'audio/mpeg'
                    }));
                    songs.numSongsInLibrary = data.total_count[0];
                    return data.song ? songs : Promise.reject("No song data");
                }
            },
            params: {
                version: '350001'
            }
        }, opts))
    }

    auth(user, password) {
        var timestamp = Math.floor(Date.now() / 1000);

        let shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(password);
        var key = shaObj.getHash("HEX");

        shaObj = new jsSHA("SHA-256", "TEXT");
        shaObj.update(timestamp + key);

        var auth = shaObj.getHash("HEX");

        return super.auth({timestamp, user, auth, action: 'handshake'});
    }

    ping() {
        return super.ping({
            auth: this.token,
            action: 'ping'
        })
    }

    songs(args) {
        return super.songs(Object.assign({
            auth: this.token,
            action: 'songs',
            limit: args.limit || '50',
            offset: args.offset || '0'
        }, args || {}));
    }
}

module.exports = AmpacheInterface;
