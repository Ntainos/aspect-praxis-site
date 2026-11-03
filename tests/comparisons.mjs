import sharp from 'sharp';
const out='artifacts/step-1';
for(const width of [1440,390]) {
 const source=`design/eikones/odigos__${width}.png`;
 const reference=await sharp(source).metadata();
 const current=await sharp(`${out}/odigos-${width}.png`).metadata();
 // Full pages side by side at equal width; blank space preserves vertical scale.
 const height=Math.max(reference.height,current.height);
 await sharp({create:{width:width*2,height,channels:3,background:'#ffffff'}}).composite([{input:source,left:0,top:0},{input:`${out}/odigos-${width}.png`,left:width,top:0}]).png().toFile(`${out}/comparison-${width}.png`);
 const band=width===1440?80:64;
 await sharp({create:{width:width*2,height:band,channels:3,background:'#ffffff'}}).composite([{input:await sharp(`design/eikones/index__${width}.png`).extract({left:0,top:0,width,height:band}).toBuffer(),left:0,top:0},{input:await sharp(`${out}/odigos-${width}.png`).extract({left:0,top:0,width,height:band}).toBuffer(),left:width,top:0}]).png().toFile(`${out}/header-comparison-${width}.png`);
}
