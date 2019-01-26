const defaults = require('defaults-es6');

module.exports = Component => class AlbumListComponent extends Component {

    static get state() {
        return defaults({
            albums: [],
            isLoading: false
        }, super.state);
    }

    static get inputs() {
        return ['albums'];
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }
}
