const defaults = require('defaults-es6');

module.exports = Component => class LoadingSpinner extends Component {

    static get state() {
        return defaults({}, super.state);
    }

    static get inputs() {
        return [];
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    static get components() {
        return {
            // 'artist-list': require('../artist-list')
        }
    }
}
