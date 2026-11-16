(async()=>{
const sb=window.nllaSupabase;if(!sb)return;const $=id=>document.getElementById(id),list=$('certificateList');if(!list)return;
const {data:{user},error}=await sb.auth.getUser();if(error||!user)return;
const {data:profile}=await sb.from('profiles').select('full_name').eq('id',user.id).single();
const studentName=profile?.full_name||user.user_metadata?.full_name||'Student';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let rows=[];
async function load(){
list.innerHTML='<p class="muted">Certificates लोड हो रहे हैं...</p>';
const {data:enrollments,error:ee}=await sb.from('course_enrollments').select('course_id').eq('student_id',user.id);
if(ee){list.textContent='Enrollments error: '+ee.message;return;}
const ids=[...new Set((enrollments||[]).map(x=>x.course_id))];if(!ids.length){list.textContent='Certificate के लिए पहले किसी Course में Enroll करें।';return;}
const [{data:courses,error:ce},{data:chapters,error:che},{data:progress,error:pe},{data:certs,error:cere}]=await Promise.all([
sb.from('courses').select('id,title').in('id',ids),sb.from('course_chapters').select('id,course_id').in('course_id',ids).eq('is_published',true),
sb.from('chapter_progress').select('chapter_id').eq('student_id',user.id),sb.from('course_certificates').select('id,course_id,status,certificate_number,issued_at').eq('student_id',user.id)]);
const err=ce||che||pe||cere;if(err){list.textContent='Certificate data error: '+err.message+' · v12 SQL चलाएँ।';return;}
const cm=new Map((courses||[]).map(x=>[x.id,x.title])),done=new Set((progress||[]).map(x=>x.chapter_id)),certMap=new Map((certs||[]).map(x=>[x.course_id,x]));
rows=ids.map(id=>{const ch=(chapters||[]).filter(x=>x.course_id===id);return{id,title:cm.get(id)||'Course',total:ch.length,completed:ch.filter(x=>done.has(x.id)).length,cert:certMap.get(id)||null};});
list.innerHTML=rows.map(x=>{const pct=x.total?Math.round(x.completed/x.total*100):0,c=x.cert;let action='';
if(c?.status==='issued')action=`<p class="certificate-number">Certificate ID: <b>${esc(c.certificate_number)}</b></p><button class="btn certificate-download" data-cert="${esc(c.id)}">Download PDF</button><a class="btn secondary" href="verify-certificate.html?id=${encodeURIComponent(c.certificate_number)}" target="_blank" rel="noopener">Verify Certificate</a>`;
else if(c?.status==='pending')action='<span class="certificate-status pending">Approval Pending</span>';
else if(c?.status==='revoked')action='<span class="certificate-status revoked">Revoked · Admin से संपर्क करें</span>';
else action=x.total&&x.completed===x.total?`<button class="btn certificate-request" data-course="${esc(x.id)}">Certificate Request करें</button>`:'<span class="muted">सभी Chapters पूरे करें</span>';
return `<article class="course-card"><div class="course-tag">Certificate</div><h3>${esc(x.title)}</h3><p>Completed Chapters: <b>${x.completed}/${x.total}</b> · ${pct}%</p><div class="insight-progress-track"><span style="width:${pct}%"></span></div><div class="certificate-actions">${action}</div></article>`;}).join('');
list.querySelectorAll('.certificate-request').forEach(btn=>btn.onclick=async()=>{btn.disabled=true;const {error}=await sb.rpc('request_course_certificate',{p_course_id:btn.dataset.course});if(error){$('certificateStatus').textContent='Request नहीं भेजी गई: '+error.message;btn.disabled=false;return;}$('certificateStatus').textContent='Certificate Request Admin को भेज दी गई है।';await load();});
list.querySelectorAll('.certificate-download').forEach(btn=>btn.onclick=()=>download(btn.dataset.cert));
}
async function download(id){
const cert=rows.map(x=>x.cert).find(x=>x?.id===id),course=rows.find(x=>x.cert?.id===id);
if(!cert||!course||cert.status!=='issued')return;
if(!window.jspdf?.jsPDF||!window.QRCode){$('certificateStatus').textContent='PDF/QR Library लोड नहीं हुई। Internet जाँचें।';return;}
try{const verify=new URL('verify-certificate.html?id='+encodeURIComponent(cert.certificate_number),location.href).href,qr=await QRCode.toDataURL(verify,{width:220,margin:1}),{jsPDF}=window.jspdf,doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
doc.setFillColor(247,250,255);doc.rect(0,0,297,210,'F');doc.setDrawColor(24,91,164);doc.setLineWidth(1.3);doc.rect(9,9,279,192);doc.setTextColor(21,57,101);doc.setFont('helvetica','bold');doc.setFontSize(24);doc.text('NEXT LEVEL LEARNING ACADEMY',148.5,40,{align:'center'});doc.setFontSize(19);doc.text('CERTIFICATE OF COMPLETION',148.5,63,{align:'center'});doc.setFont('helvetica','normal');doc.setFontSize(12);doc.text('This certificate is proudly presented to',148.5,83,{align:'center'});doc.setFont('helvetica','bold');doc.setFontSize(25);doc.text(String(studentName).slice(0,60),148.5,103,{align:'center'});doc.setFont('helvetica','normal');doc.setFontSize(12);doc.text('for successfully completing the course',148.5,120,{align:'center'});doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text(String(course.title).slice(0,75),148.5,137,{align:'center'});doc.setFont('helvetica','normal');doc.setFontSize(10);doc.text('Certificate ID: '+cert.certificate_number,148.5,155,{align:'center'});doc.text('Issued: '+new Date(cert.issued_at).toLocaleDateString('en-IN'),148.5,163,{align:'center'});doc.addImage(qr,'PNG',250,153,24,24);doc.setFontSize(8);doc.text('Scan to verify',262,181,{align:'center'});doc.save('NLLA-'+cert.certificate_number+'.pdf');
}catch(e){$('certificateStatus').textContent='PDF तैयार नहीं हुआ: '+e.message;}
}
$('refreshCertificates').onclick=load;await load();
})();