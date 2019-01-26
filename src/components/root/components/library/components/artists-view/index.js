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

    onMount() {
        this.state.isLoading = true;
        this.state.libraryInterface.getArtists()
            .then(data => {
                this.state.artists = data;
                this.state.isLoading = false;
            })
    }
}
