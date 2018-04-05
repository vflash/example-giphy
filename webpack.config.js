'use strict';

var NODE_ENV = 'production'; // development
if (/^(dev|development)$/i.test(process.env.NODE_ENV)) {
    NODE_ENV = 'development';
};

var MiniCssExtractPlugin = require("mini-css-extract-plugin");
var BabiliPlugin = require("babili-webpack-plugin");
var webpack = require('webpack');
var path = require('path');


//process.traceDeprecation = true;
process.noDeprecation = true;

//var devtool = 'source-map';
//var devtool = 'inline-source-map';
var devtool = 'eval-source-map';
//var devtool = 'eval';


var plugins = [
    new webpack.EnvironmentPlugin({NODE_ENV: NODE_ENV}),
    new MiniCssExtractPlugin({
      filename: '/static/css/[name]..css',
      chunkFilename: "[id].css"
    })
]

if (NODE_ENV === 'production') {
    plugins.push(new BabiliPlugin({}));
};


module.exports = {
    plugins: plugins,
    devtool: NODE_ENV === 'production' ? 'source-map' : devtool,
    mode: NODE_ENV !== 'production' ? 'development' : 'production',

    resolveLoader: {
        moduleExtensions: ["-loader"],
    },

	performance: {
        maxEntrypointSize: 400000,
        maxAssetSize: 400000,
        //hints: false,
	},

    resolve: {
        modules: ['node_modules', path.join(__dirname)],
        alias: {
            'pg-tests': (NODE_ENV !== 'production'
                ? path.resolve(__dirname, 'src/app/pg-tests.js')
                : path.resolve(__dirname, 'src/app/null.js')
            ),
        },
    },

    entry: {
        main: "./src/app/app.js",
    },

    output: {
        publicPath: '/',
        filename: "static/js/[name]..js",
        path: __dirname,
    },

    module: {
        rules: [{
            exclude: /node_modules/,
            loader: "babel-loader",
            query: {presets: ['env', 'stage-3', 'react']},
            test:   /\.js$/,
        },{
          test:   /\.(gif|png|jpg|svg|ttf|otf|eot|woff|woff2)$/,
          loader: 'file-loader?emitFile=false&name=[path][name].[ext]'
        },{
            test: /\.css$/,
            use: (NODE_ENV === 'production'
                ? [MiniCssExtractPlugin.loader, 'css-loader?minimize=true']
                : [MiniCssExtractPlugin.loader, 'css-loader']
            ),
        },{
            test: /\.sass$/,
            use: (NODE_ENV === 'production'
                ? [MiniCssExtractPlugin.loader, 'css-loader?minimize=true', 'postcss-loader', 'pxrempx-loader', 'sass-loader?indentedSyntax']
                : [MiniCssExtractPlugin.loader, 'css-loader', 'pxrempx-loader', 'sass-loader?indentedSyntax']
            )
        }]
    },
};

