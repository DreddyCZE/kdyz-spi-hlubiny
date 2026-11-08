import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {assemblePages} from '../scripts/pages-artifact.mjs';
async function fixture(dir,label){await mkdir(join(dir,'src/ui'),{recursive:true});for(const file of ['index.html','blackwater.html','src/ui/app.js','src/ui/blackwater.js'])await writeFile(join(dir,file),label);}
for(const identical of [true,false])test('combined artifact retains root and preview: identical='+identical,async()=>{
 const tmp=await mkdtemp(join(tmpdir(),'ksh-pages-'));try{
 const stable=join(tmp,'stable'),preview=identical?stable:join(tmp,'candidate');await fixture(stable,'stable');if(!identical)await fixture(preview,'preview');
 const args={rootDir:stable,previewDir:preview,outDir:join(tmp,'site'),rootSha:'root-commit',previewSha:identical?'root-commit':'preview-commit'};
 await assemblePages(args);assert.equal(await readFile(join(args.outDir,'index.html'),'utf8'),'stable');assert.equal(await readFile(join(args.outDir,'preview/index.html'),'utf8'),identical?'stable':'preview');
 assert.equal(await readFile(join(args.outDir,'preview/blackwater.html'),'utf8'),identical?'stable':'preview');
 const second={...args,outDir:join(tmp,'second')};await assemblePages(second);assert.equal(await readFile(join(args.outDir,'pages-build.json'),'utf8'),await readFile(join(second.outDir,'pages-build.json'),'utf8'));
 await assert.rejects(assemblePages(args),/empty/);await assert.rejects(assemblePages({...args,outDir:join(stable,'nested')}),/outside/);
 await mkdir(join(preview,'preview'));await assert.rejects(assemblePages({...args,outDir:join(tmp,'invalid')}),/flat build/);
 }finally{await rm(tmp,{recursive:true,force:true});}
});
test('only pages.yml owns deployment; the other workflow is a reusable builder',async()=>{
 const pages=await readFile(new URL('../.github/workflows/pages.yml',import.meta.url),'utf8');const builder=await readFile(new URL('../.github/workflows/blackwater-preview.yml',import.meta.url),'utf8');
 assert.match(pages,/group: github-pages/);assert.match(pages,/cancel-in-progress: false/);assert.match(pages,/uses: .\/\.github\/workflows\/blackwater-preview.yml/);
 assert.match(builder,/workflow_call:/);assert.doesNotMatch(builder,/deploy-pages@|workflow_dispatch:|\n  push:/);assert.match(builder,/git merge-base --is-ancestor/);assert.match(builder,/steps.refs.outputs.root/);assert.match(builder,/scripts\/build-pages.mjs/);
});
