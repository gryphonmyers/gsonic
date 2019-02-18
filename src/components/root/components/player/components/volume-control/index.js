const defaults = require('defaults-es6');

module.exports = Component => class VolumeControlComponent extends Component {
    static get styles() {
        return require('./index.css');
    }

    static get state() {
        return defaults({
            volumePercent: function() {
                return `${(this.volume * 100)}%`;
            },
            setVolumeOnMove: false
        }, super.state);
    }

    static get inputs() {
        return ['playingSong', 'isPlaying', 'currentTime', 'volume', 'nextSongs'];
    }

    static get markup() {
        return require('./index.pug');
    }

    onMouseMove(evt) {
        if (this.state.setVolumeOnMove) {
            this.trigger('volumecontrolchange', {newVolume: 1 - (evt.offsetY / evt.target.getBoundingClientRect().height) });
        }
    }

    onMouseUp(evt) {
        this.state.setVolumeOnMove = false;
        this.onMouseMove(evt);
    }

    onMouseLeave(evt) {
        if (this.state.setVolumeOnMove) {
            this.onMouseUp(evt);
        }
    }

    onMouseDown(evt) {
        this.state.setVolumeOnMove = true;
        this.onMouseMove(evt);
    }
}