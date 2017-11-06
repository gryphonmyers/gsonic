
module.exports = Component => class MaterialTextField extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                required: false,
                type: 'text'
            },
            inputs: ['label', 'placeholder', 'required', 'type'],
            markupTemplate: require('./index.pug'),

            components: {
            }
        }))
    }

    static get styles() {
        return require('./index.css');
    }
};
