'use strict';

const path = require('path');
const resolveConfigOptions = require('./resolve-config-options');
const isUsingTypescript = require('./is-using-typescript');
const fs = require('fs');

const DEFAULT_TS_CONFIG_FILENAME = 'tsconfig.json';

/**
 * Sanitize the directory and config filename to prevent path traversal
 * @param {string} dir
 * @param {string} configFilename
 * @returns {string}
 */
function sanitizePath(dir, configFilename) {
  const normalizedDir = path.normalize(dir).replace(/^(\.\.(\/|\\|$))+/, '');
  const normalizedConfigFilename = path.basename(configFilename);
  return path.join(normalizedDir, normalizedConfigFilename);
}

/**
 * Gets the outDir value from config file (tsconfig)
 * @param {string} dir
 * @param {string | undefined} configFilename
 * @returns {Promise<string | undefined>}
 */
module.exports = async (dir, configFilename = DEFAULT_TS_CONFIG_FILENAME) => {
  const sanitizedPath = sanitizePath(dir, configFilename);
  return (await isUsingTypescript(dir))
    ? resolveConfigOptions(sanitizedPath).options.outDir
    : undefined;
};
