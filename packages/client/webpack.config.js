const path = require("path");

const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "src", "index.ts"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    path: path.join(__dirname, "dist", "app"),
    publicPath: "/app/",
    filename: "[name].[chunkhash].js",
    crossOriginLoading: "anonymous",
  },
  stats: "errors-warnings",
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.[jt]sx?$/,
      exclude: /node_modules/,
      use: [{
        loader: "ts-loader",
        options: {
          transpileOnly: true,
          configFile: path.join(__dirname, "tsconfig.json"),
        },
      }],
    }],
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(__dirname, "tsconfig.json"),
      },
    }),
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, "dist", "index.html"),
      template: path.join(__dirname, "src", "index.ejs"),
      scriptLoading: "defer",
      inject: true,
      minify: false,
    }),
    new HtmlWebpackTagsPlugin({
      tags: [
        {
          type: "css",
          path: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&amp;display=swap",
          publicPath: false,
        },
      ],
    }),
  ],
  optimization: {
    usedExports: true,
    mangleExports: false,
    splitChunks: {
      chunks: "all",
    },
    chunkIds: "named",
  },
};
