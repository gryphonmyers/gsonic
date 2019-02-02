const defaults = require('defaults-es6');

module.exports = Component => class ArtistsViewComponent extends Component {

    static get state() {
        return defaults({
            artists: [],
            isLoading: false
        }, super.state);
    }

    static get inputs() {
        return ['libraryInterface'];
    }

    static get deserializers() {
        return {
            artists: function(val) {
                return this.libraryInterface && val ? val.map(item => this.libraryInterface.Artist.deserialize(item)) : []
            }
        }
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    static get components() {
        return {
            'artist-list': require('../artist-list')
        }
    }

    onEnter() {
        this.state.isLoading = true;
    }

    onUpdate() {
        this.state.isLoading = true;
    }

    onMount() {        
        this.state.libraryInterface.getArtists()
            .then(data => {
                this.state.artists = data.map(artist => artist.serialize());
                this.state.isLoading = false;
            })
    }
}
