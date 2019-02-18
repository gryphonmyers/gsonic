const defaults = require('defaults-es6');
const formatTime = require('../../../../scripts/format-time');

module.exports = Component => class PlayerComponent extends Component {

    static get state(){
        return defaults({
            isPlaying: false,
            songQueue: [],
            isChrome: function() {
                var chrome;
                try {
                    chrome = global.chrome;
                } catch (err) {}
                if (chrome) return true;
                try {
                    chrome = window.chrome;
                } catch (err) {}
                return !!chrome;
            },
            volume: 1,
            isShuffled: false,
            numSongsToPreload: 2,
            showSongQueue: false,
            playbackStartIndex: 0,
            castPlayerActive: false,
            localPlayerActive: function() {
                return !this.castPlayerActive;
            },
            playingSong: function() {
                return this.songQueue.length ? this.songQueue[this.playbackStartIndex || 0] : null;
            },
            nextSongs: function(){
                return this.songQueue.slice(1)
            },
            songProgressPercent: function() {
                return this.playingSong ? ((this.currentTime / this.playingSong.duration) * 100).toFixed(2) + '%' : '0%';
            },
            inverseSongProgressPercent: function() {
                return this.playingSong ? (100 - (this.currentTime / this.playingSong.duration) * 100).toFixed(2) + '%' : '0%';
            },
            // currentReportedTime: function() {
            //     return this.castPlayerActive ? this.reportedTimes.cast : (this.localPlayerActive ? this.reportedTimes.local : null);
            // },
            // reportedTimes: {
            //     'cast': null,
            //     'local': null
            // },
            currentTime: null,
            currentTimeFormatted: function(){
                return this.currentTime ? formatTime(this.currentTime) : null
            }
        }, super.state);
    }

    static get deserializers() {
        return {
            playingSong: function(val) {
                return val && this.libraryInterface ? this.libraryInterface.deserialize(val) : null;
            },
            nextSongs: function(val) {
                return val && val.length && this.libraryInterface ? val.map(song => this.libraryInterface.deserialize(song)) : null;
            }
        }
    }

    static get serializers() {
        return {
            playingSong: function(val) {
                return val ? val.serialize() : null;
            },
            nextSongs: function(val) {
                return val && val.length ? val.map(song => song.serialize()) : [];
            }
        }
    }

    static get inputs() {
        return ['songQueue', 'isPlaying', 'playbackStartIndex', 'isShuffled', 'libraryInterface'];
    }

    static get markup(){
        return require('./index.pug')
    }

    static get styles() {
        return require('./index.css')
    }

    static get components() {
        return {
            'local-player': require('./components/local-player'),
            'cast-player': require('./components/cast-player'),
            'song-list': require('../library/components/song-list'),
            'volume-control': require('./components/volume-control')
        };
    }
    
    showQueue(evt) {
        if (!this.state.showSongQueue) {
            this.state.showSongQueue = true;
            var callback;
            evt.stopPropagation();
            document.body.addEventListener('click', callback = (evt) => {
                var domNode = evt.target;
                while (domNode) {
                    if (domNode.classList.contains('song-queue')) {
                        return;
                    }
                    domNode = domNode.parentElement;
                }
                this.state.showSongQueue = false;
                document.body.removeEventListener('click', callback);
            })
        }
        
    }

    onInit() {
        this.state.watch('playingSong', playingSong => {
            if (playingSong) {
                // this.state.currentTime = 0;
            } else {
                this.state.currentTime = null;
            }
            this.trigger('playingsongchange', { playingSong })  
        })

        // this.state.watch('castPlayerActive', castPlayerActive => {
        //     if (castPlayerActive) {
        //         if (this.state.reportedTime.local != null) {
        //             this.state.currentTime = this.state.reportedTimes.local;
        //         }                
        //     } else {
        //         if (this.state.reportedTime.cast != null) {
        //             this.state.currentTime = this.state.reportedTimes.cast;
        //         }                
        //     }
        // })
    }


    onSongProgressClick(evt) {
        if (this.state.playingSong) {
            var ratio = evt.offsetX / evt.target.clientWidth;

            this.state.currentTime = this.state.playingSong.duration * ratio;
        }
    }

    onUpdateVolume(evt) {
        this.state.volume = evt.newVolume;
    }

    onChangeCastPlayerActive(evt) {
        this.state.castPlayerActive = evt.isActive;
    }

    onSetPlaybackTime(evt) {
        this.state.currentTime = evt.newTime;
    }

    onReportPlaybackTime(evt) {
        if (evt.originPlayer) {
            // this.state.reportedTimes = defaults({ [evt.originPlayer] : evt.newTime}, this.state.reportedTimes);
            this.state.currentTime = Math.floor(evt.newTime);
            
        }
    }
}
