({
    appDir: '../Client',
    baseUrl: './',
    dir: '../build output',
    paths: {
        require: 'lib/require',
        text: 'lib/text',
        renderer: 'Renderer/src/renderer',
        jsonLoader: 'Core/src/functions/loadRemoteJSON'
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
