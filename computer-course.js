(()=>{'use strict';
const search=document.getElementById('computerSearch');
const cards=[...document.querySelectorAll('.hub-chapter-card')];
const filters=[...document.querySelectorAll('[data-filter]')];
let active='all';
function apply(){
 const q=(search?.value||'').trim().toLowerCase();let shown=0;
 cards.forEach(card=>{const ok=(active==='all'||card.dataset.category===active)&&(!q||card.dataset.search.includes(q));card.hidden=!ok;if(ok)shown++;});
 const empty=document.getElementById('computerNoResults');if(empty)empty.hidden=shown!==0;
}
search?.addEventListener('input',apply);
filters.forEach(b=>b.addEventListener('click',()=>{active=b.dataset.filter;filters.forEach(x=>x.classList.toggle('active',x===b));apply();}));
})();