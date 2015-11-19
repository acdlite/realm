var path = require('path')
var webpack = require('webpack')

module.exports = function(config) {
  if (process.env.TRAVIS) {
    config.set({
      browsers: ['PhantomJS'],
      frameworks: ['phantomjs-shim', 'mocha', 'sinon'],
      singleRun: true
    })
  } else {
    config.set({
      browsers: ['Chrome'],
      frameworks: ['mocha', 'sinon']
    })
  }

  config.set({
    reporters: ['mocha'],

    files: [
      'tests.webpack.js'
    ],

    preprocessors: {
      'tests.webpack.js': ['webpack', 'sourcemap'],
    },

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        }]
      },
      plugins: [
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('test')
        })
      ]
    },

    webpackMiddleware: {
      noInfo: true
    }
  })
}
