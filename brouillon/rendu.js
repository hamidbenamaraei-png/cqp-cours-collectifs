const fs=require('fs');const src=fs.readFileSync('/home/claude/cqp-cours-collectifs/bonhommes3d.js','utf8').replace(/if\(typeof module[^\n]*\n/g,'');
const pz=fs.readFileSync(process.argv[2],'utf8');
eval(src+'\n'+pz+'\nglobalThis.R=B3_ETIR;globalThis.S=b3svg;');
let h='<html><body style="margin:0;font-family:sans-serif;background:#fff"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:6px">';
Object.entries(R).forEach(([k,v],i)=>{h+=`<div style="border:1px solid #ccc;padding:4px"><div style="font-size:12px;font-weight:700">${i+1}. ${k.split('|').slice(1).join(' – ')}</div><div style="display:flex">${v.map(f=>S(f,f.lab).replace(/ width="\d+"/,' style="flex:1;width:100%;height:auto"')).join('')}</div></div>`});
fs.writeFileSync('sheet.html',h+'</div></body></html>');console.log(Object.keys(R).length);
