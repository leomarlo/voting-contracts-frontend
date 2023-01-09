// Import webpack module
var webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Import open browser plugin
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
//Import path module
const path = require("path");

const port = 3006;

module.exports = {
  entry: "./src/index.tsx", //set entry file
  // Resolve to output directory and set file
  output: {
    path: path.resolve("dist/assets"),
    filename: "bundle.js",
    publicPath: "assets"
  },
  // Add Url param to open browser plugin
  // plugins: [new OpenBrowserPlugin({url: `http://localhost:${port}`})],
  // Set dev-server configuration
  mode: process.env.NODE_ENV || "development",
  devServer: {
    static: {
      directory: path.join(__dirname, "dist")
    },
    compress: true,
    port: port,
    allowedHosts: "all"
  },
  resolve: {
    extensions: [".svg", ".js", ".jsx", ".ts", ".tsx"]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Web3 Dapp',
      template: path.resolve(__dirname, 'public', 'templates', 'index.html'),
      filename: path.resolve(__dirname, 'dist', 'index.html') //relative to root of the application
    })
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)?$/,
        exclude: /(node_modules)/,
        use: [{ loader: "babel-loader" }]
      },
      {
        test: /\.(ts|tsx)?$/,
        exclude: /(node_modules)/,
        use: [{ loader: "ts-loader" }]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.svg$/,
        exclude: /(node_modules)/,
        use: ["file-loader"]
      }

    ]
  }
};
