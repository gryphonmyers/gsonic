var App = require('weddell').classes.App;

var app = new App({
    el: '#app',
    Component: require('../components/root')
})

app.init();

module.exports = App;
