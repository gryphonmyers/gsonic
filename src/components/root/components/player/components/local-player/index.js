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
        return ['playingSong', 'isPlaying', 'currentTime', 'volume'];
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
        this.trigger('reportplaybacktime', {newTime: evt.target.currentTime, originPlayer: 'local' });
    }

    onCanPlayThrough(evt) {
        this.state.isBuffering = false;
        evt.target.play();
    }

    onVolumeChange(evt) {
        this.trigger('updatevolume', { newVolume: evt.target.volume, source: this });
    }

    onDOMCreateOrChange() {
        this.audioEl = this.el.querySelector('audio');
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
                    this.audioEl.play().catch(err => {
                    })
                } else {
                    this.audioEl.pause();
                }
            }
        });

        this.state.watch(['currentTime'], (currentTime) => {
            
            if (this.audioEl) {
                var timeDelta = Math.abs(this.audioEl.currentTime - currentTime);
                if (timeDelta >= 1) {
                    this.audioEl.currentTime = currentTime;
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
    }
}
