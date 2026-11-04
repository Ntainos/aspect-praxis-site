// Local test harness only. Not included in the static deployment.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=resolve('dist');
const lines=(await readFile('dist/_headers','utf8')).trimEnd().split('\n');
if(lines.shift()!=='/*')throw new Error('Expected a hostname-independent rule');
const headers=Object.fromEntries(lines.map(line=>{const match=/^  ([\w-]+): (.+)$/.exec(line);if(!match)throw new Error('Invalid header');return [match[1],match[2]];}));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.ttf':'font/ttf'};
createServer(async(req,res)=>{
 let file=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname)),status=200;
 if(!file.startsWith(root+'/')&&file!==root){res.writeHead(403);return res.end();}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,headers);return res.end();}
 try{if((await stat(file)).isDirectory())file=resolve(file,'index.html');await stat(file);}catch{file=resolve(root,'404.html');status=404;}
 if(file===resolve(root,'_headers')){file=resolve(root,'404.html');status=404;}
 res.writeHead(status,{...headers,'Content-Type':types[extname(file)]||'application/octet-stream'});
 res.end(req.method==='HEAD'?undefined:await readFile(file));
}).listen(4321,'127.0.0.1',()=>console.log('Local CSP test server: http://127.0.0.1:4321'));
