const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

let tsConfig = path.join(__dirname, "core", "client", "tsconfig.json");

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "core", "client", "index.tsx"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    plugins: [new TsconfigPathsPlugin({ configFile: tsConfig })],
  },
  output: {
    path: path.join(__dirname, "dist", "web", "app"),
    publicPath: "/app/",
    filename: "[name].js",
    crossOriginLoading: "anonymous",
    clean: true,
  },
  stats: {
    env: true,
    chunkModules: true,
  },
  devtool: "source-map",
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [{
        loader: "ts-loader",
        options: {
          configFile: tsConfig,
          projectReferences: true,
          compilerOptions: {
            emitDeclarationOnly: false,
          },
        },
      }],
    }, {
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, "dist", "web", "index.html"),
      template: path.join(__dirname, "core", "client", "index.ejs"),
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
    new CopyPlugin({
      patterns: [{
        from: path.join(__dirname, "static"),
        to: path.join(__dirname, "dist", "web", "static"),
      }],
    }),
  ],
  optimization: {
    usedExports: true,
    mangleExports: false,
  },
};
