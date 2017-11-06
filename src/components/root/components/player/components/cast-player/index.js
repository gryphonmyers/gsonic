const GCASTAPIAVAILABLE = new Promise(function(resolve){
    window['__onGCastApiAvailable'] = resolve;
});
var script = document.createElement('script')
script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
document.head.appendChild(script);

function loadSong(song) {
    var mediaInfo = new chrome.cast.media.MediaInfo(song.url, song.type);

    mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
    mediaInfo.metadata.metadataType = chrome.cast.media.MetadataType.GENERIC;
    mediaInfo.metadata.title = song.title;
    // mediaInfo.metadata.images = [
        // {'url': MEDIA_SOURCE_ROOT + this.mediaContents[mediaIndex]['thumb']}];

    var request = new chrome.cast.media.LoadRequest(mediaInfo);

    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    return castSession.loadMedia(request);
};

module.exports = Component => class CastPlayerComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                receiverApplicationId: '4F8B3483',
                remotePlayer: null,
                remotePlayerController: null
            },
            inputs: ['receiverApplicationId', 'isActive', 'playingSong', 'currentTime'],
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
                //SongsView
                //ArtistsView
            }
        }))
    }

    initCastPlayer() {
        var options = {};

        // Set the receiver application ID to your own (created in the
        // Google Cast Developer Console), or optionally
        // use the chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
        options.receiverApplicationId = this.state.receiverApplicationId;

        // Auto join policy can be one of the following three:
        // ORIGIN_SCOPED - Auto connect from same appId and page origin
        // TAB_AND_ORIGIN_SCOPED - Auto connect from same appId, page origin, and tab
        // PAGE_SCOPED - No auto connect
        options.autoJoinPolicy = chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED;
        // debugger;

        cast.framework.CastContext.getInstance().setOptions(options);

        this.state.remotePlayer = new cast.framework.RemotePlayer();
        this.state.remotePlayerController = new cast.framework.RemotePlayerController(this.state.remotePlayer);
        this.state.remotePlayerController.addEventListener(
            cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED,
            this.onCastPlayerConnectedChanged.bind(this)
        );
    }

    onCastPlayerConnectedChanged(evt) {
        this.createAction('CHANGE_CAST_PLAYER_ACTIVE', Object.assign({isActive: evt.value}));
    }

    onInit() {
        GCASTAPIAVAILABLE
            .then(() => {
                this.initCastPlayer();
            })
        this.state.watch(['isActive', 'playingSong'], (isActive, playingSong) => {
            if (isActive && playingSong) {
                loadSong(playingSong)
                    .then(evt => {
                        debugger;
                    });
            }
        });
    }

    onEnter() {
    }
}
