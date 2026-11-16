NEXT LEVEL LEARNING ACADEMY — SUPABASE INTEGRATION PACK

इस पैक में Home page, Student Login/Signup, Student Dashboard, Owner Login, Admin Dashboard और सुरक्षित शुरुआती SQL शामिल हैं।

महत्वपूर्ण: अभी यह Supabase से जुड़ने के लिए तैयार कोड है; Backend तभी काम करेगा जब SQL चलाया जाए और Supabase Auth सेटिंग्स पूरी हों।

मोबाइल पर शुरू करने के कदम:
1. ZIP को Extract करें। सभी फाइलें एक ही project folder में रखें।
2. Supabase Dashboard > SQL Editor > New query खोलें।
3. supabase/setup.sql की पूरी सामग्री कॉपी करके SQL Editor में Paste करें और Run दबाएँ।
4. Authentication > Providers में Phone provider चालू करें। Phone/password signup के लिए SMS provider और Phone confirmation सेट करना होगा। परीक्षण के लिए confirmation बंद भी कर सकते हैं, लेकिन public launch से पहले सुरक्षित SMS verification चालू करें।
5. Owner account बनाने के लिए admin-login.html पर पहले एक बार Email + Password से Signup करना होगा। इस पैक में Admin Signup खुला नहीं है; Supabase Dashboard > Authentication > Users में owner email का user बनाएं या सुरक्षित invite करें।
6. Owner user बनने के बाद SQL Editor में यह query चलाएँ:
   update public.profiles p set role='admin' from auth.users u where p.id=u.id and u.email='ravirajpoot5978@gmail.com';
7. फिर admin-login.html से Owner Email + Password डालकर Login करें।

सुरक्षा:
- js/supabase-config.js में केवल Project URL और Publishable key है। Publishable key browser में उपयोग के लिए है।
- Secret key / service_role key कभी भी HTML/JS में न डालें या किसी को न भेजें।
- Admin role केवल SQL Editor से project owner द्वारा assign करें। विद्यार्थी स्वयं Admin नहीं बन सकते।
- यह अभी शुरुआती authentication/profile integration है। Course upload, storage, quiz, progress और admin CRUD अगले development चरणों में जोड़े जाएँगे।

Phone number: country code सहित, उदाहरण +919876543210.


UPLOAD LIMIT UPDATE (500 MB)
- Admin Panel ab ek PDF ke liye 500 MB tak allow karta hai.
- 6 MB se badi files resumable upload (TUS) se upload hoti hain, jisme network interruption par retry/resume support hota hai.
- Supabase Dashboard > Storage > Settings me Global file size limit ko bhi 500 MB ya usse adhik set karna hoga.
- Supabase plan ki maximum upload limit is setting ko restrict kar sakti hai. Agar plan 50 MB tak hi allow karta hai to plan/settings upgrade ki zarurat hogi.
- Storage bucket academy-materials ka file_size_limit 524288000 bytes (500 MB) set kiya gaya hai.
- Public bucket me private/confidential files upload na karein.


STUDENT LANGUAGE PREFERENCE UPDATE
1. Supabase > SQL Editor > New Query खोलें।
2. supabase/student-language-preference.sql की पूरी सामग्री Run करें।
3. Student Signup में Hindi, English या Hinglish चुन सकता है।
4. चयन profiles.preferred_language में सेव होगा।

ENROLLMENT SYSTEM UPDATE
1. Supabase SQL Editor में supabase/enrollment-security-update.sql चलाएँ।
2. Website की सभी फाइलें अपने hosting folder में पुरानी फाइलों के ऊपर replace करें।
3. Student account से login करके Dashboard खोलें। Published courses के नीचे Enroll Now बटन दिखेगा।
4. Enroll करने के बाद कोर्स My Courses में दिखाई देगा।
Note: Course enrollment के लिए courses table में is_published=true होना जरूरी है। Dashboard में chapter progress और quiz attempts अभी आगे के चरण में जुड़ेंगे।

नया फीचर: Chapter Progress Tracking
1. Supabase SQL Editor में supabase/chapter-progress.sql चलाएँ।
2. वेबसाइट की सभी अपडेटेड फाइलें पुरानी फाइलों से replace करें।
3. Student Login करें और My Courses में प्रकाशित Chapters देखें।
4. अध्याय पूरा होने पर Mark Complete दबाएँ। पूरा किया गया अध्याय Completed दिखेगा और ऊपर Completed Chapters की संख्या अपडेट होगी।
नोट: यह फीचर उन्हीं प्रकाशित अध्यायों पर काम करता है जिनके Course में विद्यार्थी enrolled है।

QUIZ SYSTEM - DATABASE FOUNDATION
1. Supabase SQL Editor me supabase/quiz-system-setup.sql ka poora code run karein.
2. Is step me secure quiz tables banti hain: quizzes, quiz_questions, quiz_answer_keys, quiz_attempts.
3. Correct answers alag protected table me rakhe gaye hain; students ko answer key read access nahi hai.
4. Student quiz attempt submit/scoring UI abhi agle development step me banega. Is SQL ko chalane se quiz UI apne aap nahi aayega.


QUIZ STUDENT INTERFACE UPDATE
- Dashboard में Online Quizzes सेक्शन जोड़ा गया है।
- विद्यार्थी केवल अपने enrolled courses के published quizzes देख सकते हैं।
- Quiz submit होने पर PostgreSQL RPC सही उत्तरों की जाँच करके score save करता है।
- Quiz answer keys सीधे student browser को नहीं भेजी जातीं।
- Supabase SQL Editor में quiz-system-setup.sql का पूरा updated version दोबारा Run करें (यह सुरक्षित function जोड़ता है)।
- यह सुविधा तभी दिखेगी जब Admin ने कम-से-कम एक quiz, questions और answer keys बनाई हों और quiz publish किया हो।


NAYA UPDATE: ADMIN QUIZ RESULTS REPORT
- Admin Panel ke section 6 me latest 500 quiz attempts dekhe ja sakte hain.
- Total attempts, average score aur attempted students ka summary dikhega.
- CSV Report button se result data download kiya ja sakta hai.
- Is feature ke liye naya SQL nahi chahiye, agar quiz-system-setup.sql pehle successfully run ho chuka hai.
- Results dekhne ke liye Admin account se login zaroori hai.


LEARNING LAB UPDATE (Typing, Coding, Quiz, Games, Basic Study Assistant)
1. learning-lab.html, css/learning-lab.css aur js/learning-lab.js project me add hue hain.
2. Homepage aur Student Dashboard se Learning Lab open kar sakte hain.
3. English aur Hindi Remington typing ke liye device/OS me relevant keyboard layout enable karein. Website keyboard layout switch nahi kar sakti. Mangal Unicode accuracy compare hoti hai; Kruti Dev legacy typing me is version par WPM/character count milta hai.
4. HTML/CSS editor live preview deta hai. Python lessons abhi practice notebook hain; Python execution engine/server is release me nahi hai.
5. Basic Study Assistant common starter topics ke predefined explanations deta hai; yeh live generative AI nahi hai. Advanced AI ke liye secure backend + provider API key chahiye.
6. Admin Learning Lab CRUD ke liye Supabase SQL Editor me supabase/learning-lab-content.sql run karein. Uske baad Admin Panel ke Section 7 se lesson/quiz/typing/coding/game resource add, publish/unpublish aur delete kar sakte hain.
7. Existing courses, enrollments, quiz tables aur progress records ko yeh SQL modify nahi karta.
8. Starter Quiz/Games built-in sample content hain. Published custom lessons subject cards में दिखते हैं और custom quiz questions Quiz Zone में उपलब्ध होते हैं। Quiz JSON format: {"questions":[{"question":"प्रश्न?","options":["A","B","C","D"],"answer":0,"explanation":"कारण"}]}. Admin panel में quiz delete करने पर उसके questions, answer keys और attempts भी cascade होकर delete हो सकते हैं; confirmation ध्यान से पढ़ें.


UPDATE: LEARNING LAB KE ALAG-ALAG PAGES
Learning Lab home: learning-lab.html
Typing: typing-practice.html | Coding: coding-practice.html | Quiz: quiz-practice.html
Games: learning-games.html | Study Assistant: study-assistant.html
Subject pages: subject-computer.html, subject-mathematics.html, subject-reasoning.html, subject-science.html, subject-english.html, subject-hindi.html, subject-gk.html, subject-school.html, subject-programming.html
Har page par top navigation se Learning Lab Home aur doosre tools par ja sakte hain. Admin Panel se published lessons subject ke matching page par dikhte hain.

VERSION 5 UPDATE – SUBJECT TOPIC ROADMAP
- हर subject page पर 5 शुरुआती topic/chapter cards जोड़े गए हैं।
- हर topic में छोटा concept explanation expand करके पढ़ा जा सकता है।
- Subject page का Quiz button उसी subject को Quiz Practice में पहले से select करके खोलेगा।
- Programming subject page से Coding Practice का direct link जोड़ा गया है।
- Programming page के emoji markup को ठीक किया गया है।
- इस update में नया Supabase SQL आवश्यक नहीं है।


VERSION 6 UPDATE
- ऊपर बाईं ओर shared Back button (Home page को छोड़कर)।
- Quiz Practice में subject, question count, timer, progress, previous/next और detailed answer review।
- Typing में Word Rain, Word Sprint, Sentence Challenge, Accuracy Master और Daily Challenge।
- Typing WPM, accuracy, errors और browser-local personal best।
- Student Dashboard पर Games और Study Assistant shortcuts।
- इस UI update के लिए नया SQL आवश्यक नहीं है। पूरी जानकारी VERSION-6-UPGRADE-NOTES-HINDI.txt में देखें।

VERSION 7 UPDATE
- Admin Panel में Student Learning Progress Report जोड़ी गई।
- Course filter, completed/total chapters, completion percentage, summary और CSV export उपलब्ध हैं।
- Existing chapter_progress और course_enrollments tables का उपयोग होता है।
- कोई नया SQL आवश्यक नहीं है।

VERSION 8 UPDATE:
Student Dashboard में My Learning Insights जोड़ा गया है। इसमें पिछले 7 दिनों की chapter completion और quiz activity, course-wise completion percentage तथा recent learning activity दिखाई जाती है। यह मौजूदा Supabase tables का उपयोग करता है; नया SQL आवश्यक नहीं है। अधिक जानकारी के लिए VERSION-8-UPGRADE-NOTES-HINDI.txt देखें।

VERSION 9 UPDATE — ADMIN CONTENT LIBRARY
- Learning Lab Content Library में Lesson, Quiz, Typing, Coding और Game के starter JSON templates जोड़े गए।
- Saved items को Edit/Update, Publish/Unpublish और Delete कर सकते हैं।
- Search और Type Filter उपलब्ध हैं।
- Edit Cancel और JSON validation जोड़ी गई।
- Typing Practice के Personal Best reading bug को ठीक किया गया।
- नया SQL आवश्यक नहीं है; पहले से मौजूद learning-lab-content.sql table का उपयोग होता है।
- ध्यान दें: वर्तमान Student-side custom content renderer मुख्यतः published Lessons दिखाता है; बाकी content types के interactive student pages आगे जोड़े जाएँगे।
पूरी जानकारी VERSION-9-UPGRADE-NOTES-HINDI.txt में देखें।

VERSION 10 UPDATE
- Admin द्वारा Published Quiz, Typing, Coding और Game Activity अब संबंधित Student Practice pages पर render होते हैं।
- Setup और सीमाएँ: VERSION-10-UPGRADE-NOTES-HINDI.txt देखें।


VERSION 11 UPDATE
-----------------
- Admin द्वारा प्रकाशित Learning Lab Quiz के Student Attempts अब Supabase में सेव हो सकते हैं।
- Quiz score PostgreSQL function से calculate होता है; Student सीधे score insert नहीं कर सकता।
- Admin Panel में Custom Quiz Attempts की अलग report, average score और CSV export जोड़ा गया है।
- Student Dashboard के Weekly Activity, Recent Activity और Quiz Attempts count में Learning Lab Quiz Attempts भी शामिल हैं।
- नया SQL: supabase/learning-lab-quiz-attempts.sql (इसे learning-lab-content.sql के बाद एक बार चलाएँ)।
- Starter Quiz Bank अभी browser-only practice है; यह Admin Content Library के प्रकाशित Quiz से अलग है।


VERSION 12 UPDATE — COURSE CERTIFICATE SYSTEM
------------------------------------------------
- Student Dashboard: My Certificates, course completion check and request.
- Admin Panel: Approve & Issue, Revoke, CSV report.
- Unique Certificate ID and PDF with QR verification link.
- Public verification shows certificate ID, student name, course and status only.
INSTALLATION:
1. Version 11 files का backup लें और Version 12 project files replace करें.
2. Supabase SQL Editor में supabase/course-certificates-v12.sql पूरा Run करें.
3. Student को enrolled होना चाहिए और Course के सभी Published Chapters पूरे होने चाहिए.
4. Student Dashboard > My Certificates से request करें.
5. Admin Panel > Certificates से Approve & Issue करें.
6. Student PDF डाउनलोड कर सकता है; QR scan करके public verification करें.
REQUIREMENTS / LIMITATIONS:
- Existing profiles, courses, course_enrollments, course_chapters, chapter_progress tables required.
- PDF/QR libraries CDN से लोड होती हैं; PDF बनाने के लिए Internet चाहिए.
- Signature line visual placeholder है; public launch से पहले authorized signature और certificate policy तय करें.
- Live Supabase SQL/RLS and real account workflow must be tested in the user's project.
- Frontend में केवल publishable key रखें; service_role/secret key कभी न जोड़ें.
