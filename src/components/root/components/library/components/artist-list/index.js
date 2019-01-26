const defaults = require('defaults-es6');

module.exports = Component => class ArtistListComponent extends Component {

    static get state() {
        return defaults({
            artists: [],
        }, super.state);
    }

    static get inputs() {
        return ['artists'];
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }
}
