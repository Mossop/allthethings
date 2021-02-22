const path = require("path");

const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

const lock = require("../../package-lock.json");
const externals = require("./externals.json");

function buildExternals(mode) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return externals.map(pkg => {
    let path = mode == "production" ? pkg.path : pkg.devPath;
    return {
      type: "js",
      path: `https://unpkg.com/${pkg.id}@${lock.dependencies[pkg.id].version}/${path}`,
      publicPath: false,
      attributes: {
        crossorigin: true,
        nonce: "{% nonce %}",
      },
      external: {
        packageName: pkg.id,
        variableName: pkg.variable,
      },
    };
  });
}

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "src", "index.tsx"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    plugins: [
      new TsconfigPathsPlugin(),
    ],
  },
  output: {
    path: path.join(__dirname, "dist", "app"),
    publicPath: "/app/",
    filename: "[name].[chunkhash].js",
    crossOriginLoading: "anonymous",
    library: "AllTheThings",
    libraryTarget: "umd",
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
          configFile: path.join(__dirname, "tsconfig.json"),
          projectReferences: true,
        },
      }],
    }],
  },
  plugins: [
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
        ...buildExternals("development"),
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
