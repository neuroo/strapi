import { join, resolve, normalize } from 'path';
import fs from 'fs-extra';

import type { PromptQuestion } from 'node-plop';

export default (
  action: string,
  basePath: string,
  { rootFolder = false } = {}
): Array<PromptQuestion> => {
  const safeBasePath = resolve(normalize(basePath));
  return [
    {
      type: 'list',
      name: 'destination',
      message: `Where do you want to add this ${action}?`,
      choices: [
        ...(rootFolder
          ? [
              {
                name: `Add ${action} to root of project`,
                value: 'root',
              },
            ]
          : [
              {
                name: `Add ${action} to new API`,
                value: 'new',
              },
            ]),
        { name: `Add ${action} to an existing API`, value: 'api' },
        { name: `Add ${action} to an existing plugin`, value: 'plugin' },
      ],
    },
    {
      when: (answers) => answers.destination === 'api',
      type: 'list',
      message: 'Which API is this for?',
      name: 'api',
      async choices() {
        const apiPath = join(safeBasePath, 'api');
        const exists = await fs.pathExists(apiPath);

        if (!exists) {
          throw Error('Couldn\'t find an "api" directory');
        }

        const apiDir = await fs.readdir(apiPath, { withFileTypes: true });
        const apiDirContent = apiDir.filter((fd) => fd.isDirectory());

        if (apiDirContent.length === 0) {
          throw Error('The "api" directory is empty');
        }

        return apiDirContent;
      },
    },
    {
      when: (answers) => answers.destination === 'plugin',
      type: 'list',
      message: 'Which plugin is this for?',
      name: 'plugin',
      async choices() {
        const pluginsPath = join(safeBasePath, 'plugins');
        const exists = await fs.pathExists(pluginsPath);

        if (!exists) {
          throw Error('Couldn\'t find a "plugins" directory');
        }

        const pluginsDir = await fs.readdir(pluginsPath);
        const pluginsDirContent = pluginsDir.filter((api) => {
          const fullPath = join(pluginsPath, api);
          const resolvedPath = resolve(fullPath);
          if (resolvedPath.startsWith(safeBasePath) && fs.lstatSync(resolvedPath).isDirectory()) {
            return true;
          }
          return false;
        });

        if (pluginsDirContent.length === 0) {
          throw Error('The "plugins" directory is empty');
        }

        return pluginsDirContent;
      },
    },
  ];
};
