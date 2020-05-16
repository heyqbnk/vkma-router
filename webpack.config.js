/* eslint-disable */
const {HotModuleReplacementPlugin} = require('webpack');
const path = require('path');

module.exports = {
  mode: 'development',
  entry: './testing/index.tsx',
  watch: true,
  devServer: {
    contentBase: path.join(__dirname, 'public'),
    compress: true,
    watchContentBase: true,
    hot: true,
    port: 9000
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: 'tsconfig-test.json'
          }
        },
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new HotModuleReplacementPlugin({}),
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    pathinfo: false,
    path: path.resolve(__dirname, 'public'),
  },
};
