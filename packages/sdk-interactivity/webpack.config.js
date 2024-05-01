const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    externals: {
        '@millicast/sdk': {
            amd: 'millicast',
            root: 'millicast',
            commonjs: 'millicast',
            commonjs2: 'millicast',
        },
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    devtool: 'eval-source-map',
    output: {
        filename: 'millicast-sdk-interactivity.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            name: 'MillicastInteractivity',
            type: 'umd',
        },
    },
    mode: 'production',
};
