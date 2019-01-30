var debounce = require('debounce');
const defaults = require('defaults-es6');
const shuffle = require('../../../../../../scripts/array-shuffle');

module.exports = Component => class SongsViewComponent extends Component {

    static get state() {
        return defaults({
            albums: [],
            artist: null,
            isLoading: false,
            shouldShowBio: false
        }, super.state);
    }

    static get hydrators() {
        return {
            albums : function(val) {
                return this.libraryInterface && val ? val.map(item => this.libraryInterface.Album.deserialize(item)) : []
            },
            artist : function(val) {
                return this.libraryInterface && val ? this.libraryInterface.Artist.deserialize(val) : null
            }
        }
    }

    static get inputs() {
        return ['libraryInterface'];
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    static get components() {
        return {
            'album-list': require('../album-list'),
            'modal': require('../modal')
        };
    }

    fetchAlbums(albums) {
        return this.state.await('libraryInterface')
            .then(libraryInterface => {
                return Promise.all(albums.map(album => libraryInterface.getAlbumSongs({ id: album.id })))
                    .then(songs => {
                        return songs.flat(1);
                    })
            })        
    }

    onShuffleClick(evt) {
        this.fetchAlbums(this.state.albums)
            .then(songs => {
                this.trigger('playsongs', { songs: shuffle(songs), startIndex: 0 })
            })
    }

    onPlayClick(evt) {
        this.fetchAlbums(this.state.albums)
            .then(songs => {
                this.trigger('playsongs', { songs: songs, startIndex: 0 })
            })
    }

    onPlayNextClick() {
        this.fetchAlbums(this.state.albums)
            .then(songs => {
                this.trigger('playsongsnext', { songs: songs, startIndex: 0 })
            })
    }

    onPlayNextClickShuffled() {
        this.fetchAlbums(this.state.albums)
            .then(songs => {
                this.trigger('playsongsnext', { songs: shuffle(songs), startIndex: 0 })
            })
    }

    onQueueClick() {
        this.fetchAlbums(this.state.albums)
            .then(songs => {
                this.trigger('queuesongs', { songs: songs, startIndex: 0 })
            })
    }

    onRadioClick() {
        this.trigger('playsongs', {
            songsGenerator: function* () {
                while (true) {
                    yield this.state.libraryInterface.getSongsSimilarToArtist({ id: this.state.artist.id, limit: 10 })
                }
            }.call(this)
        });
    }

    onQueueShuffledClick() {
        this.fetchAlbums(this.state.albums)
            .then(songs => {
                this.trigger('queuesongs', { songs: shuffle(songs), startIndex: 0 })
            })
    }

    getArtistData(libraryInterface, id) {
        return Promise.all([
            libraryInterface.getArtist({id}),
            libraryInterface.getArtistAlbums({id})
        ])
        .then(([artist, albums]) => ({artist, albums}))
    }


    onUpdate(evt) {
        this.state.isLoading = true;
        return this.getArtistData(this.state.libraryInterface, evt.matches.hash)
            .then(({artist, albums}) => {
                this.state.isLoading = false;
                this.state.albums = albums;
                this.state.artist = artist;
            });
    }

    onEnter(evt) {
        this.state.isLoading = true;
        this.state.await('libraryInterface')
            .then(libraryInterface => {
                this.getArtistData(libraryInterface, evt.matches.hash)
                    .then(({artist, albums}) => {
                        this.state.isLoading = false;
                        this.state.albums = albums.map(album => album.serialize());
                        this.state.artist = artist.serialize();
                    })
            })
    }
}
