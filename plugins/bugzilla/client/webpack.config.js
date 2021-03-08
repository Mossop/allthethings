const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "src", "index.tsx"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: "/bugzilla/",
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
    "@allthethings/ui": "AllTheThingsUI",
    "@apollo/client": "AllTheThingsUI.Apollo",
  },
  optimization: {
    usedExports: true,
    mangleExports: false,
  },
};
