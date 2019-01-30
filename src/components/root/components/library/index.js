const defaults = require('defaults-es6');
const debounce = require('debounce');

module.exports = Component => class LibraryComponent extends Component {
    static get state() {
        return defaults({
            searchResults: null,
            playingSong: null,
            showSearchResults: false
        }, super.state);
    }

    static get styles() {
        return require('./index.css');
    }

    static get markup() {
        return require('./index.pug');
    }

    static get inputs() {
        return ['libraryInterface', 'playingSong'];
    }

    static get hydrators() {
        return {
            searchResults: function(searchResults) {
                return this.libraryInterface && searchResults ? 
                    searchResults.reduce((acc, curr) => Object.assign(acc, {[curr[0]]: curr[1] ? curr[1].map(item => this.libraryInterface.deserialize(item)) : null }), {}) : null;
            }
        }
    }

    search(query='') {
        if (query) {
            this.state.libraryInterface.search({ query, limit: 3 })
                .then(searchResults => {
                    this.state.searchResults = Object.entries(searchResults).map(result => [result[0], result[1] ? result[1].map(item => item.serialize()) : null]);
                });
        } else {
            this.state.searchResults = null;
        }
    }

    onSearchFieldFocus(evt) {
        this.state.showSearchResults = true;
        var onClickHandler = (bodyEvt) => {
            if (bodyEvt.target !== evt.target && !bodyEvt.target.matches('.search-results *:not(a), .search-results')) {
                this.state.showSearchResults = false;
                document.body.removeEventListener('click', onClickHandler);
            }
        }
        document.body.addEventListener('click', onClickHandler)
    }
    onSearchFieldInput(evt) {
        if (!this.debouncedSearch) {
            this.debouncedSearch = debounce(this.search.bind(this), 750);
        }
        this.debouncedSearch(evt.target.value);
    }

    onSearchKeyup(evt) {
        if (evt.keyCode == 13) {
            // Enter key
            this.router.route({ name: 'searchResults', params: { query: evt.target.value }})
        }
    }

    static get components() {
        return {
            SongsView: [require('./components/songs-view'), {libraryInterface: 'libraryInterface'}],
            'albums-view': require('./components/albums-view'),
            'artist-view': require('./components/artist-view'),
            'album-view': require('./components/album-view'),
            'artists-view': require('./components/artists-view'),
            materialtextfield: require('../../../material-text-field'),
            'loading-spinner': require('./components/loading-spinner')
        };
    }
}
