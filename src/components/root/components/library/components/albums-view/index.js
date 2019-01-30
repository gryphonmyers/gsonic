const defaults = require('defaults-es6');

module.exports = Component => class AlbumsViewComponent extends Component {

    static get state() {
        return defaults({
            albums: [],
            isLoading: false,
            sortSupport: {},
            supportsReverseSort: null
        }, super.state);
    }

    static get hydrators() {
        return {
            albums: function(albums) {
                return this.libraryInterface && albums ? albums.map(album => this.libraryInterface.Album.deserialize(album)) : [];
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
            'album-list': require('../album-list')
        }
    }

    getAlbums(libraryInterface, sortType) {
        this.state.sortSupport = {
            name: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_NAME,
            random: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_RANDOM,
            added: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_ADDED
        };

        if (sortType && !(sortType in this.state.sortSupport)) {
            throw new Error(`${sortType} sort is not supported by the current library interface.`);
        }

        switch(sortType) {
            case 'random':
                var prom = this.state.libraryInterface.getRandomAlbums()
                break;
            case 'name':
                prom = this.state.libraryInterface.getAlbums({ sort: { name: 1 } })
                break;
            case 'added':
            default:
            case '':
                prom = this.state.libraryInterface.getAlbums({ sort: { added: -1 } })
                break;
        }
        prom.then(albums => {
            this.state.albums = albums.map(album => album.serialize());
        })
    }

    onUpdate(evt) {
        this.state.await('libraryInterface').then(libraryInterface => {
            this.getAlbums(libraryInterface, evt.matches.hash)
        })
        
    }

    onEnter(evt) {
        this.state.await('libraryInterface').then(libraryInterface => {
            this.getAlbums(libraryInterface, evt.matches.hash)
        })
    }
}
