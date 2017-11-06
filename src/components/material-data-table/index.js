
module.exports = Component => class MaterialDataTable extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                type: 'switch',
                title: '',
                label: 'doongus',
                inputID: function() {
                    return (this.$attributes && this.$attributes.id) || "material-selection-control-" + this.$id;
                }
            },
            inputs: ['title'],
            markupTemplate: require('./index.pug'),
            components: {
            }
        }))
    }

    static get styles() {
        return require('./index.css');
    }
};
