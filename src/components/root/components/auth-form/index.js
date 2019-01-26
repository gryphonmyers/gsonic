const defaults = require('defaults-es6');
const SubsonicMusicLibraryInterface = require('../../../../scripts/subsonic-interface');

module.exports = Component => class HomeComponent extends Component {

    static get state() {
        return defaults({
            shouldRemember: false,
            server: null,
            timestamp: null,
            user: null,
            password: null,
        }, super.state);
    }

    static get markup() {
        return require('./index.pug');
    }

    static get styles() {
        return require('./index.css');
    }

    static get components() {
        return {
            MaterialTextField: require('../../../material-text-field'),
            MaterialButton: require('../../../material-button'),
            MaterialSelectionControl: require('../../../material-selection-control')
        };
    }

    submitForm(form) {
        var libraryInterface = new SubsonicMusicLibraryInterface({server: this.state.server});
        return libraryInterface.auth(this.state.user, this.state.password)
            .then(token => {
                this.trigger('createlibraryinterface', {libraryInterface, shouldRemember: this.state.shouldRemember === 'on'});
            });
    }
};
