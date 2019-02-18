const defaults = require('defaults-es6');
const debounce = require('debounce');

module.exports = Component => class LibraryComponent extends Component {
    static get state() {
        return defaults({
            searchResults: null,
            playingSong: null,
            showSearchResults: false,
            miniSearchResults: function() {
                if (this.searchResults) {
                    var results = {};
                    if (this.searchResults.songs) {
                        results.songs = this.searchResults.songs.slice(0, 3);
                    }
                    if (this.searchResults.albums) {
                        results.albums = this.searchResults.albums.slice(0, 3);
                    }
                    if (this.searchResults.artists) {
                        results.artists = this.searchResults.artists.slice(0, 3);
                    }
                    return results;
                }
                return null;
            },
            isSearchView: function() {
                return this.$currentRouteName === 'searchResults';
            }
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

    static get deserializers() {
        var searchResults = function(searchResults) {
            return this.libraryInterface && searchResults ? 
                searchResults.reduce((acc, curr) => Object.assign(acc, {[curr[0]]: curr[1] ? curr[1].map(item => this.libraryInterface.deserialize(item)) : null }), {}) : null;
        };
        return {
            searchResults,
            miniSearchResults: searchResults
        }
    }

    static get serializers() {
        var searchResults = function(searchResults) {
            return searchResults ? Object.entries(searchResults).map(result => [result[0], result[1] ? result[1].map(item => item.serialize()) : null]) : null;
        };
        return {
            searchResults,
            miniSearchResults: searchResults
        }
    }

    search(query='') {
        if (query) {
            this.state.libraryInterface.search({ query })
                .then(searchResults => {
                    this.state.searchResults = searchResults;
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
            'search-results-view': require('./components/search-results'),
            materialtextfield: require('../../../material-text-field'),
            'loading-spinner': require('./components/loading-spinner')
        };
    }
}
