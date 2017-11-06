
module.exports = Component => class MaterialSelectionControl extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                type: 'switch',
                label: 'doongus',
                inputID: function() {
                    return (this.$attributes && this.$attributes.id) || "material-selection-control-" + this.$id;
                },
                inputAttrs: function() {
                    return this.$attributes ? Object.assign({}, this.$attributes, {id: this.inputID}) : {};
                }
            },
            inputs: ['label', 'onLabel', 'offLabel', 'required', 'type'],
            markupTemplate: require('./index.pug'),
            components: {
            }
        }))
    }

    static get styles() {
        return require('./index.css');
    }
};
