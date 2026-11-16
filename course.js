(async()=>{
  const sb=window.nllaSupabase;
  const $=id=>document.getElementById(id);
  const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const status=(message,isError=false)=>{const el=$('learningStatus');el.textContent=message;el.className='status '+(isError?'error':'ok');};
  if(!sb){status('Supabase client initialize नहीं हुआ। Configuration जाँचें।',true);return;}
  const courseId=new URLSearchParams(location.search).get('id');
  if(!courseId){status('Course ID नहीं मिला। Dashboard से course खोलें।',true);$('courseContent').innerHTML='<div class="learning-empty">कृपया <a href="student-dashboard.html">Student Dashboard</a> पर वापस जाएँ।</div>';return;}
  const {data:{user},error:authError}=await sb.auth.getUser();
  if(authError||!user){location.href='login.html';return;}
  const {data:profile}=await sb.from('profiles').select('role').eq('id',user.id).single();
  if(profile?.role==='admin'){location.href='admin.html';return;}
  $('logout').addEventListener('click',async event=>{event.preventDefault();await sb.auth.signOut();location.href='index.html';});

  const [{data:course,error:courseError},{data:enrollment,error:enrollError}]=await Promise.all([
    sb.from('courses').select('id,title,subject,description,level,language,is_published').eq('id',courseId).eq('is_published',true).maybeSingle(),
    sb.from('course_enrollments').select('course_id').eq('student_id',user.id).eq('course_id',courseId).maybeSingle()
  ]);
  if(courseError||!course){status('Course नहीं मिला या अभी publish नहीं है।',true);$('courseContent').innerHTML='<div class="learning-empty">यह course अभी उपलब्ध नहीं है। <a href="student-dashboard.html">Dashboard पर वापस जाएँ</a></div>';return;}
  if(enrollError||!enrollment){status('इस course का content देखने के लिए पहले enrollment करें।',true);$('courseContent').innerHTML='<div class="learning-empty">आप अभी इस course में enrolled नहीं हैं। <a href="student-dashboard.html">Dashboard पर जाकर Enroll करें</a>।</div>';return;}

  $('courseTitle').textContent=course.title;
  $('courseDescription').textContent=course.description||'अपनी गति से सीखें और हर chapter के बाद progress update करें।';
  $('courseSubject').textContent=course.subject||'Course';
  $('courseLevel').textContent=course.level||'All levels';
  $('courseLanguage').textContent=course.language||'Hindi + English';

  const [{data:chapters,error:chapterError},{data:materials,error:materialError},{data:videos,error:videoError},{data:progress,error:progressError}]=await Promise.all([
    sb.from('course_chapters').select('id,title,chapter_number').eq('course_id',courseId).eq('is_published',true).order('chapter_number'),
    sb.from('study_materials').select('id,title,file_url,file_type,chapter_id').eq('course_id',courseId).eq('is_published',true),
    sb.from('videos').select('id,title,video_url,chapter_id').eq('course_id',courseId).eq('is_published',true),
    sb.from('chapter_progress').select('chapter_id').eq('student_id',user.id)
  ]);
  const loadErrors=[chapterError,materialError,videoError,progressError].filter(Boolean);
  if(loadErrors.length){status('कुछ course data लोड नहीं हो पाया: '+loadErrors.map(e=>e.message).join(' | '),true);}
  const chapterRows=chapters||[],materialRows=materials||[],videoRows=videos||[];
  const done=new Set((progress||[]).map(row=>row.chapter_id));
  const courseMaterials=materialRows.filter(item=>!item.chapter_id),courseVideos=videoRows.filter(item=>!item.chapter_id);

  function safeHttpUrl(raw){try{const u=new URL(raw);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}}
  function youtubeEmbed(raw){try{const u=new URL(raw);if(u.hostname==='youtu.be')return 'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(u.pathname.slice(1));if(['youtube.com','www.youtube.com','m.youtube.com'].includes(u.hostname)){const id=u.searchParams.get('v');if(id)return 'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id);const match=u.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);if(match)return 'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(match[1]);}}catch{}return null;}
  function materialCard(item){const url=safeHttpUrl(item.file_url);return `<article class="resource-card"><span class="resource-type">${esc(item.file_type||'Study material')}</span><h4>${esc(item.title)}</h4>${url?`<a class="resource-action" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open / View ↗</a>`:'<span class="muted">Link unavailable</span>'}</article>`;}
  function videoCard(item){const url=safeHttpUrl(item.video_url),embed=url?youtubeEmbed(url):null;return `<article class="resource-card"><span class="resource-type">Video lesson</span><h4>${esc(item.title)}</h4>${embed?`<div class="video-frame"><iframe src="${esc(embed)}" title="${esc(item.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`:url?`<a class="resource-action" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Watch video ↗</a>`:'<span class="muted">Video link unavailable</span>'}</article>`;}
  function updateProgress(){const total=chapterRows.length,completed=chapterRows.filter(ch=>done.has(ch.id)).length,pct=total?Math.round(completed/total*100):0;$('completedCount').textContent=completed;$('chapterTotal').textContent=total;$('progressBar').style.width=pct+'%';$('progressLabel').textContent=pct+'% course progress';}
  function render(){
    updateProgress();
    const courseResourceMarkup=(courseMaterials.length||courseVideos.length)?`<section class="course-level-resources"><h3>Course resources</h3><div class="chapter-resources">${courseMaterials.map(materialCard).join('')}${courseVideos.map(videoCard).join('')}</div></section>`:'';
    if(!chapterRows.length){$('courseContent').innerHTML=courseResourceMarkup+'<div class="learning-empty">अभी इस course में published chapters नहीं हैं। नए chapters उपलब्ध होने पर यहाँ दिखाई देंगे।</div>';return;}
    const chaptersMarkup=chapterRows.map((ch,index)=>{
      const chMaterials=materialRows.filter(item=>item.chapter_id===ch.id),chVideos=videoRows.filter(item=>item.chapter_id===ch.id),isDone=done.has(ch.id);
      const resources=[...chMaterials.map(materialCard),...chVideos.map(videoCard)].join('')||'<p class="empty-resources">इस chapter के लिए notes या video अभी add नहीं किए गए हैं।</p>';
      return `<article class="chapter-card"><header class="chapter-head"><div class="chapter-title-wrap"><span class="chapter-number">${esc(ch.chapter_number??index+1)}</span><h3>${esc(ch.title)}</h3></div><span class="chapter-state ${isDone?'done':''}" data-state="${esc(ch.id)}">${isDone?'COMPLETED':'NOT STARTED'}</span></header><div class="chapter-resources">${resources}</div><div class="chapter-actions"><button type="button" data-progress="${esc(ch.id)}" data-done="${isDone}">${isDone?'Completed ✓':'Mark as completed'}</button></div></article>`;
    }).join('');
    $('courseContent').innerHTML=courseResourceMarkup+`<div class="chapter-list">${chaptersMarkup}</div>`;
    $('courseContent').querySelectorAll('[data-progress]').forEach(button=>button.addEventListener('click',()=>toggleChapter(button)));
  }
  async function toggleChapter(button){
    const chapterId=button.dataset.progress,isDone=button.dataset.done==='true';button.disabled=true;
    const result=isDone?await sb.from('chapter_progress').delete().eq('student_id',user.id).eq('chapter_id',chapterId):await sb.from('chapter_progress').insert({student_id:user.id,chapter_id:chapterId});
    button.disabled=false;
    if(result.error){status('Progress save नहीं हुई: '+result.error.message,true);return;}
    if(isDone)done.delete(chapterId);else done.add(chapterId);
    status(isDone?'Chapter को incomplete mark किया गया।':'Chapter completed! Progress save हो गई।');render();
  }
  render();
})();
