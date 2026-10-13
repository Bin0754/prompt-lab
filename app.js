const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let day=null,filt='全部';
const MODELS={'Grok':'#e5484d','GPT':'#10a37f','Nano Banana':'#f5b700'};
const mc=m=>MODELS[m]||'#6b6b7b';const mod=e=>e.model||'未知';
const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('on');setTimeout(()=>t.classList.remove('on'),1600)};
async function copy(text){try{await navigator.clipboard.writeText(text)}catch{const a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}toast('已复制到剪贴板 ✓')}
function fill(e){const m={};(e.example.match(/\{[^}]+\}=[^，]+/g)||[]).forEach(p=>{const i=p.indexOf('=');m[p.slice(0,i)]=p.slice(i+1).replace(/[。"“”]/g,'').trim()});return e.template.replace(/\{[^}]+\}/g,k=>m[k]||k)}
async function load(date){
  day=await (await fetch(`data/${date}.json`)).json();
  $('#meta').textContent=`${day.entries.length} 个模板 · ${date}`;$('#src').href=day.source||'#';$('#src').textContent=day.source||'';
  render();
  if(location.hash.startsWith('#'+date+'/')){const id=location.hash.split('/')[1];const i=day.entries.findIndex(e=>e.id===id);if(i>=0)open(i)}
}
function render(){
  const ms=[...new Set([...Object.keys(MODELS),...day.entries.map(mod)])];
  $('#chips').innerHTML=['全部',...ms].map(m=>`<button class="chip${m===filt?' on':''}" data-m="${esc(m)}">${m==='全部'?'':`<i style="--mc:${mc(m)}"></i>`}${esc(m)}</button>`).join('');
  const list=day.entries.map((e,i)=>[e,i]).filter(([e])=>filt==='全部'||mod(e)===filt);
  $('#empty').hidden=list.length>0;
  $('#grid').innerHTML=list.map(([e,i])=>`<button class="card" data-i="${i}"><div class="thumb"><img loading="lazy" src="${esc(e.image)}" alt="${esc(e.name)}"><span class="mbadge" style="--mc:${mc(mod(e))}">${esc(mod(e))}</span><span class="badge num">#${e.id}</span>${e.photoRef?'<span class="badge star">★ 可传照片</span>':''}</div>
  <div class="body"><h3>${esc(e.name)}</h3><p>${esc(e.tagline)}</p><div class="tags">${(e.scenarios||[]).slice(0,4).map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div></div></button>`).join('');
}
$('#chips').onclick=ev=>{const c=ev.target.closest('.chip');if(c){filt=c.dataset.m;render()}};
function open(i){const e=day.entries[i];
  $('#detail').innerHTML=`<button class="close" aria-label="关闭">×</button><img src="${esc(e.image)}" alt="${esc(e.name)}"><div class="dbody">
  <h2>${e.photoRef?'★ ':''}${esc(e.name)}</h2><p style="color:var(--mut);margin:0">${esc(e.tagline)}</p>
  <div class="info"><span>模型：<b style="color:${mc(mod(e))}">${esc(mod(e))}</b></span>${e.ratio?`<span>比例：${esc(e.ratio)}</span>`:''}${e.genDate?`<span>出图日期：${esc(e.genDate)}</span>`:''}</div>
  <div class="tags">${(e.scenarios||[]).map(s=>`<span class="tag">${esc(s)}</span>`).join('')}</div>
  <div class="btns"><button class="btn" id="cp">📋 复制提示词</button><button class="btn ghost" id="cpf">复制示例版（已填变量）</button></div>
  <h4>变量</h4><table><tr><th>变量</th><th>说明</th><th>示例</th></tr>${e.variables.map(v=>`<tr><td>${esc(v.name)}</td><td>${esc(v.desc)}</td><td>${esc(v.example)}</td></tr>`).join('')}</table>
  <h4>完整模板</h4><pre>${esc(e.template).replace(/\{[^}]+\}/g,m=>`<span class="v">${m}</span>`)}</pre>
  <h4>示例（本图所用变量）</h4><div class="ex">${esc(e.example)}</div></div>`;
  $('#detail .close').onclick=()=>$('#dlg').close();$('#cp').onclick=()=>copy(e.template);$('#cpf').onclick=()=>copy(fill(e));
  history.replaceState(null,'',`#${day.date}/${e.id}`);$('#dlg').showModal();$('#dlg').scrollTop=0}
$('#grid').onclick=ev=>{const c=ev.target.closest('.card');if(c)open(+c.dataset.i)};
$('#dlg').addEventListener('click',ev=>{if(ev.target.id==='dlg')$('#dlg').close()});
$('#dlg').addEventListener('close',()=>history.replaceState(null,'',location.pathname));
(async()=>{const idx=await (await fetch('data/index.json',{cache:'no-cache'})).json();const dates=[...idx.dates].sort().reverse();
  $('#date').innerHTML=dates.map(d=>`<option>${d}</option>`).join('');const h=location.hash.slice(1).split('/')[0];const d=dates.includes(h)?h:dates[0];
  $('#date').value=d;$('#date').onchange=()=>{history.replaceState(null,'',location.pathname);load($('#date').value)};load(d)})();
