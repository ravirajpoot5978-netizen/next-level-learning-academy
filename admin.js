(async()=>{
const sb=window.nllaSupabase;if(!sb)return;
const $=id=>document.getElementById(id);
const msg=(id,text,ok=false)=>{const e=$(id);e.textContent=text;e.className='status '+(ok?'ok':'error');};
const {data:{user},error}=await sb.auth.getUser();
if(error||!user){location.href='admin-login.html';return;}
const {data:profile,error:pe}=await sb.from('profiles').select('full_name,role').eq('id',user.id).single();
if(pe||profile?.role!=='admin'){await sb.auth.signOut();location.href='admin-login.html';return;}
$('welcome').textContent=`स्वागत है ${profile.full_name||user.email} — Admin access verified.`;
$('logout').onclick=async e=>{e.preventDefault();await sb.auth.signOut();location.href='index.html';};
let courses=[];
async function loadCourses(){
 const {data,error}=await sb.from('courses').select('id,title,subject,is_published,created_at').order('created_at',{ascending:false});
 if(error){msg('courseStatus','Courses लोड नहीं हुए: '+error.message);return;}
 courses=data||[];
 $('courseCount').textContent=courses.length;
 $('courseList').innerHTML=courses.length?courses.map(c=>`<li><b>${escapeHtml(c.title)}</b> · ${escapeHtml(c.subject)} · ${c.is_published?'Published':'Draft'}</li>`).join(''):'<li>अभी कोई Course नहीं है।</li>';
 ['chapterCourse','pdfCourse','videoCourse','quizCourse'].forEach(id=>{$(id).innerHTML='<option value="">Course चुनें</option>'+courses.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');});
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
async function loadCounts(){
 for(const [table,id] of [['study_materials','materialCount'],['videos','videoCount']]){
  const {count,error}=await sb.from(table).select('*',{count:'exact',head:true});$(id).textContent=error?'—':count;
 }
}
async function loadChapters(courseId,selectId){
 const el=$(selectId);el.innerHTML='<option value="">Chapter चुनें (Optional)</option>';if(!courseId)return;
 const {data,error}=await sb.from('course_chapters').select('id,title,chapter_number').eq('course_id',courseId).order('chapter_number');
 if(error){el.innerHTML='<option value="">Chapters लोड नहीं हुए</option>';return;}
 (data||[]).forEach(ch=>{const o=document.createElement('option');o.value=ch.id;o.textContent=`${ch.chapter_number}. ${ch.title}`;el.appendChild(o);});
}
$('courseForm').onsubmit=async e=>{e.preventDefault();msg('courseStatus','Course save हो रहा है...',true);
 const {error}=await sb.from('courses').insert({title:$('courseTitle').value.trim(),subject:$('courseSubject').value.trim(),language:$('courseLanguage').value,level:$('courseLevel').value,description:$('courseDescription').value.trim(),is_published:$('coursePublished').checked,created_by:user.id});
 if(error){msg('courseStatus','Error: '+error.message);return;}e.target.reset();msg('courseStatus','Course सफलतापूर्वक सेव हो गया।',true);await loadCourses();
};
$('chapterCourse').onchange=()=>{};
$('chapterForm').onsubmit=async e=>{e.preventDefault();const course_id=$('chapterCourse').value;if(!course_id){msg('chapterStatus','पहले Course चुनें।');return;}
 const {error}=await sb.from('course_chapters').insert({course_id,title:$('chapterTitle').value.trim(),chapter_number:Number($('chapterNumber').value),is_published:$('chapterPublished').checked});
 if(error){msg('chapterStatus','Error: '+error.message);return;}e.target.reset();msg('chapterStatus','Chapter सेव हो गया।',true);await loadChapters(course_id,'pdfChapter');await loadChapters(course_id,'videoChapter');
};
$('pdfCourse').onchange=()=>loadChapters($('pdfCourse').value,'pdfChapter');
$('videoCourse').onchange=()=>loadChapters($('videoCourse').value,'videoChapter');
$('pdfForm').onsubmit=async e=>{e.preventDefault();const file=$('pdfFile').files[0],courseId=$('pdfCourse').value;
 if(!file||file.type!=='application/pdf'){msg('pdfStatus','कृपया सही PDF फाइल चुनें।');return;}
 if(file.size>500*1024*1024){msg('pdfStatus','PDF का आकार 500 MB से कम होना चाहिए।');return;}
 if(file.size>6*1024*1024 && !window.tus){msg('pdfStatus','बड़ी फाइल के लिए Upload Library लोड नहीं हुई। Internet जाँचकर पेज Refresh करें।');return;}
 msg('pdfStatus','PDF Upload शुरू हो रही है...',true);
 const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'_');const path=`${courseId}/${Date.now()}-${safe}`;
 const {data:{session}}=await sb.auth.getSession();
 const progress=$('uploadProgress'),progressText=$('uploadProgressText');
 if(progress)progress.style.width='0%';if(progressText)progressText.textContent='0%';
 let upErr=null;
 if(file.size>6*1024*1024){
   try{
     await new Promise((resolve,reject)=>{
       const upload=new tus.Upload(file,{
         endpoint:`${window.NLLA_SUPABASE_URL}/storage/v1/upload/resumable`,
         retryDelays:[0,1000,3000,5000,10000,20000],
         headers:{authorization:`Bearer ${session.access_token}`,apikey:window.NLLA_SUPABASE_PUBLISHABLE_KEY},
         metadata:{bucketName:'academy-materials',objectName:path,contentType:'application/pdf',cacheControl:'3600'},
         chunkSize:6*1024*1024,
         onError:error=>reject(error),
         onProgress:(bytesUploaded,bytesTotal)=>{const pct=Math.round(bytesUploaded/bytesTotal*100);if(progress)progress.style.width=pct+'%';if(progressText)progressText.textContent=`${pct}% · ${(bytesUploaded/1048576).toFixed(1)} / ${(bytesTotal/1048576).toFixed(1)} MB`;},
         onSuccess:()=>resolve()
       });
       upload.findPreviousUploads().then(previous=>{if(previous.length)upload.resumeFromPreviousUpload(previous[0]);upload.start();}).catch(reject);
     });
   }catch(error){upErr=error;}
 }else{
   const result=await sb.storage.from('academy-materials').upload(path,file,{contentType:'application/pdf',upsert:false});upErr=result.error;
   if(!upErr){if(progress)progress.style.width='100%';if(progressText)progressText.textContent='100%';}
 }
 if(upErr){msg('pdfStatus','Upload Error: '+upErr.message+' · Supabase की Global File Size Limit भी जाँचें।');return;}
 const {data:{publicUrl}}=sb.storage.from('academy-materials').getPublicUrl(path);
 const {error:dbErr}=await sb.from('study_materials').insert({course_id:courseId,chapter_id:$('pdfChapter').value||null,title:$('pdfTitle').value.trim(),file_url:publicUrl,file_type:'PDF',is_published:$('pdfPublished').checked});
 if(dbErr){msg('pdfStatus','फाइल अपलोड हुई, लेकिन रिकॉर्ड सेव नहीं हुआ: '+dbErr.message+' · फाइल पाथ: '+path);return;}
 e.target.reset();$('pdfChapter').innerHTML='<option value="">पहले Course चुनें</option>';msg('pdfStatus','PDF सफलतापूर्वक Upload और सेव हो गई।',true);await loadCounts();
};
$('videoForm').onsubmit=async e=>{e.preventDefault();const url=$('videoUrl').value.trim();if(!/^https?:\/\//i.test(url)){msg('videoStatus','सही Video URL डालें।');return;}
 const {error}=await sb.from('videos').insert({course_id:$('videoCourse').value,chapter_id:$('videoChapter').value||null,title:$('videoTitle').value.trim(),video_url:url,is_published:$('videoPublished').checked});
 if(error){msg('videoStatus','Error: '+error.message);return;}e.target.reset();msg('videoStatus','Video Link सेव हो गया।',true);await loadCounts();
};
async function loadAdminQuizzes(){
 const list=$('adminQuizList'); if(!list)return;
 const {data,error}=await sb.from('quizzes').select('id,title,is_published,created_at,course_id').order('created_at',{ascending:false});
 if(error){list.innerHTML='<li>Quiz लोड नहीं हुए: '+escapeHtml(error.message)+'</li>';return;}
 const quizzes=data||[];
 $('questionQuiz').innerHTML='<option value="">Quiz चुनें</option>'+quizzes.map(q=>`<option value="${q.id}">${escapeHtml(q.title)}${q.is_published?' · Published':' · Draft'}</option>`).join('');
 if(!quizzes.length){list.innerHTML='<li>अभी कोई Quiz नहीं है।</li>';return;}
 const rows=await Promise.all(quizzes.map(async q=>{
  const {count}=await sb.from('quiz_questions').select('*',{count:'exact',head:true}).eq('quiz_id',q.id);
  const course=courses.find(c=>c.id===q.course_id);
  return `<li><b>${escapeHtml(q.title)}</b> · ${escapeHtml(course?.title||'Course')} · ${count??0} Questions · ${q.is_published?'Published':'Draft'} <button type="button" class="action" style="padding:7px 10px;margin:5px" data-quiz-toggle="${q.id}" data-published="${q.is_published}">${q.is_published?'Unpublish':'Publish'}</button><button type="button" class="action" style="padding:7px 10px;margin:5px;background:#b83248" data-quiz-delete="${q.id}">Delete Quiz</button></li>`;
 }));
 list.innerHTML=rows.join('');
 list.querySelectorAll('[data-quiz-toggle]').forEach(btn=>btn.addEventListener('click',async()=>{
  const next=btn.dataset.published!=='true';
  const {error}=await sb.from('quizzes').update({is_published:next}).eq('id',btn.dataset.quizToggle);
  if(error){msg('quizStatus','Publish status बदला नहीं जा सका: '+error.message);return;}
  msg('quizStatus',next?'Quiz Publish हो गया।':'Quiz अब Draft है।',true);await loadAdminQuizzes();
 }));
 list.querySelectorAll('[data-quiz-delete]').forEach(btn=>btn.addEventListener('click',async()=>{if(!confirm('यह Quiz, उसके सभी Questions और उससे जुड़े Student Attempts delete होंगे। क्या जारी रखें?'))return;const {error}=await sb.from('quizzes').delete().eq('id',btn.dataset.quizDelete);if(error){msg('quizStatus','Quiz delete नहीं हुआ: '+error.message);return;}msg('quizStatus','Quiz और उससे जुड़े records delete हो गए।',true);await loadAdminQuizzes();}));
}
$('quizCourse').onchange=()=>loadChapters($('quizCourse').value,'quizChapter');
$('quizForm').onsubmit=async e=>{
 e.preventDefault();const course_id=$('quizCourse').value;if(!course_id){msg('quizStatus','पहले Course चुनें।');return;}
 msg('quizStatus','Quiz सेव हो रहा है...',true);
 const payload={course_id,chapter_id:$('quizChapter').value||null,title:$('quizTitle').value.trim(),description:$('quizDescription').value.trim(),is_published:$('quizPublished').checked};
 const {data,error}=await sb.from('quizzes').insert(payload).select('id').single();
 if(error){msg('quizStatus','Quiz सेव नहीं हुआ: '+error.message);return;}
 e.target.reset();await loadAdminQuizzes();$('questionQuiz').value=data.id;
 msg('quizStatus','Quiz सेव हो गया। अब नीचे Questions जोड़ें।',true);
};
$('questionForm').onsubmit=async e=>{
 e.preventDefault();const quiz_id=$('questionQuiz').value;if(!quiz_id){msg('questionStatus','पहले Quiz चुनें।');return;}
 const options=[0,1,2,3].map(i=>$('option'+i).value.trim());
 if(options.some(v=>!v)){msg('questionStatus','चारों विकल्प भरें।');return;}
 const correct=Number($('correctOption').value);msg('questionStatus','Question सेव हो रहा है...',true);
 const {data:question,error}=await sb.from('quiz_questions').insert({quiz_id,question_text:$('questionText').value.trim(),options}).select('id').single();
 if(error){msg('questionStatus','Question सेव नहीं हुआ: '+error.message);return;}
 const {error:keyError}=await sb.from('quiz_answer_keys').insert({question_id:question.id,correct_option_index:correct,explanation:$('questionExplanation').value.trim()||null});
 if(keyError){await sb.from('quiz_questions').delete().eq('id',question.id);msg('questionStatus','Answer Key सेव नहीं हुई: '+keyError.message);return;}
 const selectedQuiz=$('questionQuiz').value;
 ['questionText','option0','option1','option2','option3','questionExplanation'].forEach(id=>$(id).value='');$('correctOption').value='0';
 msg('questionStatus','Question और Answer Key सफलतापूर्वक सेव हो गए।',true);await loadAdminQuizzes();$('questionQuiz').value=selectedQuiz;
};

let latestQuizResults=[];
const csvCell=value=>'"'+String(value??'').replace(/"/g,'""').replace(/[\r\n]+/g,' ').replace(/^[=+\-@]/,"'$&")+'"';
async function loadAdminQuizResults(){
 const body=$('quizResultsBody');if(!body)return;
 body.innerHTML='<tr><td colspan="5" style="padding:10px">Results लोड हो रहे हैं...</td></tr>';
 const {data:attempts,error}=await sb.from('quiz_attempts').select('id,quiz_id,student_id,score,total_questions,submitted_at').order('submitted_at',{ascending:false}).limit(500);
 if(error){body.innerHTML='<tr><td colspan="5" style="padding:10px">Results लोड नहीं हुए: '+escapeHtml(error.message)+'</td></tr>';msg('quizResultsStatus','कृपया quiz_attempts की Admin RLS policy जाँचें।');return;}
 latestQuizResults=attempts||[];
 const studentIds=[...new Set(latestQuizResults.map(a=>a.student_id))],quizIds=[...new Set(latestQuizResults.map(a=>a.quiz_id))];
 let profileMap={},quizMap={};
 if(studentIds.length){const {data,error:profileError}=await sb.from('profiles').select('id,full_name,phone').in('id',studentIds);if(!profileError)profileMap=Object.fromEntries((data||[]).map(p=>[p.id,p]));}
 if(quizIds.length){const {data,error:quizError}=await sb.from('quizzes').select('id,title').in('id',quizIds);if(!quizError)quizMap=Object.fromEntries((data||[]).map(q=>[q.id,q]));}
 body.innerHTML=latestQuizResults.length?latestQuizResults.map(a=>{const student=profileMap[a.student_id]||{},title=quizMap[a.quiz_id]?.title||'Quiz',pct=a.total_questions?Math.round(a.score/a.total_questions*100):0,date=new Date(a.submitted_at).toLocaleString('en-IN');return `<tr><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(student.full_name||'Student')}<br><small>${escapeHtml(student.phone||'')}</small></td><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(title)}</td><td style="padding:9px;border-top:1px solid #e8eef6">${a.score}/${a.total_questions}</td><td style="padding:9px;border-top:1px solid #e8eef6">${pct}%</td><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(date)}</td></tr>`;}).join(''):'<tr><td colspan="5" style="padding:10px">अभी कोई Quiz Attempt उपलब्ध नहीं है।</td></tr>';
 const total=latestQuizResults.reduce((n,a)=>n+(Number(a.total_questions)||0),0),score=latestQuizResults.reduce((n,a)=>n+(Number(a.score)||0),0);
 $('attemptCount').textContent=latestQuizResults.length;$('averageQuizScore').textContent=total?Math.round(score/total*100)+'%':'—';$('uniqueQuizStudents').textContent=studentIds.length;
 msg('quizResultsStatus',`कुल ${latestQuizResults.length} Attempts लोड हुए। अधिकतम 500 नवीनतम रिकॉर्ड दिखाए जा रहे हैं।`,true);
}
$('refreshQuizResults')?.addEventListener('click',loadAdminQuizResults);
$('exportQuizResults')?.addEventListener('click',()=>{if(!latestQuizResults.length){msg('quizResultsStatus','डाउनलोड करने के लिए कोई परिणाम नहीं है।');return;}const rows=[['Student ID','Quiz ID','Score','Total Questions','Percentage','Submitted At'],...latestQuizResults.map(a=>[a.student_id,a.quiz_id,a.score,a.total_questions,a.total_questions?Math.round(a.score/a.total_questions*100)+'%':'',a.submitted_at])],csv='\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='nlla-quiz-results.csv';link.click();URL.revokeObjectURL(url);msg('quizResultsStatus','CSV रिपोर्ट डाउनलोड हो गई।',true);});


let latestLabQuizResults=[];
async function loadLearningLabQuizResults(){
 const body=$('labQuizResultsBody');if(!body)return;
 body.innerHTML='<tr><td colspan="5" style="padding:10px">Results लोड हो रहे हैं...</td></tr>';
 const {data:attempts,error}=await sb.from('learning_lab_quiz_attempts').select('id,item_id,student_id,score,total_questions,submitted_at').order('submitted_at',{ascending:false}).limit(500);
 if(error){body.innerHTML='<tr><td colspan="5" style="padding:10px">Results उपलब्ध नहीं हैं। पहले supabase/learning-lab-quiz-attempts.sql चलाएँ।</td></tr>';msg('labQuizResultsStatus','Learning Lab Quiz Attempts SQL चलाएँ: '+error.message);return;}
 latestLabQuizResults=attempts||[];
 const studentIds=[...new Set(latestLabQuizResults.map(a=>a.student_id))],itemIds=[...new Set(latestLabQuizResults.map(a=>a.item_id))];
 let profileMap={},itemMap={};
 if(studentIds.length){const {data}=await sb.from('profiles').select('id,full_name,phone').in('id',studentIds);profileMap=Object.fromEntries((data||[]).map(x=>[x.id,x]));}
 if(itemIds.length){const {data}=await sb.from('learning_lab_items').select('id,title').in('id',itemIds);itemMap=Object.fromEntries((data||[]).map(x=>[x.id,x]));}
 body.innerHTML=latestLabQuizResults.length?latestLabQuizResults.map(a=>{const student=profileMap[a.student_id]||{},title=itemMap[a.item_id]?.title||'Custom Quiz',pct=a.total_questions?Math.round(a.score/a.total_questions*100):0,date=new Date(a.submitted_at).toLocaleString('en-IN');return `<tr><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(student.full_name||'Student')}<br><small>${escapeHtml(student.phone||'')}</small></td><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(title)}</td><td style="padding:9px;border-top:1px solid #e8eef6">${a.score}/${a.total_questions}</td><td style="padding:9px;border-top:1px solid #e8eef6">${pct}%</td><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(date)}</td></tr>`;}).join(''):'<tr><td colspan="5" style="padding:10px">अभी कोई Custom Quiz Attempt उपलब्ध नहीं है।</td></tr>';
 const total=latestLabQuizResults.reduce((n,a)=>n+(Number(a.total_questions)||0),0),score=latestLabQuizResults.reduce((n,a)=>n+(Number(a.score)||0),0);
 $('labAttemptCount').textContent=latestLabQuizResults.length;$('labAverageScore').textContent=total?Math.round(score/total*100)+'%':'—';$('labUniqueStudents').textContent=studentIds.length;
 msg('labQuizResultsStatus',`कुल ${latestLabQuizResults.length} Custom Quiz Attempts लोड हुए। अधिकतम 500 नवीनतम रिकॉर्ड दिखाए जा रहे हैं।`,true);
}
$('refreshLabQuizResults')?.addEventListener('click',loadLearningLabQuizResults);
$('exportLabQuizResults')?.addEventListener('click',()=>{if(!latestLabQuizResults.length){msg('labQuizResultsStatus','डाउनलोड करने के लिए कोई परिणाम नहीं है।');return;}const rows=[['Student ID','Content Item ID','Score','Total Questions','Percentage','Submitted At'],...latestLabQuizResults.map(a=>[a.student_id,a.item_id,a.score,a.total_questions,a.total_questions?Math.round(a.score/a.total_questions*100)+'%':'',a.submitted_at])],csv='\ufeff'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='nlla-learning-lab-quiz-results.csv';link.click();URL.revokeObjectURL(url);msg('labQuizResultsStatus','Learning Lab CSV डाउनलोड हो गई।',true);});

let labItemsCache=[];
let editingLabItemId=null;
const labTemplates={
 lesson:{explanation:'यहाँ आसान भाषा में concept समझाएँ।',example:'यहाँ रोजमर्रा का एक उदाहरण लिखें।',keyPoints:['मुख्य बिंदु 1','मुख्य बिंदु 2']},
 quiz:{questions:[{question:'अपना प्रश्न यहाँ लिखें?',options:['विकल्प A','विकल्प B','विकल्प C','विकल्प D'],answer:0,explanation:'सही उत्तर का कारण यहाँ लिखें।'}]},
 typing:{language:'english',level:'beginner',text:'Practice makes learning better.'},
 coding:{language:'html',instructions:'यहाँ coding task लिखें।',starterCode:'',expectedOutcome:'यहाँ expected output लिखें।'},
 game:{instructions:'यहाँ activity के नियम लिखें।',tasks:['Task 1','Task 2'],points:10}
};
function resetLabEditor(){editingLabItemId=null;$('labItemForm').reset();$('labItemContent').value=JSON.stringify(labTemplates.lesson,null,2);$('labTemplate').value='lesson';$('labSaveButton').textContent='नया Content Save करें';$('labCancelEdit').style.display='none';}
function renderLabItems(){const list=$('labItemList');if(!list)return;const q=($('labSearch')?.value||'').trim().toLowerCase(),type=$('labTypeFilter')?.value||'';const rows=labItemsCache.filter(x=>(!type||x.item_type===type)&&(!q||(x.title+' '+x.subject).toLowerCase().includes(q)));list.innerHTML=rows.length?rows.map(x=>`<li><b>${escapeHtml(x.title)}</b> · ${escapeHtml(x.subject)} · ${escapeHtml(x.item_type)} · ${x.is_published?'Published':'Draft'} <button type="button" class="action" style="padding:6px 9px;margin:4px" data-lab-edit="${x.id}">Edit</button><button type="button" class="action" style="padding:6px 9px;margin:4px" data-lab-pub="${x.id}" data-pub="${x.is_published}">${x.is_published?'Unpublish':'Publish'}</button><button type="button" class="action" style="padding:6px 9px;margin:4px;background:#b83248" data-lab-del="${x.id}">Delete</button></li>`).join(''):'<li>इस Filter में कोई Content नहीं मिला।</li>';}
async function loadLearningLabItems(){const list=$('labItemList');if(!list)return;list.innerHTML='<li>Content लोड हो रहा है...</li>';const {data,error}=await sb.from('learning_lab_items').select('id,title,subject,item_type,content,is_published,created_at').order('created_at',{ascending:false});if(error){list.innerHTML='<li>Learning Lab table उपलब्ध नहीं है। पहले learning-lab-content.sql चलाएँ।</li>';return;}labItemsCache=data||[];renderLabItems();}
$('labSearch')?.addEventListener('input',renderLabItems);
$('labTypeFilter')?.addEventListener('change',renderLabItems);
$('labTemplate')?.addEventListener('change',()=>{});
$('applyLabTemplate')?.addEventListener('click',()=>{const type=$('labTemplate').value;$('labItemType').value=type;$('labItemContent').value=JSON.stringify(labTemplates[type]||{},null,2);msg('labItemStatus','Template editor में आ गया है। अपनी जानकारी भरें।',true);});
$('labCancelEdit')?.addEventListener('click',()=>{resetLabEditor();msg('labItemStatus','Edit cancel कर दिया गया।',true);});
$('labItemList')?.addEventListener('click',async e=>{
 const edit=e.target.closest('[data-lab-edit]'),pub=e.target.closest('[data-lab-pub]'),del=e.target.closest('[data-lab-del]');
 if(edit){const item=labItemsCache.find(x=>x.id===edit.dataset.labEdit);if(!item)return;editingLabItemId=item.id;$('labItemTitle').value=item.title;$('labItemSubject').value=item.subject;$('labItemType').value=item.item_type;$('labItemPublished').checked=!!item.is_published;$('labItemContent').value=JSON.stringify(item.content??{},null,2);$('labTemplate').value=item.item_type;$('labSaveButton').textContent='Changes Update करें';$('labCancelEdit').style.display='block';$('labItemTitle').scrollIntoView({behavior:'smooth',block:'center'});msg('labItemStatus','Edit Mode: बदलाव करके Update करें।',true);return;}
 if(pub){const next=pub.dataset.pub!=='true';const {error}=await sb.from('learning_lab_items').update({is_published:next,updated_at:new Date().toISOString()}).eq('id',pub.dataset.labPub);if(error){msg('labItemStatus','Publish status update नहीं हुआ: '+error.message);return;}msg('labItemStatus',next?'Content Publish हो गया।':'Content Draft में चला गया।',true);await loadLearningLabItems();return;}
 if(del){const item=labItemsCache.find(x=>x.id===del.dataset.labDel);if(!confirm(`क्या आप “${item?.title||'इस Content'}” को हमेशा के लिए delete करना चाहते हैं?`))return;const {error}=await sb.from('learning_lab_items').delete().eq('id',del.dataset.labDel);if(error){msg('labItemStatus','Delete failed: '+error.message);return;}if(editingLabItemId===del.dataset.labDel)resetLabEditor();msg('labItemStatus','Content delete हो गया।',true);await loadLearningLabItems();}
});
$('labItemForm')?.addEventListener('submit',async e=>{e.preventDefault();let content;try{content=JSON.parse($('labItemContent').value);}catch(_){msg('labItemStatus','Content JSON सही नहीं है। Commas, quotes और brackets जाँचें।');return;}const wasEditing=!!editingLabItemId;const payload={title:$('labItemTitle').value.trim(),subject:$('labItemSubject').value,item_type:$('labItemType').value,content,is_published:$('labItemPublished').checked,updated_at:new Date().toISOString()};let result;if(editingLabItemId){result=await sb.from('learning_lab_items').update(payload).eq('id',editingLabItemId);}else{payload.created_by=user.id;result=await sb.from('learning_lab_items').insert(payload);}if(result.error){msg('labItemStatus','Save नहीं हुआ: '+result.error.message+' · SQL/RLS जाँचें।');return;}resetLabEditor();msg('labItemStatus',wasEditing?'Content update हो गया।':'नया Learning Content सेव हो गया।',true);await loadLearningLabItems();});
$('labItemContent').value=JSON.stringify(labTemplates.lesson,null,2);
await loadLearningLabItems();

await loadCourses();await loadCounts();await loadAdminQuizzes();await loadAdminQuizResults();
const progressFilter=$('progressCourseFilter');if(progressFilter)progressFilter.innerHTML='<option value="">सभी Courses</option>'+courses.map(c=>`<option value="${c.id}">${escapeHtml(c.title)}</option>`).join('');


// Student course-progress report (read-only; uses the existing chapter_progress schema).
let latestStudentProgress=[];
const progressCsvCell=value=>'"'+String(value??'').replace(/"/g,'""').replace(/[\r\n]+/g,' ').replace(/^[=+\-@]/,"'$&")+'"';
async function loadStudentProgress(){
 const body=$('studentProgressBody');if(!body)return;
 body.innerHTML='<tr><td colspan="5" style="padding:10px">Progress लोड हो रहा है...</td></tr>';
 const selectedCourse=$('progressCourseFilter').value;
 const {data:enrollments,error:enrollmentError}=await sb.from('course_enrollments').select('student_id,course_id,enrolled_at').order('enrolled_at',{ascending:false}).limit(500);
 if(enrollmentError){body.innerHTML='<tr><td colspan="5" style="padding:10px">Enrollments लोड नहीं हुए: '+escapeHtml(enrollmentError.message)+'</td></tr>';msg('studentProgressStatus','Admin enrollment access/RLS policy जाँचें।');return;}
 const all=enrollments||[],filtered=selectedCourse?all.filter(x=>x.course_id===selectedCourse):all;
 const studentIds=[...new Set(filtered.map(x=>x.student_id))],courseIds=[...new Set(filtered.map(x=>x.course_id))];
 let profileMap={},courseMap={},chapterCounts={},doneMap={};
 if(studentIds.length){const {data,error}=await sb.from('profiles').select('id,full_name,phone').in('id',studentIds);if(error){msg('studentProgressStatus','Student profiles नहीं पढ़े जा सके: '+error.message);return;}profileMap=Object.fromEntries((data||[]).map(x=>[x.id,x]));}
 if(courseIds.length){const {data,error}=await sb.from('courses').select('id,title').in('id',courseIds);if(error){msg('studentProgressStatus','Courses नहीं पढ़े जा सके: '+error.message);return;}courseMap=Object.fromEntries((data||[]).map(x=>[x.id,x]));
  const {data:chapters,error:chapterError}=await sb.from('course_chapters').select('id,course_id').in('course_id',courseIds).eq('is_published',true);
  if(chapterError){msg('studentProgressStatus','Published chapters नहीं पढ़े जा सके: '+chapterError.message);return;}
  (chapters||[]).forEach(ch=>chapterCounts[ch.course_id]=(chapterCounts[ch.course_id]||0)+1);
 }
 if(studentIds.length){const {data:progress,error}=await sb.from('chapter_progress').select('student_id,chapter_id').in('student_id',studentIds);if(error){msg('studentProgressStatus','Chapter progress नहीं पढ़ा जा सका: '+error.message+' · chapter-progress.sql और Admin RLS जाँचें।');return;}
  const chapterCourse={};
  if(courseIds.length){const {data:chapters}=await sb.from('course_chapters').select('id,course_id').in('course_id',courseIds).eq('is_published',true);(chapters||[]).forEach(ch=>chapterCourse[ch.id]=ch.course_id);}
  (progress||[]).forEach(x=>{const cid=chapterCourse[x.chapter_id];if(cid)doneMap[x.student_id+'|'+cid]=(doneMap[x.student_id+'|'+cid]||0)+1;});
 }
 latestStudentProgress=filtered.map(x=>{const total=chapterCounts[x.course_id]||0,done=Math.min(doneMap[x.student_id+'|'+x.course_id]||0,total);return {student:profileMap[x.student_id]?.full_name||'Student',phone:profileMap[x.student_id]?.phone||'',course:courseMap[x.course_id]?.title||'Course',done,total,pct:total?Math.round(done/total*100):null,enrolled:x.enrolled_at||''};});
 body.innerHTML=latestStudentProgress.length?latestStudentProgress.map(x=>`<tr><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(x.student)}<br><small>${escapeHtml(x.phone)}</small></td><td style="padding:9px;border-top:1px solid #e8eef6">${escapeHtml(x.course)}</td><td style="padding:9px;border-top:1px solid #e8eef6">${x.total?x.done+'/'+x.total:'—'}</td><td style="padding:9px;border-top:1px solid #e8eef6">${x.pct===null?'N/A':x.pct+'%'}</td><td style="padding:9px;border-top:1px solid #e8eef6">${x.enrolled?escapeHtml(new Date(x.enrolled).toLocaleDateString('en-IN')):'—'}</td></tr>`).join(''):'<tr><td colspan="5" style="padding:10px">इस Filter में कोई Enrollment नहीं मिला।</td></tr>';
 $('progressEnrollmentCount').textContent=filtered.length;$('progressStudentCount').textContent=studentIds.length;
 const measurable=latestStudentProgress.filter(x=>x.pct!==null);$('progressAverage').textContent=measurable.length?Math.round(measurable.reduce((n,x)=>n+x.pct,0)/measurable.length)+'%':'—';
 msg('studentProgressStatus',`कुल ${filtered.length} enrollments दिखाए जा रहे हैं।`,true);
}
$('progressCourseFilter')?.addEventListener('change',loadStudentProgress);
$('refreshStudentProgress')?.addEventListener('click',loadStudentProgress);
$('exportStudentProgress')?.addEventListener('click',()=>{if(!latestStudentProgress.length){msg('studentProgressStatus','डाउनलोड करने के लिए कोई Progress Data नहीं है।');return;}const rows=[['Student','Phone','Course','Completed Chapters','Total Published Chapters','Completion Percentage','Enrolled At'],...latestStudentProgress.map(x=>[x.student,x.phone,x.course,x.done,x.total,x.pct===null?'N/A':x.pct+'%',x.enrolled])],csv='\ufeff'+rows.map(row=>row.map(progressCsvCell).join(',')).join('\r\n'),url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='nlla-student-progress.csv';link.click();URL.revokeObjectURL(url);msg('studentProgressStatus','Student Progress CSV डाउनलोड हो गई।',true);});
if($('studentProgressBody'))await loadStudentProgress();
if($('labQuizResultsBody'))await loadLearningLabQuizResults();

})();