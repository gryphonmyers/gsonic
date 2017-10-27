module.exports = Component => class RootComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            routes: require('../../scripts/routes'),
            state: {
                token: null
            },
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
                Library: require('./components/library'),
                AuthForm: require('./components/auth-form')
            }
        }))
    }

    onInit() {
        if (process.env.NODE_ENV === 'development') {
            debugger;
        }
    }
};
