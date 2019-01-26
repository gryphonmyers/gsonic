module.exports = [
    {
        name: 'home',
        pattern: '/',
        handler: () => {
            // debugger;
            return 'Library';
        },
        children: [
            {
                name: 'albums',
                pattern: 'albums/',
                handler: () => {
                    return 'albums-view';
                }
            },
            {
                name: 'album',
                pattern: 'album/',
                handler: 'album-view'
            },
            {
                name: 'artist',
                pattern: 'artist/',
                handler: evt => {
                    if (!evt.hash) {
                        return Promise.reject({name: 'artists'});
                    }
                    return 'artist-view';
                }
            },
            {
                name: 'artists',
                pattern: 'artists/',
                handler: 'artists-view'
            },
            {
                name: 'searchResults',
                pattern: 'search/',
                handler: 'search-results'
            },
            {
                name: 'rootRedirect',
                pattern: '',
                handler: () => Promise.reject('/artists')
            }
        ]
    }
];
