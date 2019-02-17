const defaults = require('defaults-es6');

module.exports = Component => class AlbumsViewComponent extends Component {

    static get state() {
        return defaults({
            albums: [],
            isLoading: false,
            sortTypeOptions: function() {
                return Object.entries(this.supportedSortOptions)
                    .filter(entry => entry[1])
                    .map(entry => entry[0]);
            },
            supportedSortOptions: {},
            sortType: null,
            supportsReverseSort: null
        }, super.state);
    }

    static get deserializers() {
        return {
            albums: function(albums) {
                return this.libraryInterface && albums ? albums.map(album => this.libraryInterface.Album.deserialize(album)) : [];
            }
        }
    }

    static get serializers() {
        return {
            albums: function(albums) {
                return albums && albums.length ? albums.map(album => album.serialize()) : []
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

    onSortChange(evt) {
        evt.value 
    }

    async getAlbums(libraryInterface, sortType) {
        this.state.supportedSortOptions = {
            name: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_NAME,
            random: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_RANDOM,
            added: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_ADDED,
            released: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_RELEASED,
            artist: libraryInterface.constructor.featureSupport.ALBUM_SORTBY_ARTIST
        };

        if (sortType && !(sortType in this.state.supportedSortOptions)) {
            throw new Error(`${sortType} sort is not supported by the current library interface.`);
        }
        this.state.isLoading = true;

        switch(sortType) {
            case 'name':
                var prom = libraryInterface.getAlbums({ sort: { name: 1 }, skip: this.state.albums.length, limit: 20 })
                break;
            case 'random':
                prom = libraryInterface.getAlbums({ sort: { random: 1 }, skip: this.state.albums.length, limit: 20 })
                break;
            case 'added':
                prom = libraryInterface.getAlbums({ sort: { added: -1 }, skip: this.state.albums.length, limit: 20 })
                break;
            case 'released':
                prom = libraryInterface.getAlbums({ sort: { released: -1 }, skip: this.state.albums.length, limit: 20 })
                break;
            case 'artist':
                prom = libraryInterface.getAlbums({ sort: { artist: -1 }, skip: this.state.albums.length, limit: 20 })
                break;
            default:
                throw new Error(`Unrecognized sort type: ${sortType}`);
        }
        var albums = await prom;
        this.state.isLoading = false;
        this.state.albums = [...this.state.albums, ...albums]
    }

    constructor() {
        super(...arguments);

        this.checkInfiniteScroll = () => {
            if (this.el) {
                var lastAlbumEl = this.el.querySelector('.album:last-child');
                if (lastAlbumEl && !this.state.isLoading) {
                    var rect = lastAlbumEl.getBoundingClientRect();
                    if ((
                        rect.top <= (window.innerHeight)
                    )) {
                        this.getAlbums(this.state.libraryInterface, this.state.sortType)
                    }
                }
            }
        }
    }

    onMount() {
        window.addEventListener('scroll', this.checkInfiniteScroll);
    }

    onUnmount() {
        window.removeEventListener('scroll', this.checkInfiniteScroll);
    }

    onEnterOrUpdate(evt) {
        this.state.await('libraryInterface').then(libraryInterface => {
            this.state.sortType = evt.matches.hash;
        })
    }

    onInit() {
        this.state.watch('sortType', async (sortType, prevVal) => {
            this.state.albums = [];
            this.router.route({ hash: sortType })
            var libraryInterface = await this.state.await('libraryInterface');
            this.getAlbums(libraryInterface, sortType)
        })
    }
}
