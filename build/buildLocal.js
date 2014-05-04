({
    appDir: '../Client',
    baseUrl: './',
    dir: '../build output',
    paths: {
        require: 'lib/require',
        text: 'lib/text',
        renderer: 'renderer/src/renderer',
        jsonLoader: 'core/src/functions/loadLocalJSON'
    },
    optimize: 'uglify2',
    optimizeCss: 'standard',
    inlineText: true,
    useStrict: true,
    modules: [
        {name: 'main'}
    ],
    fileExclusionRegExp: /\.git/
})
