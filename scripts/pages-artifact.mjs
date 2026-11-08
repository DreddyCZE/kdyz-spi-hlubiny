import {cp,mkdir,writeFile,readdir,stat,readFile} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
// Inputs are completed, immutable builds. No network, branch resolution, or timestamps here.
export async function assemblePages({rootDir,previewDir,outDir,rootSha,previewSha}){
 rootDir=resolve(rootDir);previewDir=resolve(previewDir);outDir=resolve(outDir);
 for(const source of [rootDir,previewDir]){
  if(outDir===source||!relative(source,outDir).startsWith('..'))throw Error('Pages output must be outside its inputs');
  await stat(join(source,'index.html'));
  try{await stat(join(source,'preview'));throw Error('Input already contains preview; use a flat build');}catch(error){if(error.code!=='ENOENT')throw error;}
 }
 await stat(join(previewDir,'blackwater.html'));
 if((await readdir(outDir).catch(e=>e.code==='ENOENT'?[]:Promise.reject(e))).length)throw Error('Pages output must be empty');
 await mkdir(outDir,{recursive:true});
 await cp(rootDir,outDir,{recursive:true});
 await cp(previewDir,join(outDir,'preview'),{recursive:true});
 await writeFile(join(outDir,'.nojekyll'),'');
 await writeFile(join(outDir,'pages-build.json'),JSON.stringify({schemaVersion:1,rootSha,previewSha},null,2)+'\n');
 await checkPages(outDir);
}
export async function checkPages(dir){
 for(const file of ['index.html','preview/index.html','preview/blackwater.html','pages-build.json','.nojekyll','preview/src/ui/app.js','preview/src/ui/blackwater.js'])await stat(join(dir,file));
 const manifest=JSON.parse(await readFile(join(dir,'pages-build.json'),'utf8'));
 if(!manifest.rootSha||!manifest.previewSha)throw Error('Missing pinned revisions');
}
