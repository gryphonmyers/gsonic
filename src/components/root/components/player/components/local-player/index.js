const defaults = require('defaults-es6');

function getSources(song) {
    return [{src: song.url, type: song.contentType}];
}

module.exports = Component => class LocalPlayerComponent extends Component {

    static get styles() {
        return require('./index.css');
    }

    static get state() {
        return defaults({
            numSongsToPreload: 2,
            isBuffering: false,
            playerID: function(){
                return 'player-' + this.$id;
            },
            sources: function() {
                return this.playingSong ? getSources(this.playingSong) : [];
            }
        }, super.state);
    }

    static get inputs() {
        return ['playingSong', 'isPlaying', 'currentTime', 'volume', 'nextSongs'];
    }

    static get markup() {
        return require('./index.pug');
    }

    onSkipBack(evt) {
        if (this.state.playingSong && this.audioEl) {
            if (this.audioEl.currentTime < 5) {
                this.trigger('skipsong', { delta: -1, source: this});
            } else {
                this.trigger('setplaybacktime', { newTime: 0 });
            }
        }
    }

    onEnded(evt) {
        this.trigger('songended', Object.assign({}, evt));
    }

    onTimeUpdate(evt) {
        if (this.state.isPlaying) {
            this.trigger('reportplaybacktime', {newTime: evt.target.currentTime, originPlayer: 'local' });
        } else {
            this.audioEl.pause()
        }        
    }

    onCanPlayThrough(evt) {
        this.state.isBuffering = false;
        this.trigger('oncanplaythrough', evt);
        evt.target.play();
    }

    onVolumeChange(evt) {
        this.trigger('updatevolume', { newVolume: evt.target.volume, source: this });
    }

    onDOMCreateOrChange() {
        this.audioEl = this.el.querySelector('audio');
    }

    static get watchers() {
        return {
            sources: sources => {

            },
            
        }
    }

    onInit() {
        this.state.watch(['sources'], (sources) => {
            if (sources.length) {
                this.audioEl.src = sources[0].src;
            }
        });

        this.state.watch('isPlaying', isPlaying => {
            if (this.audioEl) {
                if (isPlaying) {
                    if (this.state.currentTime) {
                        this.audioEl.currentTime = this.state.currentTime;
                    }
                    
                    this.audioEl.play().catch(err => {
                    })
                } else {
                    this.audioEl.pause();
                }
            }
        });

        this.state.watch(['currentTime'], (currentTime) => {
            if (this.audioEl) {
                if (this.state.isPlaying) {
                    if (Math.abs(currentTime - this.audioEl.currentTime) > 1) {
                        this.audioEl.currentTime = currentTime;
                    }
                }
            }
        })

        this.state.watch(['volume'], (volume) => {
            if (this.audioEl) {
                if (this.audioEl.volume !== volume) {
                    this.audioEl.volume = volume;
                }
            }
        })

        this.state.watch('nextSongs', nextSongs => {
            if (nextSongs && nextSongs.length) {
                if (this.cancelPreload) this.cancelPreload();
                this.cancelPreload = this.once('oncanplaythrough', () => {
                    nextSongs.slice(0, this.state.numSongsToPreload)
                        .forEach(song => {
                            var source = getSources(song)[0];
                            fetch(source.src, {
                                headers: {
                                    'content-type': source.type,
                                    'range': "bytes=0-"
                                }
                            })
                        })
                })
            }
        })
    }
}
