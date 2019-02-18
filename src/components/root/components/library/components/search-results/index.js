const defaults = require('defaults-es6');

module.exports = Component => class SearchResultsView extends Component {

    static get state() {
        return defaults({
            searchResults: null,
            searchResultsEmpty: function() {
                return !this.searchResults || (!this.searchResults.songs && !this.searchResults.albums && !this.searchResults.artists);
            }
        }, super.state);
    }

    static get inputs() {
        return ['libraryInterface', 'searchResults'];
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
            'artist-list': require('../artist-list'),
            'song-list': require('../song-list')
        };
    }
}
