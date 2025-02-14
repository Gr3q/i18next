import { readdirSync } from 'node:fs';
// eslint-disable-next-line import/no-extraneous-dependencies
import { defineWorkspace } from 'vitest/config';
import type { UserProjectConfigExport } from 'vitest/config';

const tsDirs = readdirSync('./test/typescript', { withFileTypes: true }).filter((dir) =>
  dir.isDirectory(),
);

export default defineWorkspace(
  /**
   * If you need to test multiple typescript configurations (like misc) simply create a file named tsconfig.{customName}.json
   * and this script will automatically create a new workspace named with the dirName followed by `customName`
   */
  tsDirs.reduce<UserProjectConfigExport[]>((workspaces, dir) => {
    const dirPath = `test/typescript/${dir.name}` as const;

    const tsConfigFiles = readdirSync(dirPath).filter(
      // Do not include temporary vitest tsconfig files
      (it) => it.startsWith('tsconfig.') && it.endsWith('.json') && !it.includes('vitest-temp'),
    );

    tsConfigFiles.forEach((tsConfigFileName) => {
      const workspaceName =
        tsConfigFileName === 'tsconfig.json'
          ? dir.name
          : `${dir.name}-${tsConfigFileName.split('.')[1]}`;

      workspaces.push({
        test: {
          dir: `./${dirPath}`,
          name: workspaceName,
          typecheck: {
            enabled: true,
            include: [`**/${dirPath}/*.test.ts`],
            tsconfig: `./${dirPath}/${tsConfigFileName}`,
          },
        },
      });
    });

    return workspaces;
  }, []),
);
