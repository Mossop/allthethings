const externals = require("./externals.json");

exports.externalTags = mode => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return externals.map(pkg => {
    let path = mode == "production" ? pkg.path : pkg.devPath;
    let package = require(`${pkg.id}/package.json`);
    return {
      type: "js",
      path: `https://unpkg.com/${pkg.id}@${package.version}/${path}`,
      publicPath: false,
      attributes: {
        crossorigin: true,
      },
      external: {
        packageName: pkg.id,
        variableName: pkg.variable,
      },
    };
  });
};

function externalPackages() {
  const packages = {};

  for (let { id, variable } of externals) {
    packages[id] = variable;
  }

  return packages;
}
exports.externalPackages = externalPackages;

exports.sharedPackages = () => {
  const packages = {
    ...externalPackages(),
    "@allthethings/ui": "AllTheThingsUI",
    "@apollo/client": "AllTheThingsUI.Apollo",
  };

  return packages;
};
