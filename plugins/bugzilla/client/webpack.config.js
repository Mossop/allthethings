const path = require("path");

const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");

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
    path: path.join(__dirname, "dist"),
    publicPath: "/bugzilla/",
    filename: "[name].js",
    crossOriginLoading: "anonymous",
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
    }, {
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    }],
  },
  externals: {
    "react": "React",
    "react-dom": "ReactDOM",
    "@material-ui/core": "MaterialUI",
    "@allthethings/client": "AllTheThings",
  },
};
