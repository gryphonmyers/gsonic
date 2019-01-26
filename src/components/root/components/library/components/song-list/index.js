const defaults = require('defaults-es6');

module.exports = Component => class SongListComponent extends Component {

    static get state() {
        return defaults({
            songs: [],
            isSingleArtist: function(){
                var artistName = null;
                return this.songs.every(song => {
                    if (!artistName) {
                        artistName = song.artist;
                    }
                    return song.artist === artistName;
                })
            }
        }, super.state);
    }

    static get inputs() {
        return ['songs', 'playingSong'];
    }


    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    queueSong(songId) {
        var songs = [this.state.songs.find(song => song.id === songId)];
        this.trigger('queuesongs', {songs})
    }

    playSongOnward(songId) {
        var songIndex = this.state.songs.findIndex(song => song.id === songId);
        if (songIndex === -1) {
            throw new Error("Can't find song for that id");
        }
        var songs = this.state.songs.slice(songIndex);
        this.trigger('playsongs', {songs})
    }

    playSongListStartingFromId(songId) {
        this.trigger('playsongs', {songs: this.state.songs, startIndex: this.state.songs.findIndex(song => song.id === songId) });
    }
}
