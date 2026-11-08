import {rm} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {assemblePages} from './pages-artifact.mjs';
const repo=fileURLToPath(new URL('../',import.meta.url));
// Deletion is restricted to this literal output directory, never supplied by an argument.
const outDir=resolve(repo,'site');
if(outDir!==fileURLToPath(new URL('../site',import.meta.url)))throw Error('Unexpected Pages output');
await rm(outDir,{recursive:true,force:true});
const sha=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim();
await assemblePages({rootDir:process.argv[2]||resolve(repo,'dist'),previewDir:process.argv[3]||resolve(repo,'dist'),outDir,rootSha:process.argv[4]||sha(),previewSha:process.argv[5]||sha()});
console.log('Pages bundle built in site/ with root and /preview/.');
