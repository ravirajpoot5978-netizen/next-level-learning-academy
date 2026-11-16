(()=>{'use strict';
const $=id=>document.getElementById(id);
const bank={
'Computer':[
['CPU का पूरा नाम क्या है?',['Central Processing Unit','Computer Personal Unit','Control Program Utility','Central Print Unit'],0,'CPU instructions को process और execute करता है।'],
['कौन-सी memory volatile होती है?',['ROM','RAM','DVD','Hard Disk'],1,'RAM में मौजूद data बिजली बंद होने पर सामान्यतः मिट जाता है।'],
['इनमें input device कौन-सी है?',['Monitor','Printer','Keyboard','Speaker'],2,'Keyboard से computer में data और commands input किए जाते हैं।'],
['ALU का मुख्य कार्य क्या है?',['केवल printing','Arithmetic और logical operations','Internet चलाना','File store करना'],1,'ALU का अर्थ Arithmetic Logic Unit है।'],
['कौन-सा operating system है?',['MS Word','Windows','Google Chrome','Photoshop'],1,'Windows एक operating system है जो hardware और software resources manage करता है।']
],
'Mathematics':[
['200 का 25% कितना है?',['25','40','50','75'],2,'25% = 1/4, इसलिए 200 ÷ 4 = 50।'],
['12 × 8 = ?',['86','96','108','88'],1,'12 को 8 से गुणा करने पर 96 मिलता है।'],
['3/4 का decimal रूप क्या है?',['0.25','0.50','0.75','1.25'],2,'3 ÷ 4 = 0.75।'],
['यदि x + 7 = 12, तो x कितना है?',['3','4','5','6'],2,'दोनों तरफ से 7 घटाएँ: x = 12 − 7 = 5।'],
['10, 20 और 30 का औसत क्या है?',['15','20','25','30'],1,'औसत = (10 + 20 + 30) ÷ 3 = 20।']
],
'Reasoning':[
['श्रृंखला पूरी करें: 2, 4, 6, 8, ?',['9','10','11','12'],1,'हर बार 2 जोड़ा जा रहा है। अगली संख्या 10 है।'],
['Book : Read :: Food : ?',['Cook','Eat','Write','Buy'],1,'Book पढ़ते हैं और Food खाते हैं।'],
['इनमें अलग कौन है?',['गुलाब','कमल','आम','चमेली'],2,'आम फल है, जबकि बाकी फूल हैं।'],
['यदि CAT को DBU लिखा जाए, तो DOG कैसे लिखा जाएगा?',['EPH','CNG','FPH','EOG'],0,'हर अक्षर को alphabet में एक स्थान आगे किया गया है।'],
['उत्तर दिशा के विपरीत कौन-सी दिशा है?',['पूर्व','पश्चिम','दक्षिण','उत्तर-पूर्व'],2,'उत्तर की विपरीत दिशा दक्षिण होती है।']
],
'Science':[
['पौधे भोजन किस प्रक्रिया से बनाते हैं?',['Respiration','Photosynthesis','Digestion','Evaporation'],1,'Photosynthesis में पौधे प्रकाश की मदद से भोजन बनाते हैं।'],
['पानी का रासायनिक सूत्र क्या है?',['CO2','H2O','O2','NaCl'],1,'पानी के एक अणु में दो Hydrogen और एक Oxygen atom होता है।'],
['बल की SI इकाई क्या है?',['Joule','Watt','Newton','Pascal'],2,'बल की SI इकाई Newton है।'],
['मानव शरीर में रक्त पंप करने वाला अंग कौन-सा है?',['फेफड़ा','हृदय','गुर्दा','यकृत'],1,'हृदय रक्त को शरीर के विभिन्न भागों तक पंप करता है।'],
['सामान्य वायुदाब पर पानी का boiling point कितना है?',['0°C','50°C','100°C','150°C'],2,'सामान्य वायुदाब पर पानी 100°C पर उबलता है।']
],
'GK / General Studies':[
['भारत का संविधान कब लागू हुआ?',['15 अगस्त 1947','26 जनवरी 1950','26 नवंबर 1949','2 अक्टूबर 1950'],1,'भारतीय संविधान 26 जनवरी 1950 को लागू हुआ।'],
['भारत की राजधानी क्या है?',['मुंबई','नई दिल्ली','कोलकाता','चेन्नई'],1,'भारत की राजधानी नई दिल्ली है।'],
['भारत का राष्ट्रीय पशु कौन-सा है?',['एशियाई सिंह','बाघ','हाथी','मोर'],1,'बाघ भारत का राष्ट्रीय पशु है।'],
['भारतीय संविधान की प्रारूप समिति के अध्यक्ष कौन थे?',['डॉ. बी. आर. आंबेडकर','जवाहरलाल नेहरू','सरदार पटेल','डॉ. राजेंद्र प्रसाद'],0,'डॉ. बी. आर. आंबेडकर प्रारूप समिति के अध्यक्ष थे।'],
['भारत में गणतंत्र दिवस कब मनाया जाता है?',['15 अगस्त','2 अक्टूबर','26 जनवरी','14 नवंबर'],2,'26 जनवरी को गणतंत्र दिवस मनाया जाता है।']
],
'English':[
['Choose the correct plural of “child”.',['childs','childes','children','childrens'],2,'The plural form of child is children.'],
['Choose the noun in this sentence: “Rita reads a book.”',['reads','a','Rita','quickly'],2,'Rita is the name of a person, so it is a proper noun.'],
['What is the opposite of “ancient”?',['old','modern','historic','past'],1,'Modern is the opposite of ancient.'],
['Choose the correct article: “___ apple”.',['A','An','The','No article'],1,'An is used before a vowel sound; apple begins with a vowel sound.'],
['Choose the correct verb: “She ___ to school.”',['go','going','goes','gone'],2,'With she/he/it in the simple present, the verb usually takes -s or -es.']
],
'Hindi':[
['“सुंदर” शब्द कौन-सा है?',['संज्ञा','सर्वनाम','विशेषण','क्रिया'],2,'सुंदर किसी संज्ञा की विशेषता बताता है, इसलिए यह विशेषण है।'],
['“राम विद्यालय जाता है।” वाक्य में संज्ञा कौन-सी है?',['जाता','है','राम','कोई नहीं'],2,'राम व्यक्ति का नाम है, इसलिए संज्ञा है।'],
['“मैं” कौन-सा शब्द-भेद है?',['संज्ञा','सर्वनाम','विशेषण','क्रिया'],1,'मैं संज्ञा के स्थान पर प्रयुक्त होता है, इसलिए सर्वनाम है।'],
['“दिन” का विलोम शब्द क्या है?',['सुबह','रात','प्रकाश','समय'],1,'दिन का विलोम रात है।'],
['“पुस्तक” का बहुवचन क्या है?',['पुस्तकें','पुस्तकों','पुस्तका','पुस्तकी'],0,'पुस्तक का सामान्य बहुवचन पुस्तकें है।']
],
'Programming':[
['HTML का उपयोग किसलिए होता है?',['Webpage structure','Database backup','Operating system','Antivirus'],0,'HTML webpage की structure बनाने के लिए उपयोग होता है।'],
['CSS का मुख्य उपयोग क्या है?',['Data store करना','Webpage को style करना','Server चलाना','Email भेजना'],1,'CSS webpage के रंग, fonts, spacing और layout को नियंत्रित करता है।'],
['Python में output दिखाने के लिए कौन-सा function है?',['show()','echo()','print()','writeLine()'],2,'Python में print() function output दिखाता है।'],
['JavaScript में variable घोषित करने के लिए कौन-से keywords हैं?',['let और const','style और html','select और table','font और color'],0,'JavaScript में let और const सामान्य variable declaration keywords हैं।'],
['HTML में hyperlink बनाने के लिए कौन-सा tag है?',['<p>','<a>','<img>','<h1>'],1,'Anchor tag <a> hyperlink बनाने के लिए उपयोग होता है।']
],
'School Subjects':[
['जल का रासायनिक सूत्र क्या है?',['CO2','H2O','O2','NaCl'],1,'पानी का रासायनिक सूत्र H2O है।'],
['त्रिभुज के तीनों कोणों का योग कितना होता है?',['90°','180°','270°','360°'],1,'किसी भी समतलीय त्रिभुज के आंतरिक कोणों का योग 180° होता है।'],
['पृथ्वी सूर्य की एक परिक्रमा लगभग कितने समय में करती है?',['24 घंटे','30 दिन','365 दिन','12 घंटे'],2,'पृथ्वी सूर्य की एक परिक्रमा लगभग 365¼ दिनों में पूरी करती है।'],
['लोकतंत्र में सर्वोच्च शक्ति किसके पास मानी जाती है?',['जनता','केवल राजा','सेना','व्यापारी'],0,'लोकतंत्र में शासन की वैधता जनता की सहमति से आती है।'],
['1 किलोमीटर में कितने मीटर होते हैं?',['10','100','1000','10000'],2,'1 किलोमीटर = 1000 मीटर।']
]};
if(!$('quizSubject'))return;
let questions=[],answers=[],index=0,remaining=0,timer=null,active=false;
const controls=$('quizControls'),panel=$('quizCard'),results=$('quizResults');
function setStatus(t){const el=$('quizStatus');if(el)el.textContent=t;}
function render(){const q=questions[index];$('quizQuestion').textContent=q[0];$('quizOptions').innerHTML=q[1].map((v,i)=>`<button type="button" class="quiz-option ${answers[index]===i?'selected':''}" data-answer="${i}" aria-pressed="${answers[index]===i}">${'ABCD'[i]}. ${v}</button>`).join('');$('quizOptions').querySelectorAll('button').forEach(b=>b.onclick=()=>{answers[index]=Number(b.dataset.answer);render();});$('quizCounter').textContent=`Question ${index+1} / ${questions.length}`;$('quizProgress').style.width=((index+1)/questions.length*100)+'%';$('quizPrev').disabled=index===0;$('quizNext').textContent=index===questions.length-1?'Finish Quiz':'Next Question →';}
function clock(){const m=Math.floor(remaining/60),s=remaining%60;$('quizTimer').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(remaining<=60)$('quizTimer').classList.add('urgent');else $('quizTimer').classList.remove('urgent');}
function endQuiz(auto=false){if(!active)return;active=false;clearInterval(timer);panel.hidden=true;$('quizControls').hidden=true;results.hidden=false;let correct=0,wrong=0,skipped=0;questions.forEach((q,i)=>{if(answers[i]===undefined)skipped++;else if(answers[i]===q[2])correct++;else wrong++;});const pct=Math.round(correct/questions.length*100);$('quizResultScore').textContent=`${correct} / ${questions.length}`;$('quizResultPercent').textContent=pct+'%';$('quizResultMeta').textContent=`सही: ${correct} · गलत: ${wrong} · छोड़े: ${skipped}${auto?' · समय पूरा हुआ':''}`;$('quizReview').innerHTML=questions.map((q,i)=>{const a=answers[i],ok=a===q[2];return `<article class="quiz-review-item ${a===undefined?'unanswered':ok?'correct':'wrong'}"><h3>Q${i+1}. ${q[0]}</h3><p><b>आपका उत्तर:</b> ${a===undefined?'उत्तर नहीं दिया':q[1][a]}</p><p><b>सही उत्तर:</b> ${q[1][q[2]]}</p><p><b>समझें:</b> ${q[3]}</p><span class="quiz-result-tag">${a===undefined?'Skipped':ok?'Correct':'Incorrect'}</span></article>`;}).join('');setStatus('आपका परिणाम तैयार है। हर प्रश्न का सही उत्तर और explanation नीचे देखें।');}
function start(){const subject=$('quizSubject').value,pool=bank[subject]||bank.Computer;questions=[...pool].sort(()=>Math.random()-.5);const requested=$('quizCount').value; if(requested!=='all')questions=questions.slice(0,Math.min(Number(requested),pool.length));answers=Array(questions.length);index=0;remaining=Number($('quizDuration').value)*60;active=true;controls.hidden=false;panel.hidden=false;results.hidden=true;$('quizSetup').hidden=true;clock();render();setStatus(`आपका ${subject} quiz शुरू हो गया है।`);clearInterval(timer);timer=setInterval(()=>{remaining--;clock();if(remaining<=0)endQuiz(true);},1000);}
$('startQuiz').onclick=start;$('quizPrev').onclick=()=>{if(index>0){index--;render();}};$('quizNext').onclick=()=>{if(index<questions.length-1){index++;render();}else endQuiz(false);};$('finishQuiz').onclick=()=>endQuiz(false);$('restartQuiz').onclick=()=>{$('quizSetup').hidden=false;results.hidden=true;panel.hidden=true;controls.hidden=true;setStatus('नया quiz शुरू करने के लिए settings चुनें।');};
const requested=new URLSearchParams(location.search).get('subject');if(requested){const opt=[...$('quizSubject').options].find(o=>o.value.toLowerCase()===requested.toLowerCase()||o.textContent.toLowerCase()===requested.toLowerCase());if(opt)$('quizSubject').value=opt.value;}
})();
