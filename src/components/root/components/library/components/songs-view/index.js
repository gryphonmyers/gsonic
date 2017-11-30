var debounce = require('debounce');

module.exports = Component => class SongsViewComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                songs: function(){
                    return typeof this.cursor === 'number' ? Array.from({length:this.perPage}, (v, ii) => this.loadedSongs[this.cursor + ii] || this.loadingSongs[this.cursor + ii] || this.cursor + ii) : [];
                },
                topPadding: function(){
                    return this.rowHeight * this.cursor
                },
                bottomPadding: function() {
                    return this.rowHeight * this.numSongsInLibrary - (this.cursor + this.perPage);
                },
                rowHeight: 20,
                loadingSongs: {},
                loadedSongs: {},
                perPage: 50,
                isLoading: false,
                desiredCursor: 0,
                cursor: function(){
                    return Math.max(0, Math.min(this.numSongsInLibrary - this.perPage, this.desiredCursor));
                },
                numSongsInLibrary: 0
            },
            inputs: ['libraryInterface', 'filter', 'perPage'],
            markupTemplate: require('./index.pug'),
            components: {
                // DataTable: require('../../../../../material-data-table-component')
            }
        }))
    }
    static get styles() {
        return require('./index.css');
    }

    playSong(evt) {
        this.createAction('PLAY_SONG', JSON.parse(evt.target.getAttribute('data-song')))
    }

    getSongs(args) {

    }
    //
    // prevPage() {
    //     this.state.desiredCursor = this.state.cursor - this.state.perPage;
    // }
    //
    // nextPage() {
    //     this.state.desiredCursor = this.state.cursor + this.state.perPage;
    // }

    onMount() {
        if (this.state.songs.length === 0) {
            this.state.desiredCursor = 0;
        }
    }

    fetchMissingSongs(songs) {
        var range = songs.reduce((finalVal, currVal) => {
            if (typeof currVal === 'number') {
                var low = finalVal[0];
                var high = finalVal[1];
                var didSet = false;

                if (low === null || currVal < low) {
                    low = currVal;
                    didSet = true;
                }
                if (high === null || currVal > high) {
                    high = currVal;
                    didSet = true;
                }
                if (didSet) {
                    return [low, high];
                }
            }
            return finalVal;
        }, [null, null]);

        if (range.every(val => val !== null) && range[0] !== range[1]) {
            this.state.isLoading = true;
            var limit = (range[1] - range[0]) + 1;
            var promise = this.state.libraryInterface.songs({
                offset: range[0],
                limit
            });

            this.state.loadingSongs = Object.assign({}, this.state.loadingSongs, Array.from({length:limit}).reduce((final, curr, ii) => {
                final[ii + range[0]] = promise;
                return final;
            },{}));

            promise
                .then(songs => {
                    this.state.isLoading = false;
                    this.state.numSongsInLibrary = songs.numSongsInLibrary;
                    var loadedSongs = Object.assign({}, this.state.loadedSongs, songs.reduce((final, song, ii) => {
                        final[range[0] + ii] = song;
                        return final;
                    }, {}));
                    this.state.loadedSongs = loadedSongs;

                    var loadingSongs = this.state.loadingSongs;
                    this.state.loadingSongs = Object.entries(loadingSongs).filter((entry) => {
                        return !(entry[0] in loadedSongs);
                    }).reduce((final, entry) => {
                        final[entry[0]] = entry[1];
                        return final;
                    }, {});
                })
        }
    }

    onInit() {
        this.awaitRender()
            .then(() => {
                // var cursorDelta;
                var setCursor = (cursor) => {
                    this.state.desiredCursor = cursor;
                };
                var setCursorDebounced = debounce(setCursor, 300);
                var onScroll = function () {
                    var top = document.querySelector('.songs-table .songs').getBoundingClientRect().top;
                    // var offset = window.pageYOffset;
                    // cursorDelta = this.state.cursor - Math.floor(-top / 20);
                    var targetCursor = Math.floor(-top / 20);
                    var loadedSongs = this.state.loadedSongs;
                    if (Array.from({length: this.state.perPage}, (val, ii) => targetCursor + ii).every(index => loadedSongs[index])) {
                        setCursorDebounced.clear();
                        setCursor(targetCursor);
                    } else {
                        setCursorDebounced(targetCursor);
                    }
                }.bind(this);

                window.addEventListener('scroll', onScroll);
            })

        this.state.watch('songs', (songs) => {
            this.fetchMissingSongs(songs)
        });

        this.fetchMissingSongs(this.state.songs);
    }
}
