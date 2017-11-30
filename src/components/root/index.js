var AmpacheMusicLibraryInterface = require('../../scripts/ampache-interface');

module.exports = Component => class RootComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                libraryInterface: null
            },
            markupTemplate: require('./index.pug'),
            components: {
                Library: [require('./components/library'), {libraryInterface: 'libraryInterface'}],
                AuthForm: require('./components/auth-form'),
                Player: require('./components/player')
            }
        }))
    }

    static get styles() {
        return require('./index.css');
    }

    onInit() {
        var libraryInterface = localStorage.getItem('libraryInterface');
        if (libraryInterface) {
            libraryInterface = JSON.parse(libraryInterface);
            switch (libraryInterface.constructorName) {
                case 'AmpacheInterface':
                    libraryInterface = new AmpacheMusicLibraryInterface(libraryInterface);
                    break;
            }
            libraryInterface.ping()
                .then(result => {
                    this.state.libraryInterface = libraryInterface;
                }, err => {
                    this.state.libraryInterface = null;
                    localStorage.removeItem('libraryInterface');
                });
        }
        this.on('createlibraryinterface', evt => {
            if (evt.shouldRemember) {
                localStorage.setItem('libraryInterface', evt.libraryInterface.serialize());
            }
            this.state.libraryInterface = evt.libraryInterface;
        });

        if (process.env.NODE_ENV === 'development') {
            debugger;
        }
    }
};
