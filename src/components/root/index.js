const defaults = require('defaults-es6');

module.exports = Component => class RootComponent extends Component {
    static get SubsonicMusicLibraryInterface() {
        return require('../../scripts/subsonic-interface');
    }
    
    static get state() {
        return defaults({
            libraryInterface: null,
            isPlaying: false,
            playingSong: null,
            isShuffled: false,
            playbackStartIndex: 0,
            songQueue: []
        }, super.state);
    }

    static get markup() {
        return require('./index.pug');
    }

    static get components() {
        return {
            library: require('./components/library'),
            authform: require('./components/auth-form'),
            player: require('./components/player')
        }
    }

    static get styles() {
        return require('./index.css');
    }

    static get serializers() {
        return {
            songQueue: function(songQueue) {
                return songQueue ? songQueue.map(song => song.serialize()) : [];
            },
            playingSong: function(val) {
                return val ? val.serialize() : null;
            }
        }
    }

    setLibraryInterface(evt) {
        if (evt.shouldRemember) {
            localStorage.setItem('libraryInterface', JSON.stringify(evt.libraryInterface.serialize()));
        }
        this.state.libraryInterface = evt.libraryInterface;
    }

    static get deserializers() {
        var constructor = this;
        return {
            playingSong: function(val) {
                return val && this.libraryInterface ? this.libraryInterface.deserialize(val) : null;
            },
            libraryInterface: function(libraryInterface) {
                if (libraryInterface) {
                    switch (libraryInterface.constructorName) {
                        case 'SubsonicInterface':
                            return new constructor.SubsonicMusicLibraryInterface(libraryInterface);
                    }
                }
                return libraryInterface;                
            },
            songQueue: function (songQueue) {
                if (songQueue && songQueue.length && !this.libraryInterface) throw new Error('Library interface not defined before songQueue needs to be hydrated')
                return songQueue ? songQueue.map(song => this.libraryInterface.deserialize(song)) : [];
            }
        }
    }

    onPlay(evt) {
        if (this.state.songQueue.length) {           
            this.state.isPlaying = true;
        }
    }

    onPause(evt) {
        this.state.isPlaying = false;
    }

    playSongs(event) {
        if (this.removeGeneratorCallback) this.removeGeneratorCallback();
        if (event.songsGenerator) {
            var generated = event.songsGenerator.next();
            if (!generated.done) {
                Promise.resolve(generated.value)
                    .then(generatedSongs => {
                        this.state.songQueue = generatedSongs
                    })
    
                this.removeGeneratorCallback = this.state.watch(['songQueue', 'playbackStartIndex'], (songQueue, playbackStartIndex) => {
                    if (songQueue.length <= playbackStartIndex) {
                        var generated = event.songsGenerator.next();
                        if (generated.done) {
                            this.removeGeneratorCallback()
                        } else {
                            Promise.resolve(event.songsGenerator.next().value)
                                .then(generatedSongs => {
                                    this.state.songQueue = [...songQueue, ...generatedSongs]
                                })  
                        }            
                    }
                });
            }
            
            this.state.playbackStartIndex = 0;
        } else if (event.songs) {
            this.state.songQueue = event.songs.reduce((acc, curr) => acc.find(item => item.id === curr.id) ? acc : [...acc, curr], [])
            this.state.playbackStartIndex = event.startIndex || 0;
        }
        
        // this.state.shuffledIndices = Array.from({length: event.songs.length}).map((val, ii) => ii).shuffle();
        this.state.isPlaying = true;
    }

    playSongsNext(event) {
        if (this.state.isPlaying) {
            this.state.songQueue = [...this.state.songQueue.slice(0, 1), ...event.songs.reduce((acc, curr) => acc.find(item => item.id === curr.id) ? acc : [...acc, curr], []), ...this.state.songQueue.slice(1)]
        } else {
            this.playSongs(event);
        }        
    }

    // playSongsShuffled(event) {
    //     this.state.songQueue = event.songs.shuffle();
    //     this.state.playbackStartIndex = event.startIndex || 0;
    //     this.state.isPlaying = true;
    // }

    queueSongs(event) {
        this.state.songQueue = this.state.songQueue
            .concat(event.songs)
            .reduce((acc, curr) => acc.find(item => item.id === curr.id) ? acc : [...acc, curr], [])
        // this.state.shuffledIndices = this.state.shuffledIndices.concat(Array.from({length: event.songs.length}).map((val, ii) => ii).shuffle())
    }

    // queueSongsShuffled(event) {
    //     this.state.songQueue = this.state.songQueue.concat(event.songs.shuffle());
    // }

    onSongEnded(evt) {
        this.state.playbackStartIndex++;
    }

    onSkipSong(evt) {
        this.state.playbackStartIndex = Math.max(Math.min(this.state.playbackStartIndex + evt.delta, this.state.songQueue.length - 1), 0);
    }

    onInit() {
        this.state.watch('libraryInterface', libraryInterface => {
            if (libraryInterface) {
                libraryInterface.ping()
                    .catch(err => {
                        this.state.libraryInterface = null;
                        localStorage.removeItem('libraryInterface');
                    });
            }
        });

        var libraryInterface = localStorage.getItem('libraryInterface');
        if (libraryInterface) {
            libraryInterface = JSON.parse(libraryInterface);
            this.state.libraryInterface = libraryInterface;            
        }

        if (process.env.NODE_ENV === 'development') {
            debugger;
        }
    }
};
