// Reproduce from the repository root: node artifacts/sharp-upgrade/native-check.mjs before|after
import {createRequire} from 'node:module';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root=createRequire(process.cwd()+'/package.json');
const astro=createRequire(root.resolve('astro/package.json'));
const phase=process.argv[2];assert(['before','after'].includes(phase));
const baselineRoot=process.env.SHARP_BASELINE_ROOT;
const sharp=phase==='before'&&baselineRoot?createRequire(baselineRoot+'/package.json')('sharp'):root('sharp');
const astroSharp=astro('sharp');
assert.equal(sharp.versions.sharp,phase==='before'?'0.34.5':'0.35.5');
assert.equal(astroSharp.versions.sharp,'0.35.5');
const out='artifacts/sharp-upgrade';const hash=b=>createHash('sha256').update(b).digest('hex');
const width=64,height=48,raw=Buffer.alloc(width*height*4);
for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;raw[i]=(x*7+y*3)%256;raw[i+1]=(x*3+y*11)%256;raw[i+2]=(x*13+y*5)%256;raw[i+3]=255;}
const input=await sharp(raw,{raw:{width,height,channels:4}}).png().toBuffer();
const cases=[['synthetic-resize-rotate',input,lib=>lib(input).resize(32,24,{kernel:'nearest'}).rotate(90).flop()],['approved-png-crop',await readFile('design/eikones/index__390.png'),lib=>lib('design/eikones/index__390.png').extract({left:10,top:10,width:64,height:48}).rotate(90).flip()]];
const results=[];
for(const [name,input,pipeline]of cases){
 const png=await pipeline(sharp).png().toBuffer(),decoded=await sharp(png).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const viaAstro=await pipeline(astroSharp).png().toBuffer(),astroDecoded=await astroSharp(viaAstro).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Sharp 0.35 adds hasAlpha metadata; compare dimensions and every decoded byte.
 for(const key of ['width','height','channels','depth','size'])assert.equal(decoded.info[key],astroDecoded.info[key]);
 assert(decoded.data.equals(astroDecoded.data));
 let differentPixels=null;
 if(phase==='after'){
  const prior=await sharp(`${out}/native-before-${name}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.deepEqual(decoded.info,prior.info);differentPixels=0;
  for(let i=0;i<decoded.data.length;i+=4)if(!decoded.data.subarray(i,i+4).equals(prior.data.subarray(i,i+4)))differentPixels++;
  assert.equal(differentPixels,0);
 }
 await writeFile(`${out}/native-${phase}-${name}.png`,png);
 results.push({name,pngSha256:hash(png),decodedSha256:hash(decoded.data),dimensions:decoded.info,astroMatches:true,differentPixelsFromBefore:differentPixels});
}
await writeFile(`${out}/native-${phase}.json`,JSON.stringify({node:process.version,rootSharp:sharp.versions.sharp,astroSharp:astroSharp.versions.sharp,nativeVersions:sharp.versions,results},null,2)+'\n');
console.log(`PASS native ${phase}: root ${sharp.versions.sharp}, Astro ${astroSharp.versions.sharp}, PNG processing and exact decoded pixel comparison`);
