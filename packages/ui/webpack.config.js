const path = require("path");

const { externalPackages } = require("./externals");

module.exports = {
  mode: "development",
  entry: {
    ui: path.join(__dirname, "src", "index.ts"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/ui/",
    filename: "[name].js",
    crossOriginLoading: "anonymous",
    library: "AllTheThingsUI",
    libraryTarget: "umd",
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
          configFile: path.join(__dirname, "tsconfig.json"),
          projectReferences: true,
        },
      }],
    }],
  },
  externals: externalPackages(),
  optimization: {
    usedExports: true,
    mangleExports: false,
  },
};
