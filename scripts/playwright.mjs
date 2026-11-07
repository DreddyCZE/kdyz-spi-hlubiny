// Keep downloads, npm cache and Chromium's temporary profiles within the repository.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
const root = fileURLToPath(new URL('../', import.meta.url));
const localPath = path => fileURLToPath(new URL(`../.cache/${path}/`, import.meta.url));
const browserPath = localPath('ms-playwright');
const tempPath = localPath('tmp');
const npmCache = localPath('npm');
for (const path of [browserPath, tempPath, npmCache]) mkdirSync(path, { recursive: true });
const cli = createRequire(import.meta.url).resolve('@playwright/test/cli');
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd: root, stdio: 'inherit', env: {
    ...process.env, PLAYWRIGHT_BROWSERS_PATH: browserPath,
    TEMP: tempPath, TMP: tempPath, TMPDIR: tempPath,
    npm_config_cache: npmCache, npm_config_update_notifier: 'false',
  },
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
