const { createHash } = require("crypto");
const fs = require("fs");
const path = require("path");

const CopyPlugin = require("copy-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackTagsPlugin = require("html-webpack-tags-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const { DefinePlugin } = require("webpack");
const { StatsWriterPlugin } = require("webpack-stats-plugin");

let tsConfig = path.join(
  __dirname,
  "modules",
  "client",
  "init",
  "tsconfig.json",
);

const PKG_REGEX = /^"?([a-zA-Z@\-_.]+)@.*/;
const VERSION_REGEX = /version "([\d.]+)"/;

const externals = {
  react: {
    variable: "React",
    path: "umd/react.production.min.js",
  },
  "react-dom": {
    variable: "ReactDOM",
    path: "umd/react-dom.production.min.js",
  },
  luxon: {
    variable: "luxon",
    path: "build/global/luxon.min.js",
  },
};

function buildExternals() {
  let lockFile = fs.readFileSync("yarn.lock", {
    encoding: "utf8",
  });

  let lines = lockFile.split("\n");
  let pos = 0;
  while (pos < lines.length) {
    let matches = PKG_REGEX.exec(lines[pos]);
    if (matches) {
      let id = matches[1];
      matches = VERSION_REGEX.exec(lines[pos + 1]);
      if (id in externals && matches) {
        externals[id].version = matches[1];
      }
    }
    pos++;
  }

  return Object.entries(externals).map(([id, pkg]) => {
    return {
      type: "js",
      path: `https://unpkg.com/${id}@${pkg.version}/${pkg.path}`,
      publicPath: false,
      external: {
        packageName: id,
        variableName: pkg.variable,
      },
    };
  });
}
let baseSchema = JSON.parse(
  fs.readFileSync(path.join(__dirname, "modules", "schema", "openapi.json"), {
    encoding: "utf8",
  }),
);
let hasher = createHash("sha256");
hasher.update(JSON.stringify(baseSchema));
let schemaVersion = `"${hasher.digest("hex")}"`;

module.exports = {
  mode: "development",
  entry: {
    app: path.join(__dirname, "modules", "client", "init", "index.tsx"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    plugins: [new TsconfigPathsPlugin({ configFile: tsConfig })],
    fallback: {
      assert: "assert",
    },
  },
  output: {
    path: path.join(__dirname, "dist", "web", "app"),
    publicPath: "/app/",
    filename: "[name].[chunkhash].js",
    crossOriginLoading: "anonymous",
    clean: true,
  },
  stats: {
    env: true,
    chunkModules: true,
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: tsConfig,
              projectReferences: true,
              transpileOnly: true,
              compilerOptions: {
                emitDeclarationOnly: false,
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.join(__dirname, "dist", "web", "index.html"),
      template: path.join(__dirname, "modules", "client", "init", "index.ejs"),
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
        ...buildExternals(),
      ],
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.join(__dirname, "static"),
          to: path.join(__dirname, "dist", "web", "static"),
        },
      ],
    }),
    new StatsWriterPlugin({
      filename: "stats.json",
      stats: {
        chunkModules: true,
      },
    }),
    new DefinePlugin({
      SCHEMA_VERSION: schemaVersion,
      "process.env.NODE_DEBUG": JSON.stringify(process.env.NODE_DEBUG),
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {
        configFile: path.join(
          __dirname,
          "modules",
          "client",
          "init",
          "tsconfig.json",
        ),
      },
    }),
  ],
  optimization: {
    usedExports: true,
    mangleExports: false,
    minimize: false,
    splitChunks: {
      chunks: "all",
    },
    chunkIds: "named",
  },
};
