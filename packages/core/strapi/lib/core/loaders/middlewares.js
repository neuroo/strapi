'use strict';

const { join, extname, basename, resolve, sep } = require('path');
const fse = require('fs-extra');
const { importDefault } = require('@strapi/utils');

// TODO:: allow folders with index.js inside for bigger policies
module.exports = async function loadMiddlewares(strapi) {
  const localMiddlewares = await loadLocalMiddlewares(strapi);
  const internalMiddlewares = require('../../middlewares');

  strapi.container.get('middlewares').add(`global::`, localMiddlewares);
  strapi.container.get('middlewares').add(`strapi::`, internalMiddlewares);
};

const loadLocalMiddlewares = async (strapi) => {
  const dir = strapi.dirs.dist.middlewares;

  if (!(await fse.pathExists(dir))) {
    return {};
  }

  const middlewares = {};
  const paths = await fse.readdir(dir, { withFileTypes: true });

  for (const fd of paths) {
    const { name } = fd;
    if (name.includes('..')) continue; // Skip any paths that may lead to directory traversal
    const fullPath = join(dir, name);

    // Ensure the fullPath is still within the intended directory
    const normalizedPath = resolve(fullPath);
    if (!normalizedPath.startsWith(resolve(dir) + sep)) continue;

    if (fd.isFile() && extname(name) === '.js') {
      const key = basename(name, '.js');
      middlewares[key] = importDefault(fullPath);
    }
  }

  return middlewares;
};
