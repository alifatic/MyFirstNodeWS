var webpack = require('webpack');
var path = require('path');
var fs = require('fs');
var BabiliPlugin = require("babili-webpack-plugin");
var CopyWebpackPlugin = require('copy-webpack-plugin');
var pkg = require('./package.json');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: {
    app: './app/app.js',
    //vendor: ["body-parser","express", "cors"]//,  "colors", "mssql","multer", "promise", "winston"]
  },
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    /*new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
      // (with more entries, this ensures that no other module
      //  goes into the vendor chunk)
    }),*/
    new CopyWebpackPlugin([
            { from: 'app/config', to: 'config' },
    ]),
    new BabiliPlugin({
      babili: {
        presets: [
          [
            require('babel-preset-babili'),
            {
              mangle: { topLevel: false,keepFnName:false },
              deadcode: false,
            },
          ],
        ],
        plugins: [
          'transform-inline-environment-variables',
        ],
      },
    }),
  ],
  devtool: 'cheap-source-map'
}
