var AmpacheMusicLibraryInterface = require('../../scripts/ampache-interface');

module.exports = Component => class RootComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                libraryInterface: null
            },
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
                Library: [require('./components/library'), {libraryInterface: 'libraryInterface'}],
                AuthForm: require('./components/auth-form'),
                Player: require('./components/player')
            }
        }))
    }

    onInit() {
        var libraryInterface = localStorage.getItem('libraryInterface');
        if (libraryInterface) {
            libraryInterface = JSON.parse(libraryInterface);
            switch (libraryInterface.constructorName) {
                case 'AmpacheInterface':
                    this.state.libraryInterface = new AmpacheMusicLibraryInterface(libraryInterface);
                    break;
            }
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
