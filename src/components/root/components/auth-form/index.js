var jsSHA = require('jssha');

module.exports = Component => class HomeComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                foo: 'bar',
                authURL: function(){
                    return 'http://' + this.server + 'server/xml.server.php?action=handshake&auth=' + this.passphrase + '&timestamp=' + this.timestamp + '&version=350001&user=' + this.user;
                },
                server: null,
                timestamp: null,
                passphrase: function(){
                    if (this.password && this.timestamp) {
                        let shaObj = new jsSHA("SHA-256", "TEXT");
                        shaObj.update(this.password);
                        var key = shaObj.getHash("HEX");

                        shaObj = new jsSHA("SHA-256", "TEXT");
                        shaObj.update(this.timestamp + key);

                        return shaObj.getHash("HEX");
                    }
                    return null;
                },
                user: null,
                password: null,
            },
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
            }
        }))
    }

    submitForm(form) {
        this.state.timestamp = Math.floor(Date.now() / 1000);
        fetch(this.state.authURL)
            .then(res => res.text(), err => {
                console.error(err.stack);
            })
            .then(data => {
                debugger;
            })

    }

    onInit() {
    }
};
