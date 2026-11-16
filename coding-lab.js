(()=>{'use strict';
const $=id=>document.getElementById(id);
const defaults={
 'index.html':`<!doctype html>
<html>
<head><meta charset="utf-8"><title>My First Page</title></head>
<body>
  <h1>Hello, Learner!</h1>
  <p>Welcome to my first webpage.</p>
  <button id="demoButton">Click Me</button>
</body>
</html>`,
 'style.css':`body { font-family: Arial, sans-serif; padding: 24px; background: #eef5ff; }
h1 { color: #175bb0; }
button { padding: 10px 16px; border: 0; border-radius: 8px; background: #175bb0; color: white; }`,
 'script.js':`document.getElementById('demoButton')?.addEventListener('click',()=>{document.querySelector('p').textContent='You clicked the button!'});\nconsole.log('Hello from Next Level Learning Academy!');`
};
let files={...defaults},current='index.html';
function renderIde(){const code=$('ideCode');if(!code)return;code.value=files[current];$('ideActiveFile').textContent=current;$('ideLines').textContent=Array.from({length:Math.max(1,code.value.split('\n').length)},(_,i)=>i+1).join('\n');document.querySelectorAll('.ide-file').forEach(b=>b.classList.toggle('active',b.dataset.file===current));}
document.querySelectorAll('[data-file]').forEach(b=>b.addEventListener('click',()=>{files[current]=$('ideCode').value;current=b.dataset.file;renderIde();}));
$('ideCode')?.addEventListener('input',()=>{files[current]=$('ideCode').value;$('ideLines').textContent=Array.from({length:Math.max(1,$('ideCode').value.split('\n').length)},(_,i)=>i+1).join('\n');$('ideStatus').textContent='Modified';});
$('ideCode')?.addEventListener('keyup',()=>{$('ideCursor').textContent='Ln '+($('ideCode').value.slice(0,$('ideCode').selectionStart).split('\n').length)+', Col '+($('ideCode').selectionStart-($('ideCode').value.lastIndexOf('\n',$('ideCode').selectionStart-1)+1)+1);});
function buildDoc(){const h=files['index.html']||'',c=files['style.css']||'',j=files['script.js']||'';return h.replace('</head>',`<style>${c.replace(/<\/style/gi,'')}</style></head>`).replace('</body>',`<script>${j.replace(/<\/script/gi,'')}<\/script></body>`);}
$('ideRun')?.addEventListener('click',()=>{files[current]=$('ideCode').value;$('idePreview').srcdoc=buildDoc();$('ideStatus').textContent='Preview updated';});
$('ideReset')?.addEventListener('click',()=>{files={...defaults};current='index.html';renderIde();$('idePreview').srcdoc=buildDoc();$('ideStatus').textContent='Reset complete';});
$('ideDownload')?.addEventListener('click',()=>{files[current]=$('ideCode').value;const blob=new Blob([JSON.stringify(files,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='nlla-coding-project.json';a.click();URL.revokeObjectURL(a.href);});
document.querySelectorAll('[data-editor]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-editor]').forEach(x=>x.classList.toggle('active',x===b));$('vscodePanel').hidden=b.dataset.editor!=='vscode';$('playgroundPanel').hidden=b.dataset.editor!=='playground';}));
function runPlay(){const h=$('playHtml').value,c=$('playCss').value,j=$('playJs').value.replace(/<\/script/gi,'');$('playPreview').srcdoc=`<!doctype html><html><head><style>${c.replace(/<\/style/gi,'')}</style></head><body>${h}<script>try{${j}}catch(e){parent.postMessage({type:'nlla-play-error',message:e.message},'*')}<\/script></body></html>`;$('playConsole').textContent='Preview refreshed. Use browser developer tools for detailed console output.';}
$('playRun')?.addEventListener('click',runPlay);
$('playReset')?.addEventListener('click',()=>{$('playHtml').value=`<h1>Hello, Learner!</h1>\n<p>My first web page.</p>\n<button id="demo">Click Me</button>`;$('playCss').value=`body { font-family: Arial; padding: 24px; background: #eef5ff; }\nh1 { color: #175bb0; }`;$('playJs').value=`document.getElementById('demo')?.addEventListener('click',()=>alert('Great work!'));`;runPlay();});
document.querySelectorAll('[data-playtab]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-playtab]').forEach(x=>x.classList.toggle('active',x===b));const target={html:'playHtml',css:'playCss',js:'playJs'}[b.dataset.playtab];$(target).focus();}));
$('openPlayground')?.addEventListener('click',()=>{document.querySelector('[data-editor="playground"]')?.click();$('playHtml')?.focus();});
renderIde();if($('idePreview'))$('idePreview').srcdoc=buildDoc();runPlay();
})();
