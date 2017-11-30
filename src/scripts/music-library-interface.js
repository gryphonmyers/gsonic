var supplant = require('small-supplant');
var path = require('path-browserify');

class Artist {
    constructor() {

    }
}

class Song {

}

function normalizeServer(server) {
    server = /^https?:\/\//g.exec(server) ? server : 'http://' + server;
    return server.charAt(server.length - 1) === '/' ? server : server + '/';
}

// songs
// filter (Value is Alpha Match for returned results, may be more then one letter/number)
// add (ISO 8601 Date Format assumed filter method is newer then specified date, however [START]/[END] can be specified to receive only results added between two dates)
// update (ISO 8601 Date Format assumed filter method is newer then specified date, however [START]/[END] can be specified to receive only results updated between two dates)
// exact (Boolean, if true filter is exact rather then fuzzy)
function serialize(obj, prefix) {
  var str = [], p;
  for(p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push((v !== null && typeof v === "object") ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
}

class MusicLibraryInterface {

    constructor(opts) {
        this.server = normalizeServer(opts.server);
        this.token = opts.token || null;
        this.transforms = opts.transforms;
        this.params = opts.params;
        this.apiPath = opts.apiPath;
    }

    formEndpoint(params) {
        params = serialize(Object.assign({}, this.params, params));
        return this.server + this.apiPath + (params ? '?' + params : '');
    }

    auth(params) {
        return this.request(this.formEndpoint(Object.assign(params)))
            .then(payload => this.transforms.auth ? this.transforms.auth.call(this, payload) : payload)
            .then(token => {
                return this.token = token
            });
    }

    request(endpoint, transformName) {
        return fetch(typeof endpoint !== "string" ? this.formEndpoint(Object.assign(endpoint)) : endpoint)
            .then(request => this.transforms.request ? this.transforms.request.call(this, request) : request)
            .then(response => {
                return transformName ? this.transforms[transformName].call(this, response) : response
            })
    }

    getArtists(opts) {

    }

    ping(params) {
        return this.request(params, 'ping');
    }

    songs(params) {
        return this.request(params, 'songs');
    }

    serialize() {
        return JSON.stringify({
            constructorName: this.constructor.name,
            token: this.token,
            server: this.server,
            apiPath: this.apiPath
        });
    }
}

module.exports = MusicLibraryInterface;
