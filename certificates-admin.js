(async()=>{
const sb=window.nllaSupabase;if(!sb)return;const $=id=>document.getElementById(id),body=$('certificateAdminBody');if(!body)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));let cache=[];
async function load(){
body.innerHTML='<tr><td colspan="5">Requests लोड हो रही हैं...</td></tr>';
const {data,error}=await sb.from('course_certificates').select('id,student_id,course_id,status,certificate_number,requested_at,issued_at').order('requested_at',{ascending:false}).limit(500);
if(error){body.innerHTML='<tr><td colspan="5">Load Error: '+esc(error.message)+' · v12 SQL चलाएँ।</td></tr>';return;}
cache=data||[];const sids=[...new Set(cache.map(x=>x.student_id))],cids=[...new Set(cache.map(x=>x.course_id))];
const [{data:profiles},{data:courses}]=await Promise.all([sids.length?sb.from('profiles').select('id,full_name,phone').in('id',sids):Promise.resolve({data:[]}),cids.length?sb.from('courses').select('id,title').in('id',cids):Promise.resolve({data:[]})]);
const pm=new Map((profiles||[]).map(x=>[x.id,x])),cm=new Map((courses||[]).map(x=>[x.id,x]));cache=cache.map(x=>({...x,student:pm.get(x.student_id)?.full_name||'Student',phone:pm.get(x.student_id)?.phone||'',course:cm.get(x.course_id)?.title||'Course'}));
body.innerHTML=cache.length?cache.map(x=>`<tr><td style="padding:9px">${esc(x.student)}<br><small>${esc(x.phone)}</small></td><td style="padding:9px">${esc(x.course)}</td><td style="padding:9px">${esc(x.status)}</td><td style="padding:9px">${esc(x.certificate_number||'—')}</td><td style="padding:9px">${x.status==='pending'?`<button class="action" style="padding:7px 10px" data-issue="${x.id}">Approve & Issue</button>`:''}${x.status==='issued'?`<button class="action" style="padding:7px 10px;background:#b83248" data-revoke="${x.id}">Revoke</button><a style="display:block;margin-top:5px" href="verify-certificate.html?id=${encodeURIComponent(x.certificate_number)}" target="_blank" rel="noopener">Verify</a>`:''}</td></tr>`).join(''):'<tr><td colspan="5">अभी कोई Certificate Request नहीं है।</td></tr>';
body.querySelectorAll('[data-issue]').forEach(b=>b.onclick=async()=>{if(!confirm('Certificate Issue करें?'))return;b.disabled=true;const {error}=await sb.rpc('admin_issue_course_certificate',{p_certificate_id:b.dataset.issue});if(error){$('certificateAdminStatus').textContent=error.message;b.disabled=false;return;}await load();});
body.querySelectorAll('[data-revoke]').forEach(b=>b.onclick=async()=>{if(!confirm('Certificate Revoke करें?'))return;b.disabled=true;const {error}=await sb.rpc('admin_revoke_course_certificate',{p_certificate_id:b.dataset.revoke});if(error){$('certificateAdminStatus').textContent=error.message;b.disabled=false;return;}await load();});
}
$('refreshCertificatesAdmin').onclick=load;
$('exportCertificatesAdmin').onclick=()=>{if(!cache.length)return;const cell=v=>'"'+String(v??'').replace(/"/g,'""').replace(/[\r\n]+/g,' ').replace(/^[=+@-]/,"'$&")+'"',rows=[['Student','Phone','Course','Status','Certificate ID','Requested At','Issued At'],...cache.map(x=>[x.student,x.phone,x.course,x.status,x.certificate_number,x.requested_at,x.issued_at])],url=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='nlla-certificates.csv';a.click();URL.revokeObjectURL(url);};
await load();
})();
