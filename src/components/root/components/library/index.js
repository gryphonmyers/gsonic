module.exports = Component => class LibraryComponent extends Component {
    constructor(opts) {
        super(Object.assign(opts, {
            state: {
                foo: 'bar',
                songs: []
            },
            inputs: ['libraryInterface'],
            markupTemplate: require('./index.pug'),
            styles: require('./index.css'),
            components: {
                SongsView: [require('./components/songs-view'), {libraryInterface: 'libraryInterface'}]
            }
        }))
    }

    onInit() {
    }

    onEnter() {
    }
}
