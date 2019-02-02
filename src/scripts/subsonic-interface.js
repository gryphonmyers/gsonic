// var jsSHA = require('jssha');
// var xml2js = require('xml2js');
var MusicLibraryInterface = require('./music-library-interface');
const defaults = require('defaults-es6');
// 'server/xml.server.php?action={{action}}&auth={{passphrase}}&timestamp={{timestamp}}&version=350001&user={{user}}'


class SubsonicInterface extends MusicLibraryInterface {
    static get apiPath() {
        return 'rest/';
    }

    static get ping() {
        return 
    }

    static get defaultOpts() {
        return {
            apiVersion: '1.12.0'
        }
    }

    constructor(opts) {
        super(opts);
        opts = defaults(opts, this.constructor.defaultOpts);

        this.apiVersion = opts.apiVersion;
        this.username = opts.username;
        this.password = opts.password;
    }

    request() {
        return super.request.apply(this, arguments)
            .then(res => {
                if (!res.ok) {
                    return Promise.reject(new Error('Server error'));
                }
                if (res.headers.get('content-type').indexOf('application/json') > -1) {
                    return res.json().then(result => {
                        var data = result['subsonic-response'];
                        if (data.status === 'ok') {
                            return data;
                        } else {
                            return Promise.reject(data.error);
                        }
                    })
                }
            })
    }

    validateParams(opts, methodPath) {
        opts = super.validateParams.apply(this, arguments);
        if (!opts.u || !opts.p) {
            throw new Error('Request must include username and password.');
        }
        return opts;
    }

    static get paramDefaults() {
        return { c: 'gsonic', f: 'json' };
    }

    get paramDefaults() {
        return defaults({
            v: this.apiVersion,
            u: this.username,
            p: this.password
        }, this.constructor.paramDefaults);
    }

    static get methodParamDefaults() {
        return {
            'getCoverArt.view': {
                f: null
            },
            'stream.view': {
                f: null
            }
        }
    }

    auth(username, password) {
        return this.ping({u: username, p: password})
            .then(() => {
                this.username = username;
                this.password = password;
            });
    }

    ping(opts={}) {
        return this.request('ping.view', opts);
    }

    serialize() {
        return defaults({
            apiVersion: this.apiVersion,
            username: this.username,
            password: this.password
        }, super.serialize());
    }

    getRandomAlbums(params={}) {
        params = defaults({
            type: 'random'
        }, params);
        return this.request('getAlbumList.view', params)
            .then(data => data.albumList.album.map(album => this.makeNewAlbum(Object.assign({ artistId: album.parent }, album))))
    }

    async getArtists(params={}) {
        var data = await this.request('getIndexes.view', params);
        return data.indexes.index.map(index => index.artist.map(artist => this.makeNewArtist(artist))).flat(4);
    }

    async getArtist(params={}) {
        var id = params.id;
        var cachedArtist = this.cache.artists[id];
        var needArtist = !cachedArtist || !cachedArtist.name;
        var needDetails = this.apiVersion >= "1.11.0" && (!cachedArtist || !cachedArtist.bio);
        var promises = [];
        if (needArtist) {
            promises[0] = (this.request('getMusicDirectory.view', {id}));
        }
        if (needDetails) {
            promises[1] = (this.request('getArtistInfo.view', { id, includeNotPresent: true }));
        }
        var [artistData, artistDetails] = await Promise.all(promises);
        
        return this.makeNewArtist(Object.assign({}, cachedArtist || {}, artistData ? { name: artistData.directory.name, id } : {}, artistDetails ? artistDetails.artistInfo : {}));
    }

    makeNewAlbum(album) {
        if (album.id in this.cache.albums) {
            return this.cache.albums[album.id];
        }

        return this.cache.albums[album.id] = new this.Album({
            artist: album.artist,
            id: decodeURIComponent(album.id),
            coverArt: this.createServerUrl('getCoverArt.view', { id: decodeURIComponent(album.coverArt) }),
            coverThumb: this.createServerUrl('getCoverArt.view', { id: decodeURIComponent(album.coverArt), size: 250 }),
            title: album.title,
            artistId: decodeURIComponent(album.artistId)
        });
    }

    makeNewSong(song) {
        if (song.id in this.cache.songs) {
            return this.cache.songs[song.id];
        }
        return this.cache.songs[song.id] = new this.Song({
            album: song.album,
            artist: song.artist,
            year: song.year,
            size: song.size,
            genre: song.genre,
            albumId: decodeURIComponent(song.albumId),
            coverArt: this.createServerUrl('getCoverArt.view', { id: decodeURIComponent(song.albumId) }),
            coverThumb: this.createServerUrl('getCoverArt.view', { id: decodeURIComponent(song.albumId), size: 250 }),
            title: song.title,
            id: decodeURIComponent(song.id),
            track: song.track,
            duration: song.duration,
            originalContentType: song.contentType
        })
    }

    makeNewArtist(artist) {
        if (artist.id in this.cache.artists) {
            var cachedArtist = this.cache.artists[artist.id];
            if (cachedArtist.bio || !artist.biography) {
                return cachedArtist;
            }
        }
        return this.cache.artists[artist.id] = new this.Artist({
            name: artist.name,
            id: decodeURIComponent(artist.id),

            bio: artist.biography ? artist.biography[0] : null,
            image: artist.largeImageUrl ? artist.largeImageUrl[0] : null,
            thumb: artist.mediumImageUrl ? artist.mediumImageUrl[0] : null,
            similarArtists: artist.similarArtist ? artist.similarArtist.map(similarArtist => this.makeNewArtist(similarArtist)) : null,
            lastFmUrl: artist.lastFmUrl ? artist.lastFmUrl[0] : null,
            mbId: artist.musicBrainzId ? artist.musicBrainzId[0] : null
        })
    }

    async getAlbum(params={}) {
        if (params.id in this.cache.albums) {
            return this.cache.albums[params.id];
        }

        if (this.apiVersion >= "1.0.0") {
            return this.request('getMusicDirectory.view', params)
                .then(async data => {
                    data.directory.child.forEach(song => this.makeNewSong(Object.assign({ albumId: song.parent }, song)))
                    
                    var artistDir = await this.request('getMusicDirectory.view', { id: data.directory.parent })
                    var albumDir = artistDir.directory.child.find(child => decodeURIComponent(child.id) === decodeURIComponent(params.id));

                    return this.makeNewAlbum(Object.assign({ artistId: albumDir.parent }, albumDir));
                })
        } else {
            throw new Error('Unsupported Subsonic API version.');
        }
    }

    getArtistAlbums(params={}) {
        return this.request('getMusicDirectory.view', { id: params.id })
                .then(data => data.directory.child.map(child => this.makeNewAlbum(Object.assign({ artistId: child.parent }, child))));
    }

    search(params={}) {
        params = defaults({
            albumLimit: params.limit,
            songLimit: params.limit,
            artistLimit: params.limit
        }, params);

        return this.request('search2.view', { query: params.query, 
                albumCount: params.albumLimit, 
                artistCount: params.artistLimit,
                songCount: params.songLimit 
            })
            .then(data => {
                return {
                    songs: data.searchResult2.song ? 
                        data.searchResult2.song.map(song => this.makeNewSong(Object.assign({ albumId: song.parent }, song))) : 
                        null,
                    artists: data.searchResult2.artist ? 
                        data.searchResult2.artist.map(artist => this.makeNewArtist(Object.assign({}, artist))) : 
                        null,
                    albums: data.searchResult2.album ? 
                        data.searchResult2.album.map(album => this.makeNewAlbum(Object.assign({ artistId: album.parent }, album))) : 
                        null
                }
            })
    }

    getStreamUrl(song) {
        var format;
        switch (this.preferredMediaType) {
            case 'audio/mpeg':
                format = 'mp3';
                break;
            case 'audio/flac':
            default:
                format = 'raw';
                break;
        }
        return this.createServerUrl('stream.view', {  format, id: song.id });
    }

    getSongsSimilarToArtist({id, limit}) {
        return this.request('getSimilarSongs.view', {id, limit})
            .then(data => data.similarSongs.song.map(song => this.makeNewSong(Object.assign({ albumId: song.parent }, song))))
    }

    getContentType(song) {
        switch (this.preferredMediaType) {
            case 'original':
                return song.originalContentType;
            default:
                return this.preferredMediaType;
        }
    }

    getAlbums(params) { 
        if (params.sort) {
            if (params.sort.name) {

            }
            if (params.sort.added) {
                return this.request('getAlbumList.view', { type: 'recent', offset: params.skip })
                    .then(data => data.albumList.album.map(album => this.makeNewAlbum(Object.assign({ artistId: album.parent }, album))))
                
            }
        }
    }

    getAlbumSongs(params={}) {
        if (this.apiVersion >= "1.0.0") {
            return this.request('getMusicDirectory.view', params)
                .then(data => data.directory.child.map(song => this.makeNewSong(Object.assign({ albumId: song.parent }, song))))
        } else {
            throw new Error('Unsupported Subsonic API version.');
        }
       
    }
}

module.exports = SubsonicInterface;
