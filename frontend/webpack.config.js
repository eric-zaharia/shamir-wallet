const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const { ProvidePlugin } = require('webpack');

module.exports = {
    plugins: [
        new NodePolyfillPlugin(),
        new ProvidePlugin({
            process: 'process/browser'
        })
    ],
    resolve: {
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            buffer: require.resolve('buffer/'),
            process: require.resolve('process/browser'),
        }
    }
};
