
module.exports = Component => class MaterialButton extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                type: 'submit'
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
