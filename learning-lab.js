(()=>{'use strict';
const $=id=>document.getElementById(id);
const subjects=[['⌘','Computer','CPU, memory, input-output devices और Internet की शुरुआत।','Computer एक electronic device है जो data को process करके information देता है।'],['➗','Mathematics','Number system, fractions, percentage और basic algebra.','गणित में हम संख्याओं, माप और patterns को समझते हैं। उदाहरण: 25% का अर्थ 100 में 25 भाग।'],['🧩','Reasoning','Series, analogy, classification और directions.','Reasoning का अर्थ है दिए गए facts के आधार पर logic से निष्कर्ष निकालना।'],['🔬','Science','Matter, force, energy, plants और human body.','Science observation और experiments से प्राकृतिक दुनिया को समझने का तरीका है।'],['🔤','English','Vocabulary, grammar, reading और sentence building.','A sentence expresses a complete thought. Example: I learn every day.'],['अ','Hindi','व्याकरण, शब्द-भेद, वाक्य और पठन.','भाषा विचारों और भावों को व्यक्त करने का माध्यम है। संज्ञा किसी व्यक्ति, स्थान, वस्तु या भाव का नाम है।'],['🌍','GK / General Studies','India, geography, history, constitution और current basics.','भारत का संविधान 26 जनवरी 1950 को लागू हुआ। सामान्य अध्ययन में इतिहास, भूगोल, नागरिकशास्त्र और विज्ञान शामिल हैं।'],['🎒','School Subjects','Class 6–12 के लिए concept-first learning.','किसी भी विषय को समझने के लिए definition, example और practice तीनों जरूरी हैं।'],['</>','Programming','HTML, CSS, Python और computational thinking.','Programming instructions का समूह है जिससे computer कोई task करता है।']];
if($('subjectGrid')) $('subjectGrid').innerHTML=subjects.map(x=>`<article class="lab-card"><div class="emoji">${x[0]}</div><h3>${x[1]}</h3><p>${x[2]}</p><details><summary>Quick concept</summary><p>${x[3]}</p></details></article>`).join('');
const typingSets={english:['asdf jkl; asdf jkl;','learn code practice every day','The quick brown fox jumps over the lazy dog.'],mangal:['कमल जल में खिलता है।','मेरा भारत महान है। मैं प्रतिदिन कुछ नया सीखता हूँ।','ज्ञान, अभ्यास और धैर्य से सफलता मिलती है।'],krutidev:['Remington अभ्यास: अपने keyboard layout के अनुसार दिए गए शब्द टाइप करें।','Kruti Dev 010 में legacy font और Remington layout का अभ्यास करें।','आज का अभ्यास: नियमित टाइपिंग से गति और शुद्धता बेहतर होती है।']};
if($('typingMode')){
 const words={english:['learn','practice','focus','keyboard','success','computer','student','knowledge','creative','improve','journey','future'],mangal:['ज्ञान','अभ्यास','किताब','विद्यालय','कंप्यूटर','सफलता','समय','परिश्रम','विचार','शिक्षा'],krutidev:['LEARN','PRACTICE','FOCUS','KEYBOARD','SUCCESS','COMPUTER','STUDENT','KNOWLEDGE']};
 const sentences={english:['Learning a little every day creates strong skills.','Practice with patience and focus to improve your accuracy.','A good learner asks questions and explores new ideas.'],mangal:['नियमित अभ्यास से ज्ञान और कौशल दोनों बढ़ते हैं।','समय का सही उपयोग हमें अपने लक्ष्य तक पहुँचाता है।','हर दिन कुछ नया सीखना एक अच्छी आदत है।'],krutidev:['Regular practice helps improve typing speed and confidence.','A good learner focuses on accuracy before speed.','Learn something useful and practice it every day.']};
 let started=0,tick=null,seconds=0,errors=0,completed=0,targetText='',roundWords=[],roundIndex=0,finished=false;
 const mode=()=>$('typingMode').value, game=()=>$('typingGameMode')?.value||'classic';
 const bestKey=()=>`nlla_typing_best_${mode()}_${game()}`;
 function getBest(){try{return localStorage.getItem(bestKey())||'0';}catch(_){return '0';}}
 function saveBest(value){try{localStorage.setItem(bestKey(),String(value));}catch(_){}}
 function setTarget(text){targetText=text;$('typingTarget').textContent=text;$('typingInput').value='';$('typingInput').style.fontFamily=mode()==='krutidev'? '"Kruti Dev 010", "Noto Sans Devanagari", sans-serif':'inherit';$('typingInput').focus();}
 function begin(){clearInterval(tick);$('typingInput').disabled=false;started=Date.now();seconds=0;errors=0;completed=0;roundIndex=0;finished=false;roundWords=[];$('typingInput').value='';$('typingStatus').textContent='शुरू करें! सही टाइपिंग पर ध्यान दें।';if(game()==='word-rain'||game()==='sprint'){const pool=[...words[mode()]].sort(()=>Math.random()-.5);roundWords=Array.from({length:18},(_,i)=>pool[i%pool.length]);setTarget(roundWords[0]);}else if(game()==='sentence'){const pool=sentences[mode()];setTarget(pool[Math.floor(Math.random()*pool.length)]);}else if(game()==='daily'){const d=new Date(),seed=(d.getFullYear()+d.getMonth()+d.getDate())%sentences[mode()].length;setTarget(sentences[mode()][seed]);}else if(game()==='accuracy'){setTarget(sentences[mode()][1]);}else{setTarget(typingSets[mode()][Number($('typingLevel').value)]);}
 tick=setInterval(()=>{seconds=Math.floor((Date.now()-started)/1000);stats();if((game()==='word-rain'||game()==='sprint')&&seconds>=60)finish('समय पूरा हुआ!');},500);stats();}
 function stats(){const typed=$('typingInput').value||'',elapsed=started?Math.max(1,(Date.now()-started)/1000):0;let correct=0;for(let i=0;i<Math.min(typed.length,targetText.length);i++)if(typed[i]===targetText[i])correct++;const accuracy=typed.length?Math.max(0,Math.round(correct/typed.length*100)):100;$('typingAccuracy').textContent=mode()==='krutidev'?'Legacy':accuracy+'%';$('typingTime').textContent=((game()==='word-rain'||game()==='sprint')?Math.max(0,60-Math.floor(elapsed)):Math.floor(elapsed))+'s';const wordsDone=(game()==='word-rain'||game()==='sprint')?completed+(typed.trim().split(/\s+/).filter(Boolean).length):typed.trim().split(/\s+/).filter(Boolean).length;$('typingWpm').textContent=elapsed?Math.round(wordsDone/(elapsed/60)):0;if($('typingErrors'))$('typingErrors').textContent=errors;if($('typingBest'))$('typingBest').textContent=getBest();}
 function finish(message){if(finished)return;finished=true;clearInterval(tick);const wpm=Number($('typingWpm').textContent)||0;const old=Number(getBest());if(wpm>old)saveBest(wpm);$('typingStatus').textContent=message+` आपका WPM: ${wpm}. सही टाइपिंग और नियमित अभ्यास जारी रखें।`;stats();}
 function handleInput(){if(!started||finished)return;const typed=$('typingInput').value;let bad=0;for(let i=0;i<typed.length;i++)if(typed[i]!==targetText[i])bad++;errors=bad;stats();if(typed===targetText){completed++;if(game()==='word-rain'||game()==='sprint'){roundIndex++;if(roundIndex>=roundWords.length){finish('बहुत बढ़िया! आपने सभी शब्द पूरे कर लिए।');return;}setTarget(roundWords[roundIndex]);$('typingStatus').textContent=`शानदार! ${roundIndex} शब्द पूरे। अगला शब्द टाइप करें।`;stats();}else finish('शानदार! आपने challenge पूरा कर लिया।');}}
 $('typingStart').onclick=begin;$('typingInput').addEventListener('input',handleInput);$('typingMode').onchange=()=>{started=0;clearInterval(tick);$('typingInput').value='';$('typingInput').disabled=true;$('typingTarget').textContent=typingSets[mode()][Number($('typingLevel').value)];$('typingStatus').textContent=mode()==='krutidev'?'Kruti Dev 010 font और Remington keyboard layout आपके device में उपलब्ध होना चाहिए।':'';stats();};$('typingLevel').onchange=()=>{if(game()==='classic')begin();};if($('typingGameMode'))$('typingGameMode').onchange=begin;$('typingNext').onclick=()=>{if(game()==='classic')$('typingLevel').value=String((Number($('typingLevel').value)+1)%3);begin();};$('typingTarget').textContent=typingSets[mode()][0];$('typingInput').disabled=true;stats();
}
if($('codingLanguage')){
 $('codingLanguage').onchange=()=>{const py=$('codingLanguage').value==='python';$('pythonPanel').hidden=!py;$('htmlEditorPanel').hidden=py;};$('runHtml').onclick=()=>{$('htmlPreview').srcdoc=$('htmlCode').value;};$('runHtml').click();
}
if($('gameBoard')) {
const emojis=['📘','💡','⌨️','🧮','🔬','🌍'];let cards=[],first=null,lock=false,moves=0,matches=0;function newGame(){cards=[...emojis,...emojis].sort(()=>Math.random()-.5);first=null;lock=false;moves=0;matches=0;$('gameMoves').textContent='Moves: 0';$('gameMatches').textContent='Pairs: 0 / 6';$('gameStatus').textContent='सभी pairs खोजें!';$('gameBoard').innerHTML=cards.map((v,i)=>`<button class="game-tile" data-i="${i}" aria-label="Hidden card">?</button>`).join('');$('gameBoard').querySelectorAll('button').forEach(b=>b.onclick=()=>flip(Number(b.dataset.i),b));}function flip(i,b){if(lock||b.classList.contains('revealed')||b.textContent!=='?')return;b.textContent=cards[i];b.classList.add('revealed');if(first===null){first={i,b};return;}moves++;$('gameMoves').textContent='Moves: '+moves;if(cards[first.i]===cards[i]){matches++;$('gameMatches').textContent=`Pairs: ${matches} / 6`;first=null;if(matches===6)$('gameStatus').textContent=`बहुत बढ़िया! आपने ${moves} moves में game पूरा किया।`;}else{lock=true;const prev=first;first=null;setTimeout(()=>{prev.b.textContent='?';b.textContent='?';prev.b.classList.remove('revealed');b.classList.remove('revealed');lock=false;},700);}}$('newGame').onclick=newGame;newGame();

}
if($('chatForm')) {
const explain=[[/\bcpu\b|processor/i,'CPU (Central Processing Unit) computer का मुख्य processing unit है। यह instructions को execute करता है। इसके प्रमुख भाग ALU, Control Unit और Registers हैं। उदाहरण: calculator में calculation CPU करता है।'],[/\bram\b|memory/i,'RAM एक temporary/volatile memory है। चल रहे programs और data इसमें रहते हैं। बिजली बंद होने पर RAM का data सामान्यतः मिट जाता है।'],[/\bhtml\b/i,'HTML का पूरा नाम HyperText Markup Language है। इसका उपयोग webpage की structure बनाने में होता है। जैसे heading के लिए <h1>, paragraph के लिए <p> tag।'],[/\bcss\b/i,'CSS का पूरा नाम Cascading Style Sheets है। यह webpage के रंग, font, spacing और layout को नियंत्रित करता है। HTML structure है, CSS presentation है।'],[/\bpython\b/i,'Python एक high-level, readable programming language है। उदाहरण: print("Hello") screen पर Hello दिखाता है। Python automation, data analysis और web development में उपयोग होती है।'],[/percentage|प्रतिशत/i,'प्रतिशत का अर्थ है प्रति सौ। 20% = 20/100 = 0.20। किसी संख्या का 20% निकालने के लिए उस संख्या को 20/100 से गुणा करें।'],[/photosynthesis|प्रकाश संश्लेषण/i,'प्रकाश संश्लेषण वह प्रक्रिया है जिसमें हरे पौधे सूर्य के प्रकाश की मदद से पानी और carbon dioxide से भोजन बनाते हैं और oxygen छोड़ते हैं।'],[/reasoning|तर्कशक्ति/i,'Reasoning का अर्थ है तर्क के आधार पर pattern या निष्कर्ष पहचानना। पहले दिए गए facts देखें, फिर संबंध या नियम खोजें और उसी नियम को नए प्रश्न पर लागू करें।'],[/noun|संज्ञा/i,'संज्ञा किसी व्यक्ति, स्थान, वस्तु या भाव के नाम को कहते हैं। उदाहरण: राम, दिल्ली, पुस्तक, ईमानदारी।'],[/constitution|संविधान/i,'संविधान देश चलाने के मूल नियमों और संस्थाओं की रूपरेखा देता है। भारत का संविधान 26 जनवरी 1950 को लागू हुआ।']];function addMsg(text,who){const d=document.createElement('div');d.className='chat-msg '+who;d.textContent=text;$('chatLog').appendChild(d);$('chatLog').scrollTop=$('chatLog').scrollHeight;}$('chatForm').onsubmit=e=>{e.preventDefault();const q=$('chatInput').value.trim();if(!q)return;addMsg(q,'user');const found=explain.find(x=>x[0].test(q));const ans=found?found[1]:'मैं अभी Basic Study Assistant हूँ। इस topic पर मेरे पास तैयार उत्तर नहीं है। आप प्रश्न को थोड़ा सरल करके पूछें या Computer, Maths, Reasoning, Science, English, Hindi, GK और Programming के किसी basic topic से शुरू करें।';setTimeout(()=>addMsg(ans,'bot'),180);$('chatInput').value='';};


}
// Subject-wise starter curriculum: separate topic cards on every subject page.
const subjectCurriculum={
'Computer':[
['Computer Fundamentals','Data, information, characteristics, applications और computer की generations.','Computer data को process करके meaningful information देता है।'],
['Parts of Computer','CPU, memory, motherboard, input और output devices.','CPU processing करता है; input devices data देते हैं और output devices result दिखाते हैं।'],
['Memory & Storage','RAM, ROM, cache, HDD, SSD और units of memory.','RAM temporary/volatile होती है, जबकि ROM में स्थायी instructions रहती हैं।'],
['Operating System','Windows, Linux, Android, files, folders और desktop basics.','Operating System user और computer hardware के बीच interface का काम करता है।'],
['Internet & Networking','Browser, search engine, email, LAN, MAN और WAN.','Internet दुनिया भर के networks को जोड़ने वाला network है।']
],
'Mathematics':[
['Number System','Natural, whole, integer, rational और irrational numbers.','संख्याओं को उनके गुणों के आधार पर अलग-अलग समूहों में रखा जाता है।'],
['Fractions & Decimals','भिन्न, दशमलव और उनके जोड़-घटाव.','भिन्न किसी पूरे भाग को दर्शाती है, जैसे 1/2 यानी आधा।'],
['Percentage','प्रतिशत निकालना, वृद्धि, कमी और दैनिक जीवन के उदाहरण.','प्रतिशत का अर्थ प्रति सौ है; 25% = 25/100 = 1/4.'],
['Ratio & Proportion','अनुपात, समानुपात और unitary method.','अनुपात दो समान प्रकार की राशियों की तुलना करता है।'],
['Basic Algebra','Variables, expressions और सरल equations.','x + 3 = 8 में x का मान 5 होगा।']
],
'Reasoning':[
['Number Series','अंकों के बीच जोड़, घटाव, गुणा और alternate patterns.','पहले दो लगातार पदों का अंतर देखकर संभावित नियम खोजें।'],
['Analogy','शब्द, संख्या और अक्षर समानता.','Analogy में पहले जोड़े का संबंध पहचानकर वही संबंध दूसरे जोड़े पर लागू करते हैं।'],
['Classification','Odd one out और समूह बनाना.','चार विकल्पों में तीन का साझा गुण और एक अलग गुण पहचानें।'],
['Coding-Decoding','अक्षरों और संख्याओं के बदलने के नियम.','दिए गए उदाहरणों में अक्षर आगे/पीछे कितने स्थान बदले हैं, यह देखें।'],
['Direction & Relation','दिशा ज्ञान, blood relation और क्रम.','दिशा वाले प्रश्न में उत्तर निकालने के लिए उत्तर दिशा को ऊपर मानकर diagram बनाएं।']
],
'Science':[
['Matter & Its States','ठोस, द्रव, गैस और पदार्थ के गुण.','पदार्थ वह है जिसका द्रव्यमान हो और जो स्थान घेरता हो।'],
['Force & Motion','बल, गति, दूरी, चाल और दैनिक जीवन के उदाहरण.','बल किसी वस्तु की गति या आकार में बदलाव ला सकता है।'],
['Light & Sound','प्रकाश का परावर्तन, छाया और ध्वनि की तरंगें.','प्रकाश सामान्यतः सीधी रेखा में चलता है और सतह से परावर्तित हो सकता है।'],
['Plants & Photosynthesis','पौधों के भाग, जड़, तना, पत्ती और भोजन निर्माण.','हरे पौधे प्रकाश की सहायता से photosynthesis द्वारा भोजन बनाते हैं।'],
['Human Body Basics','पाचन, श्वसन, रक्त परिसंचरण और अंगों के कार्य.','शरीर की अलग-अलग प्रणालियाँ मिलकर जीवन क्रियाएँ चलाती हैं।']
],
'English':[
['Parts of Speech','Noun, pronoun, verb, adjective, adverb और preposition.','A noun names a person, place, thing or idea.'],
['Tenses','Present, past और future के basic forms.','Tense बताता है कि कोई कार्य किस समय होता है।'],
['Articles & Prepositions','A, an, the और in, on, at का प्रयोग.','Articles noun से पहले आते हैं; prepositions संबंध या स्थान बताते हैं।'],
['Vocabulary','Synonyms, antonyms और रोजमर्रा के शब्द.','Synonym समान अर्थ और antonym विपरीत अर्थ वाला शब्द होता है।'],
['Sentence Building','Subject, verb, object और basic sentence order.','एक सामान्य English sentence में अक्सर Subject + Verb + Object क्रम होता है।']
],
'Hindi':[
['वर्ण और शब्द','स्वर, व्यंजन, वर्णमाला और शब्द निर्माण.','वर्ण भाषा की सबसे छोटी ध्वनि इकाई है।'],
['संज्ञा और सर्वनाम','संज्ञा के भेद और संज्ञा के स्थान पर आने वाले शब्द.','किसी व्यक्ति, स्थान, वस्तु या भाव के नाम को संज्ञा कहते हैं।'],
['विशेषण और क्रिया','गुण बताने वाले शब्द और कार्य बताने वाले शब्द.','विशेषण संज्ञा की विशेषता बताता है और क्रिया कार्य या अवस्था बताती है।'],
['काल','वर्तमान, भूत और भविष्य काल.','काल से कार्य के होने के समय का पता चलता है।'],
['वाक्य और लेखन','सरल वाक्य, विराम चिह्न, अनुच्छेद और पत्र लेखन.','शब्दों का ऐसा समूह जो पूरा अर्थ दे, वाक्य कहलाता है।']
],
'GK / General Studies':[
['Indian History','प्राचीन, मध्यकालीन और आधुनिक भारत का परिचय.','इतिहास में समयक्रम के अनुसार घटनाओं और उनके प्रभावों का अध्ययन होता है।'],
['Indian Geography','भारत के राज्य, नदियाँ, पर्वत और जलवायु.','भूगोल पृथ्वी, स्थानों और मानव-पर्यावरण संबंधों का अध्ययन है।'],
['Indian Constitution','संविधान, प्रस्तावना, मौलिक अधिकार और कर्तव्य.','भारतीय संविधान 26 जनवरी 1950 को लागू हुआ।'],
['General Science','दैनिक जीवन में Physics, Chemistry और Biology.','सामान्य विज्ञान प्राकृतिक घटनाओं को सरल सिद्धांतों से समझाता है।'],
['Static GK','राष्ट्रीय प्रतीक, महत्वपूर्ण दिवस और संस्थाएँ.','Static GK में ऐसे तथ्य पढ़े जाते हैं जो सामान्यतः बार-बार नहीं बदलते।']
],
'School Subjects':[
['Mathematics Basics','कक्षा 6–12 के number, algebra, geometry और statistics concepts.','गणित को समझने के लिए formula के साथ worked examples और practice जरूरी है।'],
['Science Basics','Physics, Chemistry और Biology के foundational concepts.','अवधारणा को diagram, उदाहरण और प्रयोग से समझना आसान होता है।'],
['Social Science','History, Geography, Civics और Economics का परिचय.','समाज, स्थान, शासन और अर्थव्यवस्था के अध्ययन को सामाजिक विज्ञान कहते हैं।'],
['English & Hindi','Grammar, reading comprehension और writing skills.','भाषा अभ्यास में पढ़ना, समझना, लिखना और बोलना शामिल है।'],
['Study Skills','Notes बनाना, revision और self-assessment.','छोटे study sessions और नियमित revision से concepts याद रखने में मदद मिलती है।']
],
'Programming':[
['Programming Fundamentals','Algorithm, flowchart, variables और logic.','Program निर्देशों का ऐसा क्रम है जिसे computer execute कर सकता है।'],
['HTML Basics','Tags, headings, paragraphs, links, images और forms.','HTML webpage की structure बनाता है।'],
['CSS Basics','Selectors, colors, fonts, spacing और responsive layout.','CSS webpage का look और layout नियंत्रित करता है।'],
['JavaScript Basics','Variables, conditions, loops और functions.','JavaScript webpage में interaction और dynamic behavior जोड़ता है।'],
['Python Basics','print, variables, data types, conditions और loops.','Python सरल syntax वाली programming language है; उदाहरण: print("Hello").']
]};
const subjectPage=document.querySelector('.subject-page');
if(subjectPage&&$('subjectLessonList')){
 const subjectName=subjectPage.dataset.subject;
 const chapters=subjectCurriculum[subjectName]||[];
 $('subjectLessonList').innerHTML=chapters.map((c,i)=>`<article class="lab-card curriculum-card"><div class="lab-kicker">TOPIC ${String(i+1).padStart(2,'0')}</div><h3>${c[0]}</h3><p>${c[1]}</p><details><summary>Concept समझें</summary><p>${c[2]}</p></details></article>`).join('');
 const quizLink=subjectPage.querySelector('a[href="quiz-practice.html"]');
 if(quizLink)quizLink.href='quiz-practice.html?subject='+encodeURIComponent(subjectName);
 if(subjectName==='Programming'){
  const row=subjectPage.querySelector('.lab-row');
  if(row){const a=document.createElement('a');a.className='lab-btn';a.href='coding-practice.html';a.textContent='Coding Practice खोलें ↗';row.prepend(a);}
 }
}
// Optional: load admin-published content. Built-in starter content remains available if DB is offline.
(async()=>{try{const sb=window.nllaSupabase;if(!sb)return;const {data,error}=await sb.from('learning_lab_items').select('title,subject,item_type,content').eq('is_published',true).order('created_at',{ascending:false}).limit(60);if(error||!data?.length)return;const grid=$('subjectGrid');if(grid){data.filter(x=>x.item_type==='lesson').forEach(x=>{const card=document.createElement('article');card.className='lab-card';const h=document.createElement('h3');h.textContent=x.title;const meta=document.createElement('p');meta.textContent=x.subject+' · Admin Lesson';const body=document.createElement('p');body.textContent=String(x.content?.explanation||x.content?.body||'Lesson content');card.append(h,meta,body);grid.prepend(card);});}const lessonList=$('subjectLessonList');if(lessonList){const subject=document.querySelector('.subject-page')?.dataset.subject;data.filter(x=>x.item_type==='lesson'&&String(x.subject).toLowerCase()===String(subject).toLowerCase()).forEach(x=>{const card=document.createElement('article');card.className='lab-card';const h=document.createElement('h3');h.textContent=x.title;const body=document.createElement('p');body.textContent=String(x.content?.explanation||x.content?.body||'Lesson content');card.append(h,body);lessonList.append(card);});}}catch(e){console.info('Custom learning content unavailable; built-in lessons remain active.');}})();
})();