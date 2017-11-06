function getSources(song) {
    return [{src: song.url, type: song.type}];
}

module.exports = Component => class LocalPlayerComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                isBuffering: false,
                playerID: function(){
                    return 'player-' + this.$id;
                },
                sources: function() {
                    return this.playingSong && this.isActive ? getSources(this.playingSong) : [];
                }
            },
            inputs: ['playingSong', 'isActive', 'currentTime'],
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
            }
        }))
    }

    onEnded(evt) {
        this.createAction('SONG_ENDED', Object.assign({}, evt));
    }

    onTimeUpdate(evt) {
        this.createAction('UPDATE_PLAYBACK_TIME', {newTime: evt.target.currentTime});
    }

    onCanPlayThrough(evt) {
        this.state.isBuffering = false;
        evt.target.play();
    }

    onInit() {
        this.state.watch('isActive', isActive => {
            if (!isActive) {
                // this.queryOnRender('')
                //     .then(el => {
                //         el.load()
                //     })
                this.once('renderdommarkup', evt => {
                    this.state.isBuffering = true;
                    var el = document.querySelector('#' + this.state.playerID + ' audio');
                    if (el) el.pause();
                });
            }
        })
        this.state.watch('sources', sources => {
            if (sources.length) {
                this.once('renderdommarkup', evt => {
                    this.state.isBuffering = true;
                    var el = document.querySelector('#' + this.state.playerID + ' audio');
                    if (el) el.load();
                });
            }
        });
    }
}
