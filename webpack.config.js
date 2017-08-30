const HTMLPlugin = require('html-webpack-plugin')
const path = require('path')
const webpack = require('webpack')

module.exports = function() {
  return {
    devtool: 'sourcemap',

    entry: './bench/pool-performance',

    output: {
      filename: 'main.js',
      path: path.resolve('build')
    },

    plugins: [
      new HTMLPlugin(),
      new webpack.optimize.ModuleConcatenationPlugin(),
      new webpack.EnvironmentPlugin({
        NODE_ENV: 'production',
        DEBUG: false
      })
    ],

    node: {
      process: false,
      global: false
    },

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
    }
  }
}
