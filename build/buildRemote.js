({
    appDir: "../",
    baseUrl: "./",
    dir: "../build output",
    paths: {
        require: 'lib/require',
        i18n: 'lib/i18n',
        text: 'lib/text',
        renderer: 'Renderer/src/renderer',
        jsonLoader: 'Core/src/functions/loadRemoteJSON'
    },
    optimize: 'uglify2',
    optimizeCss: "standard",
    inlineText: true,
    useStrict: true,
    modules: [
        {name: "main"}
    ],
    fileExclusionRegExp: /\.git/
})
