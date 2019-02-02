// var supplant = require('small-supplant');
// var path = require('path-browserify');
const defaults = require('defaults-es6');
const formatTime = require('./format-time');
// songs
// filter (Value is Alpha Match for returned results, may be more then one letter/number)
// add (ISO 8601 Date Format assumed filter method is newer then specified date, however [START]/[END] can be specified to receive only results added between two dates)
// update (ISO 8601 Date Format assumed filter method is newer then specified date, however [START]/[END] can be specified to receive only results updated between two dates)
// exact (Boolean, if true filter is exact rather then fuzzy)
function serialize(obj, prefix) {
    var str = [], prop;
    for(prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            var key = prefix ? prefix + "[" + prop + "]" : prop;
            var val = obj[prop];
            if (val != null) {
                str.push((typeof v === "object") ?
                    serialize(val, key) :
                    encodeURIComponent(key) + "=" + encodeURIComponent(val));    
            }
        }
    }
  return str.join("&");
    //@TODO switch to URLSearchParams when server is correctly handling / ignoring format param for getCoverArt /binary resources
    // return new URLSearchParams(obj).toString()
}

const mediaTypeAliases = {
    'audio/x-flac' : 'audio/flac'
};

class MusicLibraryInterface {
    static get featureSupport() {
        return {
            ALBUM_SORTBY_NAME: true,
            ALBUM_SORTBY_ADDED: true,
            ALBUM_SORTBY_RANDOM: true,
            ALBUM_SORT_DIRECTION: true
        }
    }

    static normalizeServer(server) {
        server = /^https?:\/\//g.exec(server) ? server : 'http://' + server;
        return server.charAt(server.length - 1) === '/' ? server : server + '/';
    }

    get Song() {
        var api = this;
        return class {
            constructor(opts={}) {
                this.id = opts.id;
                this.title = opts.title;
                this.artist = opts.artist;
                this.album = opts.album;
                this.year = opts.year;
                this.genre = opts.genre;
                this.size = opts.size;
                this.albumId = opts.albumId;
                this.coverArt = opts.coverArt;
                this.coverThumb = opts.coverThumb;
                this.track = opts.track;
                this.disc = opts.disc;
                this.albumArtist = opts.albumArtist;
                this.originalContentType = opts.originalContentType in mediaTypeAliases ? mediaTypeAliases[opts.originalContentType] : opts.originalContentType;
                this.duration = opts.duration;
            }

            serialize(){ 
                return Object.assign(JSON.parse(JSON.stringify(this)), { musicDataType: 'song'});
            }

            static deserialize(obj) {
                return new this(obj);
            }

            get contentType() {
                return api.getContentType(this)
            }

            get url() {
                return api.getStreamUrl(this);
            }

            get durationFormatted() {
                return formatTime(this.duration);
            }
        }
    }

    get Artist() {
        return class {
            constructor(opts={}) {
                this.id = opts.id;
                this.name = opts.name;
                this.bio = opts.bio;
                this.image = opts.image;
                this.thumb = opts.thumb;
                this.similarArtists = opts.similarArtists;
                this.lastFmUrl = opts.lastFmUrl;
                this.mbId = opts.mbId;
                this.thumb = opts.thumb;
                // this.month = opts.
                // this.day = opts.
                // this.releaseMbid = opts.
                // this.releaseGroupMbid = opts.
            }

            serialize(){ 
                return Object.assign(JSON.parse(JSON.stringify(this)), { musicDataType: 'artist'});
            }

            static deserialize(obj) {
                return new this(obj);
            }
        }
    }

    static get methodParamDefaults() {
        return {};
    }

    get Album() {
        return class {
            constructor(opts={}) {
                this.id = opts.id;
                this.title = opts.title;
                this.artist = opts.artist;
                this.trackTotal = opts.trackTotal;
                this.coverArt = opts.coverArt;
                this.coverThumb = opts.coverThumb;
                this.discTotal = opts.discTotal;
                this.year = opts.year;
                this.genre = opts.genre;
                this.artistId = opts.artistId;
                
                // this.month = opts.
                // this.day = opts.
                // this.releaseMbid = opts.
                // this.releaseGroupMbid = opts.
            }

            serialize(){ 
                return Object.assign(JSON.parse(JSON.stringify(this)), { musicDataType: 'album'});
            }

            static deserialize(obj) {
                return new this(obj);
            }
        }
    }

    deserialize(obj) {
        switch (obj.musicDataType) {
            case 'artist':
                return this.Artist.deserialize(obj);
            case 'album':
                return this.Album.deserialize(obj);
            case 'song':
                return this.Song.deserialize(obj);
            default:
                throw new Error(`Cannot deserialize object with unrecognized musicDataType of '${obj.musicDataType}'`)
        }
    }

    static get paramDefaults() {
        return {};
    }

    get paramDefaults() {
        return defaults({}, this.constructor.paramDefaults);
    }
    //TODO CHECK f: null working with local server

    static get optsDefaults() {
        return { preferredMediaType: 'original' };
    }

    constructor(opts) {
        Object.defineProperty(this, 'cache', { value: {
            songs: {},
            albums: {},
            artists: {}
        }});
        opts = defaults(opts, this.constructor.optsDefaults);
        this.server = this.constructor.normalizeServer(opts.server);
        this.preferredMediaType = opts.preferredMediaType;
    }

    getContentType(song) {
        return song.originalContentType;
    }    

    createServerUrl(methodPath, params) {
        return `${this.server}${this.constructor.apiPath}${methodPath}${params ? `?${serialize(this.validateParams(params, methodPath))}` : ''}`;
    }

    request(methodPath, params={}, headers={}, requestMethod='GET') {
        try {
            return requestMethod === 'GET' ? 
                fetch(`${this.createServerUrl(methodPath, params)}`, { headers }) : requestMethod === 'POST' ? 
                fetch(`${this.createServerUrl(methodPath)}`, { body: JSON.stringify(params), method: 'POST', headers }) : 
                Promise.reject(new Error('Unsupported HTTP request method'))
        } catch (err) {
            return Promise.reject(new Error(`Params failed validation while requesting ${methodPath}: ${err.stack}`));
        }
    }

    getAlbums() {}
    getArtist() {}
    makeNewArtist() {}
    makeNewSong() {}
    makeNewAlbum() {}
    getSong() {}
    auth() {}
    getRecentAlbums() {}
    getArtistAlbums() {}
    getAlbumSongs() {}
    getAlbum() {}
    getArtists() {}
    search() {}
    getStreamUrl() {}

    validateParams(opts={}, methodName=null) {
        return defaults(opts, (methodName && methodName in this.constructor.methodParamDefaults) ? 
            this.constructor.methodParamDefaults[methodName] : 
            {}, this.paramDefaults);
    }

    serialize() {
        return {
            constructorName: this.constructor.name,
            server: this.server,
            preferredMediaType: this.preferredMediaType
        };
    }
}

module.exports = MusicLibraryInterface;
