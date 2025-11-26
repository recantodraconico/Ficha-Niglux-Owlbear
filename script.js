
// --- Schema mínimo baseado na planilha (você pode editar) ---
const SCHEMA = [
  {key:'forca', label:'Força', type:'number', value:10},
  {key:'agilidade', label:'Agilidade', type:'number', value:10},
  {key:'raciocinio', label:'Raciocínio', type:'number', value:10},
  {key:'vontade', label:'Vontade', type:'number', value:10},
  {key:'percepcao', label:'Percepção', type:'number', value:10},
  // recursos
  {key:'vida_max', label:'Vida Máx', type:'number', value:20},
  {key:'vida_atual', label:'Vida Atual', type:'number', value:20},
  {key:'mana_max', label:'Mana Máx', type:'number', value:10},
  {key:'mana_atual', label:'Mana Atual', type:'number', value:10},
  {key:'stamina_max', label:'Stamina Máx', type:'number', value:10},
  {key:'stamina_atual', label:'Stamina Atual', type:'number', value:10}
];

// Utilitários
function bonusFromAttr(val){
  return Math.floor((Number(val) - 10) / 2);
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

// Render atributos
function renderAttributes(){
  const grid = document.getElementById('attrGrid');
  grid.innerHTML = '';
  SCHEMA.filter(s=>['forca','agilidade','raciocinio','vontade','percepcao'].includes(s.key)).forEach(s=>{
    const div = document.createElement('div'); div.className='attr';
    const label = document.createElement('label'); label.textContent = s.label; div.appendChild(label);
    const input = document.createElement('input'); input.type='number'; input.id=s.key; input.value=s.value;
    input.addEventListener('change', ()=>{ recalcAll(); saveDraft(); });
    div.appendChild(input);
    const bonus = document.createElement('div'); bonus.className='attr-bonus'; bonus.id=s.key+'_bonus'; bonus.textContent='+'+bonusFromAttr(input.value);
    div.appendChild(bonus);
    grid.appendChild(div);
  });
}

// Recursos: atualiza barras
function updateBars(){
  const vidaMax = Number(document.getElementById('vida_max').value || 0);
  const vidaAt = Number(document.getElementById('vida_atual').value || 0);
  const manaMax = Number(document.getElementById('mana_max').value || 0);
  const manaAt = Number(document.getElementById('mana_atual').value || 0);
  const stamMax = Number(document.getElementById('stamina_max').value || 0);
  const stamAt = Number(document.getElementById('stamina_atual').value || 0);

  const vPerc = vidaMax>0 ? clamp(vidaAt/vidaMax,0,1) : 0;
  const mPerc = manaMax>0 ? clamp(manaAt/manaMax,0,1) : 0;
  const sPerc = stamMax>0 ? clamp(stamAt/stamMax,0,1) : 0;

  document.getElementById('vida_fill').style.width = (vPerc*100)+'%';
  document.getElementById('mana_fill').style.width = (mPerc*100)+'%';
  document.getElementById('stamina_fill').style.width = (sPerc*100)+'%';
  document.getElementById('vida_fill').style.background = vidaMax>0 && vidaAt/vidaMax < 0.35 ? 'linear-gradient(90deg,#ff6b6b,#ff9e6b)' : 'linear-gradient(90deg,#7afcff,#4da6ff)';
  document.getElementById('mana_fill').style.background = 'linear-gradient(90deg,#a78bfa,#f0abfc)';
  document.getElementById('stamina_fill').style.background = 'linear-gradient(90deg,#ffd36b,#ffb86b)';
}

// Recalcula valores derivativos
function recalcAll(){
  ['forca','agilidade','raciocinio','vontade','percepcao'].forEach(k=>{
    const v = Number(document.getElementById(k).value || 0);
    document.getElementById(k+'_bonus').textContent = (bonusFromAttr(v)>=0?'+':'')+bonusFromAttr(v);
  });

  const agi = Number(document.getElementById('agilidade').value || 0);
  const per = Number(document.getElementById('percepcao').value || 0);
  document.getElementById('esquiva_calc').value = (agi + per);

  const forca = Number(document.getElementById('forca').value || 0);
  document.getElementById('defesa_calc').value = (Math.floor(forca/2) + 10);

  document.getElementById('dano_calc').value = 'Bonus Força: '+bonusFromAttr(forca)+' + arma equipada (se houver)';
  updateBars();
}

// Inventory logic
let ITEMS = [];
function renderItems(){
  const container = document.getElementById('itemsList'); container.innerHTML='';
  ITEMS.forEach((it,idx)=>{
    const el = document.createElement('div'); el.className='item';
    el.innerHTML = `<div class=it-left><strong>${it.name}</strong><div class=muted>${it.dmg || ''}</div></div>
      <div class=it-right><input class=wt type=number value='${it.weight||0}' data-idx='${idx}'><label><input class=eq type=checkbox data-idx='${idx}' ${it.equipped?'checked':''}> Eq</label><button class=del data-idx='${idx}'>Rem</button></div>`;
    container.appendChild(el);
  });
  recalcWeight();
  attachItemEvents();
}

function attachItemEvents(){
  document.querySelectorAll('.del').forEach(b=>b.addEventListener('click', e=>{ const i = e.target.dataset.idx; ITEMS.splice(i,1); renderItems(); saveDraft(); }));
  document.querySelectorAll('.wt').forEach(inp=>inp.addEventListener('change', e=>{ const i=e.target.dataset.idx; ITEMS[i].weight = Number(e.target.value||0); recalcWeight(); saveDraft(); }));
  document.querySelectorAll('.eq').forEach(ch=>ch.addEventListener('change', e=>{ const i=e.target.dataset.idx; ITEMS.forEach((it,ii)=>it.equipped = ii==i); renderItems(); recalcAll(); saveDraft(); }));
}

function recalcWeight(){
  const total = ITEMS.reduce((s,i)=>s + (Number(i.weight)||0), 0);
  document.getElementById('weightTotal').textContent = total;
}

// Techniques / Talents
let TECHS = [];
function renderTechs(){
  const c = document.getElementById('techList'); c.innerHTML='';
  TECHS.forEach((t,idx)=>{
    const e = document.createElement('div'); e.className='tech';
    e.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><strong>${t.name}</strong><div><button data-idx='${idx}' class='delTech'>Rem</button></div></div>
      <div><small>Tipo: ${t.type} • Custo: ${t.cost}</small></div><div style="margin-top:6px">${t.desc||''}</div>`;
    c.appendChild(e);
  });
  attachTechEvents();
}

function attachTechEvents(){
  document.querySelectorAll('.delTech').forEach(b=>b.addEventListener('click', e=>{ const i=e.target.dataset.idx; TECHS.splice(i,1); renderTechs(); saveDraft(); }));
}

// Persistence (scene/token/local)
async function saveData(scope='scene'){
  const payload = gatherAll();
  try{
    if(window.OBR && scope === 'scene'){
      await OBR.scene.local.set('ficha_meu_sistema_adv', payload);
      alert('Ficha salva na cena.');
    } else if(window.OBR && scope === 'token'){
      const sel = await OBR.selection.get();
      if(sel && sel.length>0){
        const tokenId = sel[0].id;
        await OBR.scene.tokens.set(tokenId, {tags: {ficha_meu_sistema_adv: JSON.stringify(payload)}});
        alert('Ficha salva no token selecionado.');
      } else alert('Selecione um token para salvar.');
    } else {
      localStorage.setItem('ficha_meu_sistema_adv', JSON.stringify(payload));
      alert('Ficha salva no localStorage (fallback).');
    }
  } catch(e){ console.error(e); alert('Erro ao salvar: '+e.message); }
}

async function loadData(){
  try{
    if(window.OBR){
      const data = await OBR.scene.local.get('ficha_meu_sistema_adv');
      if(data){ applyData(data); return; }
      const sel = await OBR.selection.get();
      if(sel && sel.length>0){
        const tokenId = sel[0].id;
        const tok = await OBR.scene.tokens.get(tokenId);
        if(tok && tok.tags && tok.tags.ficha_meu_sistema_adv){
          const d = JSON.parse(tok.tags.ficha_meu_sistema_adv);
          applyData(d); return;
        }
      }
      alert('Nenhuma ficha encontrada na cena ou token selecionado.');
    } else {
      const raw = localStorage.getItem('ficha_meu_sistema_adv');
      if(raw){ applyData(JSON.parse(raw)); return; }
      applyData({});
    }
  } catch(e){ console.error(e); alert('Erro ao carregar: '+e.message); }
}

function gatherAll(){
  const data = {};
  SCHEMA.forEach(s=>{ data[s.key] = document.getElementById(s.key) ? document.getElementById(s.key).value : s.value; });
  data.nome = document.getElementById('nome').value;
  data.raca = document.getElementById('raca').value;
  data.classe_social = document.getElementById('classe_social').value;
  data.idade = document.getElementById('idade').value;
  data.items = ITEMS;
  data.techs = TECHS;
  return data;
}

function applyData(d){
  try{
    SCHEMA.forEach(s=>{ if(d[s.key]!==undefined){ document.getElementById(s.key).value = d[s.key]; } });
    document.getElementById('nome').value = d.nome || '';
    document.getElementById('raca').value = d.raca || '';
    document.getElementById('classe_social').value = d.classe_social || '';
    document.getElementById('idade').value = d.idade || '';
    ITEMS = d.items || [];
    TECHS = d.techs || [];
    renderItems(); renderTechs(); recalcAll();
  }catch(e){ console.error(e); }
}

// Draft autosave (localStorage)
function saveDraft(){ localStorage.setItem('ficha_draft_adv', JSON.stringify(gatherAll())); }

// UI Events
window.addEventListener('DOMContentLoaded', ()=>{
  // render base
  renderAttributes();
  renderItems();
  renderTechs();
  recalcAll();

  // add resource buttons
  document.querySelectorAll('.inc').forEach(b=>b.addEventListener('click', e=>{ const t=e.target.dataset.target; const el=document.getElementById(t); el.value = Number(el.value||0)+1; recalcAll(); saveDraft(); }));
  document.querySelectorAll('.dec').forEach(b=>b.addEventListener('click', e=>{ const t=e.target.dataset.target; const el=document.getElementById(t); el.value = Math.max(0, Number(el.value||0)-1); recalcAll(); saveDraft(); }));

  // items
  document.getElementById('addItem').addEventListener('click', ()=>{
    const n=document.getElementById('newItemName').value.trim();
    if(!n) return alert('Nome do item obrigatório');
    ITEMS.push({name:n, weight:Number(document.getElementById('newItemWeight').value||0), dmg:document.getElementById('newItemDmg').value||'', equipped:document.getElementById('newItemEquip').checked});
    document.getElementById('newItemName').value=''; document.getElementById('newItemWeight').value=''; document.getElementById('newItemDmg').value=''; document.getElementById('newItemEquip').checked=false;
    renderItems(); saveDraft();
  });

  // techs
  document.getElementById('addTech').addEventListener('click', ()=>{
    const n=document.getElementById('newTechName').value.trim();
    if(!n) return alert('Nome da técnica obrigatório');
    TECHS.push({name:n, cost:document.getElementById('newTechCost').value||'', type:document.getElementById('newTechType').value||'', desc:''});
    document.getElementById('newTechName').value=''; document.getElementById('newTechCost').value=''; document.getElementById('newTechType').value='';
    renderTechs(); saveDraft();
  });

  document.getElementById('saveBtn').addEventListener('click', ()=>{
    const useToken = document.getElementById('useTokenSave').checked;
    saveData(useToken ? 'token' : 'scene');
  });
  document.getElementById('loadBtn').addEventListener('click', loadData);

  // try load draft
  const draft = localStorage.getItem('ficha_draft_adv');
  if(draft) applyData(JSON.parse(draft));
});
