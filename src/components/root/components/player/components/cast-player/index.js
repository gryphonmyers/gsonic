const defaults = require('defaults-es6');
const GCASTAPIAVAILABLE = new Promise(function(resolve){
    window['__onGCastApiAvailable'] = resolve;
});
var script = document.createElement('script')
script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
document.head.appendChild(script);

module.exports = Component => class CastPlayerComponent extends Component {
    static get state() {
        return defaults({
            gcastInit: false
        }, super.state);
    }

    static get inputs() {
        return ['isPlaying', 'playingSong', 'currentTime', 'volume'];
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    loadSong(song) {
        var mediaInfo = new chrome.cast.media.MediaInfo(song.url, song.contentType);
    
        mediaInfo.metadata = new chrome.cast.media.MusicTrackMediaMetadata();
        mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.MUSIC_TRACK;
        mediaInfo.metadata.title = song.title;
        mediaInfo.metadata.artist = song.artist;
        mediaInfo.metadata.albumName = song.albumName;
        mediaInfo.metadata.trackNumber = song.track;
        mediaInfo.metadata.images = [
            {'url': song.coverArt }, {'url': song.coverThumb }];
    
        var request = new chrome.cast.media.LoadRequest(mediaInfo);
        request.currentTime = this.state.currentTime;
        var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    
        return castSession.loadMedia(request);
    }

    initCastPlayer() {
        var options = {};

        // Set the receiver application ID to your own (created in the
        // Google Cast Developer Console), or optionally
        // use the chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
        options.receiverApplicationId = chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID;

        // Auto join policy can be one of the following three:
        // ORIGIN_SCOPED - Auto connect from same appId and page origin
        // TAB_AND_ORIGIN_SCOPED - Auto connect from same appId, page origin, and tab
        // PAGE_SCOPED - No auto connect
        options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
        // debugger;

        cast.framework.CastContext.getInstance().setOptions(options);
        this.state.gcastInit = true;
        this.remotePlayer = new cast.framework.RemotePlayer();
        this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
        this.remotePlayerController.addEventListener(
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            this.onCastPlayerConnectedChanged.bind(this)
        );
        
        // this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, this.onCastPlayerCurrentTimeChanged.bind(this));

        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, this.onCastPlayerCurrentTimeChanged.bind(this));
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.ANY_CHANGE, evt => console.log(evt));
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, this.onCastPlayerVolumeLevelChanged.bind(this));

        // this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.PLAYER_STATE_CHANGED, evt => {console.log(evt)});
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_MEDIA_LOADED_CHANGED, this.onCastPlayerIsMediaLoaded.bind(this));   
    }

    onCastPlayerVolumeLevelChanged(evt) {
        this.trigger('updatevolume', { newVolume: evt.value, source: this });
    }

    onCastPlayerIsMediaLoaded(evt) {
        if (!evt.value) {
            this.trigger('songended', {});
        }
    }

    onCastPlayerCurrentTimeChanged(evt) {
        console.log(evt);
        this.trigger('reportplaybacktime',  Object.assign({ newTime: evt.value, originPlayer: 'cast' }));
    }

    onCastPlayerConnectedChanged(evt) {
        this.trigger('changecastplayeractive',  Object.assign({isActive: evt.value}));
        // this.createAction('CHANGE_CAST_PLAYER_ACTIVE', Object.assign({isActive: evt.value}));
    }

    onInit() {
        GCASTAPIAVAILABLE
            .then(() => {
                this.initCastPlayer();
            })
        this.state.watch(['isPlaying', 'playingSong'], (isPlaying, playingSong) => {
            if (isPlaying && playingSong) {
                this.loadSong(playingSong)
            }
        });
    }
}
