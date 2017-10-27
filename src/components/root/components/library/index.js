module.exports = Component => class HomeComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                foo: 'bar'
            },
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
            }
        }))
    }

    onInit() {
    }
};
