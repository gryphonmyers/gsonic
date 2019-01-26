const defaults = require('defaults-es6');

module.exports = Component => class extends Component {
    static get state(){
        return defaults({
            isActive: false
        }, super.state);
    }

    static get inputs(){
        return ['isActive'];
    }

    static get styles() {
        return require('./index.css');
    }

    static get markup() {
        return require('./index.pug');
    }
}