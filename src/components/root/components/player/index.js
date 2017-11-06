


module.exports = Component => class PlayerComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                playingSong: null,
                queue: [],
                castPlayerActive: false,
                localPlayerActive: function() {
                    return !this.castPlayerActive;
                },
                playbackTime: null
            },
            inputs: ['url'],
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
                CastPlayer: [require('./components/cast-player'), {
                    castPlayerActive: 'isActive', playingSong: 'playingSong'
                }],
                LocalPlayer: [require('./components/local-player'), {
                    localPlayerActive: 'isActive', playingSong: 'playingSong'
                }]
            }
            // actionReducers: {
            //     PLAY_SONG: function(song){
            //         this.state.sources = [song];
            //     }
            // }
        }))
    }

    playSong(song) {
        this.state.playingSong = song;
    }

    queueSongs(songs) {
        this.queue = songs;
    }

    playNextSong() {
        this.playSong(this.state.queue.slice(0,1)[0]);
        this.state.queue = this.state.queue.slice(1);
    }

    changeCastPlayerActive(evt) {
        this.state.castPlayerActive = evt.isActive;
    }

    updatePlaybackTime(evt) {
        this.state.playbackTime = evt.newTime;
    }

    onInit() {
        this.on('UPDATE_PLAYBACK_TIME', this.updatePlaybackTime);
        this.on('PLAY_SONG', this.playSong);
        this.on('QUEUE_SONGS', this.queueSongs);
        this.on('SONG_ENDED', this.playNextSong);
        this.on('CHANGE_CAST_PLAYER_ACTIVE', this.changeCastPlayerActive)
    }

    onEnter() {
    }
}
