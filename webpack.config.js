const HTMLPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = function() {
  return {
    devtool: 'cheap-module-inline-sourcemap',

    entry: './bench/pool-performance',

    output: {
      filename: '[name].js',
      path: path.resolve('build')
    },

    plugins: [
      new HTMLPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.EnvironmentPlugin({
        DEBUG: false
      })
    ],

    module: {
      loaders: [
        {
          test: /\.js$/,
          loader: 'buble-loader',
          exclude: /node_modules/,
          options: {
            transforms: {
              modules: false
            }
          }
        }
      ]
    },

    devServer: {
      noInfo: true
    }
  }
}
