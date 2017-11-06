var AmpacheMusicLibraryInterface = require('../../../../scripts/ampache-interface');

module.exports = Component => class HomeComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                shouldRemember: false,
                server: null,
                timestamp: null,
                user: null,
                password: null,
            },
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
                MaterialTextField: require('../../../material-text-field'),
                MaterialButton: require('../../../material-button'),
                MaterialSelectionControl: require('../../../material-selection-control')
            }
        }))
    }

    submitForm(form) {
        var libraryInterface = new AmpacheMusicLibraryInterface({server: this.state.server});
        return libraryInterface.auth(this.state.user, this.state.password)
            .then(token => {
                this.createAction('createlibraryinterface', {libraryInterface, shouldRemember: this.state.shouldRemember === 'on'});
            });
    }

    onInit() {
    }
};
