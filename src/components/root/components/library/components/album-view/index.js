const defaults = require('defaults-es6');
const shuffle = require('../../../../../../scripts/array-shuffle');
const formatTime = require('../../../../../../scripts/format-time');

module.exports = Component => class SongsViewComponent extends Component {

    static get state() {
        return defaults({
            songs: [],
            album: null,
            showCoverModal: false,
            songsDurationFormatted: function() {
                return formatTime(this.songs.reduce((acc, curr) => acc + curr.duration, 0))
            },
            albumGenre: function(){
                return this.album && this.songs.length ? 
                    (this.album.genre || (this.songs.every((song, ii, arr) => !arr[ii+1] || song.genre === arr[ii+1].genre) && this.songs[0].genre)) : 
                    null
            },
            albumYear: function(){
                return this.album && this.songs.length ? 
                    (this.album.year || (this.songs.every((song, ii, arr) => !arr[ii+1] || song.year === arr[ii+1].year) && this.songs[0].year)) : 
                    null
            },
            isLoading: false
        }, super.state);
    }

    static get inputs() {
        return ['libraryInterface', 'playingSong'];
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    static get components() {
        return {
            'song-list': require('../song-list'),
            'modal': require('../modal')
        }
    }
    fetchAlbumData(libraryInterface, id) {
        return Promise.all([
            libraryInterface.getAlbumSongs({id}),
            libraryInterface.getAlbum({id})
        ])
        .then(([songs, album]) => ({songs, album}))
    }

    onShuffleClick(evt) {
        this.state.await('songs')
            .then(songs => {
                this.trigger('playsongs', { songs: shuffle(songs), startIndex: 0 })
            })
    }

    onPlayClick(evt) {
        this.state.await('songs')
            .then(songs => {
                this.trigger('playsongs', { songs, startIndex: 0 })
            })
    }

    onUpdate(evt) {
        this.state.isLoading = true;
        return this.fetchAlbumData(this.state.libraryInterface, evt.matches.hash)
            .then(({ songs, album }) => {
                this.state.album = album;
                this.state.songs = songs;
                this.state.isLoading = false;
            })
    }

    onEnter(evt) {
        this.state.isLoading = true;
        this.state.await('libraryInterface')
            .then(libraryInterface => {
                this.fetchAlbumData(libraryInterface, evt.matches.hash)
                    .then(({ songs, album }) => {
                        this.state.isLoading = false;
                        this.state.album = album;
                        this.state.songs = songs;
                    })
            })
    }
}
