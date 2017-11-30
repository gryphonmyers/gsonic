var App = require('weddell').classes.App;

var app = new App({
    routes: require('./routes'),
    el: '#app',
    Component: require('../components/root'),
    renderInterval: 16.667
})

app.init();

module.exports = App;
