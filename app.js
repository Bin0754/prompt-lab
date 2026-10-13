const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let day=null,filt='全部';
const MODELS={'Grok':'#e5484d','GPT':'#10a37f','Nano Banana':'#f5b700'};
const DARK_TEXT=['Nano Banana'];const tc=m=>DARK_TEXT.includes(m)?'#1a1a1a':'#fff';const mc=m=>MODELS[m]||'#6b6b7b';const mod=e=>e.model||'未知';
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1600)};
async function copy(text){try{await navigator.clipboard.writeText(text)}catch{const a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}toast('已复制到剪贴板 ✓')}
function fill(e){const m={};(e.example.match(/\{[^}]+\}=[^，]+/g)||[]).forEach(p=>{const i=p.indexOf('=');m[p.slice(0,i)]=p.slice(i+1).replace(/[。"“”]/g,'').trim()});return e.template.replace(/\{[^}]+\}/g,k=>m[k]||k)}
async function load(date){
  day=await (await fetch(`data/${date}.json`)).json();
  $('#meta').textContent=`${day.entries.length} 个模板 · ${date}`;
  render();
  if(location.hash.startsWith('#'+date+'/')){const id=location.hash.split('/')[1];const i=day.entries.findIndex(e=>e.id===id);if(i>=0)open(i)}
}
function render(){
  const ms=[...new Set([...Object.keys(MODELS),...day.entries.map(mod)])];
  $('#chips').innerHTML=['全部',...ms].map(m=>`<button class="chip${m===filt?' on':''}" data-m="${esc(m)}">${m==='全部'?'':`<i style="--mc:${mc(m)}"></i>`}${esc(m)}</button>`).join('');
  const list=day.entries.map((e,i)=>[e,i]).filter(([e])=>filt==='全部'||mod(e)===filt);
  $('#empty').hidden=list.length>0;
  $('#grid').innerHTML=list.map(([e,i])=>`<button class="card" data-i="${i}"><div class="thumb"><img loading="lazy" src="${esc(e.image)}" alt="${esc(e.name)}"><span class="mbadge" style="--mc:${mc(mod(e))};--tc:${tc(mod(e))}">${esc(mod(e))}</span><span class="badge num">#${e.id}</span>${e.photoRef?'<span class="badge star">★ 可传照片</span>':''}<span class="dl" role="button" tabindex="0" data-dl="${i}" title="下载图片" aria-label="下载图片">⬇</span></div>
  <div class="body"><h3>${esc(e.name)}</h3><p>${esc(e.tagline)}</p><div class="tags">${(e.scenarios||[]).slice(0,4).map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div></div></button>`).join('');
}
$('#chips').onclick=ev=>{const c=ev.target.closest('.chip');if(c){filt=c.dataset.m;render()}};
let cur=-1;
const visible=()=>day.entries.map((e,i)=>i).filter(i=>filt==='全部'||mod(day.entries[i])===filt);
function step(d){const v=visible();if(!v.length)return;let k=v.indexOf(cur);k=k<0?0:(k+d+v.length)%v.length;open(v[k])}
function open(i){const e=day.entries[i];cur=i;const v=visible();const pos=v.indexOf(i);
  $('#detail').innerHTML=`<div class="lb-stage" id="stage"><img src="${esc(e.image)}" alt="${esc(e.name)}">
    <button class="lb-nav prev" id="prev" aria-label="上一个">‹</button><button class="lb-nav next" id="next" aria-label="下一个">›</button></div>
  <aside class="lb-panel">
    <div class="lb-head"><span class="mbadge lb-m" style="--mc:${mc(mod(e))};--tc:${tc(mod(e))}">${esc(mod(e))}</span><span class="lb-count">${pos+1} / ${v.length}</span><button class="close" id="x" aria-label="关闭">×</button></div>
    <h2>${e.photoRef?'★ ':''}${esc(e.name)}</h2><p class="lb-tag">${esc(e.tagline)}</p>
    <div class="info">${e.ratio?`<span>比例：${esc(e.ratio)}</span>`:''}${e.genDate?`<span>出图日期：${esc(e.genDate)}</span>`:''}${(e.scenarios||[]).map(s=>`<span>${esc(s)}</span>`).join('')}</div>
    <div class="btns"><button class="btn" id="cp">📋 复制提示词</button><button class="btn ghost" id="cpf">复制示例版</button><button class="btn ghost" id="dlb">⬇ 下载图片</button></div>
    <h4>变量</h4><div class="lb-vars"><table>${e.variables.map(v=>`<tr><td>${esc(v.name)}</td><td>${esc(v.desc)}<div class="vx">${esc(v.example)}</div></td></tr>`).join('')}</table></div>
    <div class="lb-tabs"><button class="on" data-t="t">模板</button><button data-t="x">示例</button></div>
    <pre class="lb-box" id="bt">${esc(e.template).replace(/\{[^}]+\}/g,m=>`<span class="v">${m}</span>`)}</pre>
    <div class="lb-box ex" id="bx" hidden>${esc(e.example)}</div>
  </aside>`;
  $('#x').onclick=()=>$('#dlg').close();$('#cp').onclick=()=>copy(e.template);$('#cpf').onclick=()=>copy(fill(e));$('#dlb').onclick=()=>download(e);
  $('#prev').onclick=ev=>{ev.stopPropagation();step(-1)};$('#next').onclick=ev=>{ev.stopPropagation();step(1)};
  $('#stage').onclick=ev=>{if(ev.target.id==='stage')$('#dlg').close()};
  document.querySelectorAll('.lb-tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.lb-tabs button').forEach(x=>x.classList.toggle('on',x===b));$('#bt').hidden=b.dataset.t!=='t';$('#bx').hidden=b.dataset.t!=='x'});
  history.replaceState(null,'',`#${day.date}/${e.id}`);if(!$('#dlg').open){$('#dlg').showModal();document.body.classList.add('lock')}}
document.addEventListener('keydown',ev=>{if(!$('#dlg').open)return;if(ev.key==='ArrowLeft')step(-1);else if(ev.key==='ArrowRight')step(1)});
function fname(e){const c=s=>String(s||'').replace(/[\\/:*?"<>|\s★]+/g,'_').replace(/^_+|_+$/g,'');return [day.date,c(mod(e)),e.id,c(e.name)].filter(Boolean).join('_')+'.jpg'}
async function download(e){try{const r=await fetch(e.image);if(!r.ok)throw 0;const u=URL.createObjectURL(await r.blob());const a=document.createElement('a');a.href=u;a.download=fname(e);document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);toast('开始下载 ✓')}catch{window.open(e.image,'_blank','noopener')}}
$('#grid').addEventListener('keydown',ev=>{const d=ev.target.closest('[data-dl]');if(d&&(ev.key==='Enter'||ev.key===' ')){ev.preventDefault();ev.stopPropagation();download(day.entries[+d.dataset.dl])}});
$('#grid').onclick=ev=>{const d=ev.target.closest('[data-dl]');if(d){ev.stopPropagation();ev.preventDefault();download(day.entries[+d.dataset.dl]);return}const c=ev.target.closest('.card');if(c)open(+c.dataset.i)};
$('#dlg').addEventListener('click',ev=>{if(ev.target.id==='dlg')$('#dlg').close()});
$('#dlg').addEventListener('close',()=>{document.body.classList.remove('lock');history.replaceState(null,'',location.pathname)});
(async()=>{const idx=await (await fetch('data/index.json',{cache:'no-cache'})).json();const dates=[...idx.dates].sort().reverse();
  $('#date').innerHTML=dates.map(d=>`<option>${d}</option>`).join('');const h=location.hash.slice(1).split('/')[0];const d=dates.includes(h)?h:(dates.includes('2026-10-13')?'2026-10-13':dates[0]);
  $('#date').value=d;$('#date').onchange=()=>{history.replaceState(null,'',location.pathname);load($('#date').value)};load(d)})();
