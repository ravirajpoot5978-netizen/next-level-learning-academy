const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});


// Persistent interface language: Hindi, English, or Hinglish
const languageSelect = document.getElementById("siteLanguage");
const languageCopy = {
  hi: {
    announcement:"सीखना आज से शुरू करें — आपका अगला Level यहीं से शुरू होता है।",
    nav:["होम","कोर्स","क्यों चुनें","हमारे बारे में","संपर्क","स्टूडेंट लॉगिन","⚙ एडमिन","Learning Lab","कोर्स देखें"],
    heroEyebrow:"सीखें • अभ्यास करें • आगे बढ़ें",
    heroTitle:"अपनी सीखने की क्षमता को दें <span>Next Level</span>",
    heroText:"Computer Skills, Competitive Exams और School Learning — सीखिए आसान भाषा में, अपनी गति से और बेहतर भविष्य की तैयारी के साथ।",
    explore:"कोर्स देखें", aboutBtn:"हमारे बारे में", proof:"हर दिन कुछ नया सीखें", proofSmall:"आपकी सीखने की यात्रा, आपकी गति से",
    stats:["सीखने की श्रेणियाँ","अपनी गति से सीखें","सीखने पर पूरा ध्यान","असीम संभावनाएँ"],
    courseEyebrow:"आप क्या सीख सकते हैं", courseTitle:"अपनी पसंद का <span>Course</span> चुनें", courseIntro:"शुरुआत Basic से करें और धीरे-धीरे अपने Skills को अगले स्तर तक ले जाएँ।",
    cards:[
      ["कंप्यूटर शिक्षा","Basic Computer, MS Office, Excel, Tally और Digital Skills की मजबूत शुरुआत।","कोर्स की जानकारी"],
      ["प्रतियोगी परीक्षाएँ","Reasoning, Mathematics, General Knowledge और नियमित Practice की तैयारी।","कोर्स की जानकारी"],
      ["स्कूली शिक्षा","कक्षा 6 से 12 तक के विद्यार्थियों के लिए आसान भाषा में विषयों की समझ।","कोर्स की जानकारी"]
    ],
    disclaimer:"नोट: ये Learning Categories हैं। सभी Courses और उनकी उपलब्धता लॉन्च से पहले अपडेट की जाएगी।",
    featureTitle:"सीखना हो आसान,<br><span>तो तरीका हो Smart.</span>", featureText:"हमारा उद्देश्य है कि पढ़ाई को सरल, व्यवस्थित और उपयोगी बनाया जाए। आप अपनी जरूरत के अनुसार विषय चुनें और नियमित अभ्यास से आगे बढ़ें।",
    checks:["आसान भाषा में Learning Content","Practice और Revision पर ध्यान","Mobile और Desktop Friendly Experience","लगातार सीखने के लिए उपयोगी Resources"],
    aboutTitle:"हर विद्यार्थी में है <span>आगे बढ़ने की क्षमता</span>", aboutText:"Next Level Learning Academy का लक्ष्य विद्यार्थियों को ज्ञान, कौशल और आत्मविश्वास के साथ आगे बढ़ने में मदद करना है।",
    values:[["सरल पढ़ाई","जटिल विषयों को आसान और समझने योग्य तरीके से सीखें।"],["कौशल विकास","पढ़ाई के साथ ऐसे Skills विकसित करें जो आगे काम आएँ।"],["लगातार सुधार","नियमित अभ्यास, Revision और निरंतर सुधार की आदत बनाएँ।"]],
    contactTitle:"आपकी Learning Journey<br><span>यहीं से शुरू होती है।</span>",contactText:"Course की जानकारी चाहिए या कोई सवाल पूछना है? नीचे Enquiry भेजें।",
    formTitle:"जानकारी भेजें",labels:["आपका नाम","मोबाइल नंबर","आप किसमें रुचि रखते हैं?","आपका संदेश (वैकल्पिक)"],placeholders:["अपना नाम लिखें","10 अंकों का मोबाइल नंबर","Course चुनें","अपना सवाल लिखें..."],submit:"जानकारी भेजें",hint:"यह शुरुआती Demo Form है। अभी यह जानकारी किसी Server पर Save नहीं करता।",
    footer:"ज्ञान • कौशल • आत्मविश्वास",formStatus:"आपकी Enquiry का Message तैयार है। इसे भेजने के लिए नीचे Copy करें।",copy:"Enquiry Copy करें"
  },
  en: {
    announcement:"Start learning today — your next level begins here.",nav:["Home","Courses","Why Us","About","Contact","Student Login","⚙ Admin","Learning Lab","Explore Courses"],
    heroEyebrow:"LEARN • PRACTICE • GROW",heroTitle:"Take your learning journey to the <span>Next Level</span>",heroText:"Build Computer Skills, prepare for Competitive Exams, and strengthen School subjects — learn in a clear way, at your own pace.",explore:"Explore Courses",aboutBtn:"About Us",proof:"Learn something new every day",proofSmall:"Your learning journey, at your pace",
    stats:["Learning Categories","Learn at Your Pace","Learning Focus","Possibilities Ahead"],courseEyebrow:"WHAT YOU CAN LEARN",courseTitle:"Choose a <span>Course</span> you love",courseIntro:"Start with the basics and gradually take your skills to the next level.",
    cards:[["Computer Education","Build strong foundations in Basic Computer, MS Office, Excel, Tally and digital skills.","Course Enquiry"],["Competitive Exams","Prepare Reasoning, Mathematics, General Knowledge and regular practice.","Course Enquiry"],["School Education","Understand school subjects with easy explanations for Classes 6 to 12.","Course Enquiry"]],
    disclaimer:"Note: These are learning categories. Course details and availability will be updated before launch.",featureTitle:"Make learning easier,<br><span>with a smarter approach.</span>",featureText:"Our goal is to make learning simple, organized and useful. Choose subjects that match your needs and move forward with regular practice.",checks:["Easy-to-understand learning content","Focus on practice and revision","Mobile and desktop friendly experience","Useful resources for continuous learning"],
    aboutTitle:"Every learner has the <span>potential to grow</span>",aboutText:"Next Level Learning Academy aims to help learners move forward with knowledge, skills and confidence.",values:[["Simple Learning","Understand complex topics in a simple and clear way."],["Skill Development","Build practical skills along with your studies."],["Keep Improving","Develop a habit of practice, revision and continuous improvement."]],
    contactTitle:"Your learning journey<br><span>starts right here.</span>",contactText:"Need course details or have a question? Send us an enquiry below.",formTitle:"Send an Enquiry",labels:["Your Name","Mobile Number","What are you interested in?","Your Message (Optional)"],placeholders:["Enter your name","10-digit mobile number","Choose a course","Write your question..."],submit:"Send Enquiry",hint:"This is an initial demo form. Information is not saved to a server yet.",footer:"Knowledge • Skills • Confidence",formStatus:"Your enquiry message is ready. Copy it below to send.",copy:"Copy Enquiry"
  },
  mix: {
    announcement:"Aaj se learning start karein — aapka next level yahin se shuru hota hai.",nav:["Home","Courses","Why Us","About","Contact","Student Login","⚙ Admin","Learning Lab","Explore Courses"],
    heroEyebrow:"LEARN • PRACTICE • GROW",heroTitle:"Apni learning journey ko le jaayein <span>Next Level</span> par",heroText:"Computer Skills, Competitive Exams aur School Learning — easy language mein, apni speed se seekhein aur better future ki preparation karein.",explore:"Explore Courses",aboutBtn:"About Us",proof:"Har din kuch naya seekhein",proofSmall:"Aapki Learning Journey, aapki speed se",
    stats:["Learning Categories","Apni Speed se Seekhein","Learning par Focus","Unlimited Possibilities"],courseEyebrow:"WHAT YOU CAN LEARN",courseTitle:"Apni pasand ka <span>Course</span> choose karein",courseIntro:"Basic se start karein aur dheere-dheere apne Skills ko next level tak le jaayein.",
    cards:[["Computer Education","Basic Computer, MS Office, Excel, Tally aur Digital Skills ki strong shuruaat.","Course Enquiry"],["Competitive Exams","Reasoning, Mathematics, General Knowledge aur regular Practice ki preparation.","Course Enquiry"],["School Education","Class 6 se 12 tak ke students ke liye easy language mein subjects ki understanding.","Course Enquiry"]],
    disclaimer:"Note: Ye learning categories hain. Courses aur availability launch se pehle update ki jayegi.",featureTitle:"Learning ko banayein easy,<br><span>with a smarter approach.</span>",featureText:"Hamara goal hai padhai ko simple, organized aur useful banana. Apni need ke according subject choose karein aur regular practice se aage badhein.",checks:["Easy language mein learning content","Practice aur revision par focus","Mobile aur Desktop friendly experience","Continuous learning ke liye useful resources"],
    aboutTitle:"Har learner mein hai <span>grow karne ki ability</span>",aboutText:"Next Level Learning Academy ka goal students ko knowledge, skills aur confidence ke saath aage badhne mein help karna hai.",values:[["Simple Learning","Difficult topics ko easy aur clear way mein samjhein."],["Skill Development","Studies ke saath practical skills bhi develop karein."],["Keep Improving","Practice, revision aur continuous improvement ki habit banayein."]],
    contactTitle:"Aapki Learning Journey<br><span>yahin se start hoti hai.</span>",contactText:"Course details chahiye ya koi question hai? Neeche enquiry send karein.",formTitle:"Send an Enquiry",labels:["Aapka Naam","Mobile Number","Aap kis mein interested hain?","Aapka Message (Optional)"],placeholders:["Apna naam likhein","10 digit mobile number","Course choose karein","Apna question likhein..."],submit:"Enquiry Send Karein",hint:"Ye initial demo form hai. Abhi information kisi server par save nahi hoti.",footer:"Knowledge • Skills • Confidence",formStatus:"Aapka enquiry message ready hai. Send karne ke liye neeche copy karein.",copy:"Copy Enquiry"
  }
};
function applyLanguage(lang) {
  const t = languageCopy[lang] || languageCopy.hi;
  document.documentElement.lang = lang === "en" ? "en" : "hi";
  document.querySelector(".announcement").textContent = t.announcement;
  const navLinks = [...mainNav.querySelectorAll("a")];
  navLinks.forEach((a,i) => { if (t.nav[i]) a.textContent = t.nav[i]; });
  document.querySelector(".hero .eyebrow").innerHTML = '<span class="live-dot"></span> ' + t.heroEyebrow;
  document.querySelector(".hero h1").innerHTML = t.heroTitle;
  document.querySelector(".hero-text").textContent = t.heroText;
  document.querySelector(".hero-actions .btn-primary").innerHTML = t.explore + ' <span>→</span>';
  document.querySelector(".hero-actions .btn-ghost").innerHTML = '<span class="play-icon">▶</span> ' + t.aboutBtn;
  document.querySelector(".hero-proof strong").textContent=t.proof;
  document.querySelector(".hero-proof small").textContent=t.proofSmall;
  document.querySelectorAll(".stats span").forEach((el,i)=>el.textContent=t.stats[i]);
  document.querySelector("#courses .eyebrow").textContent=t.courseEyebrow;
  document.querySelector("#courses h2").innerHTML=t.courseTitle;
  document.querySelector("#courses .section-heading p").textContent=t.courseIntro;
  document.querySelectorAll(".course-card").forEach((card,i)=>{card.querySelector("h3").textContent=t.cards[i][0];card.querySelector("p").textContent=t.cards[i][1];card.querySelector(".text-link").innerHTML=t.cards[i][2]+' <b>↗</b>';});
  document.querySelector(".disclaimer").textContent=t.disclaimer;
  document.querySelector(".feature-copy h2").innerHTML=t.featureTitle;
  document.querySelector(".feature-copy>p").textContent=t.featureText;
  document.querySelectorAll(".check-list li").forEach((el,i)=>{el.lastChild.textContent=t.checks[i];});
  document.querySelector(".about-section h2").innerHTML=t.aboutTitle;
  document.querySelector(".about-section .centered>p").textContent=t.aboutText;
  document.querySelectorAll(".value-card").forEach((el,i)=>{el.querySelector("h3").textContent=t.values[i][0];el.querySelector("p").textContent=t.values[i][1];});
  document.querySelector(".contact-layout h2").innerHTML=t.contactTitle;
  document.querySelector(".contact-layout>div>p").textContent=t.contactText;
  document.querySelector(".enquiry-form h3").textContent=t.formTitle;
  document.querySelectorAll(".enquiry-form label").forEach((el,i)=>el.textContent=t.labels[i]);
  const fields=[document.getElementById("studentName"),document.getElementById("studentPhone"),document.getElementById("courseChoice"),document.getElementById("studentMessage")];
  fields.forEach((el,i)=>{if(i===2){el.options[0].textContent=t.placeholders[i];}else el.placeholder=t.placeholders[i];});
  document.querySelector(".form-submit").innerHTML=t.submit+' <span>→</span>';
  document.querySelector(".form-hint").textContent=t.hint;
  document.querySelector(".footer-main>p").innerHTML='Learn Today. Lead Tomorrow.<br>'+t.footer;
  localStorage.setItem("nlla-language",lang);
}
languageSelect.value = localStorage.getItem("nlla-language") || "hi";
languageSelect.addEventListener("change", () => applyLanguage(languageSelect.value));
applyLanguage(languageSelect.value);

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll("[data-course]").forEach(link => {
  link.addEventListener("click", () => {
    const choice = document.getElementById("courseChoice");
    choice.value = link.dataset.course;
  });
});

document.getElementById("enquiryForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const message = [
    "New enquiry - Next Level Learning Academy",
    `Name: ${data.get("name")}`,
    `Phone: ${data.get("phone")}`,
    `Course: ${data.get("course")}`,
    `Message: ${data.get("message") || "Not provided"}`
  ].join("\\n");

  const status = document.getElementById("formStatus");
  status.textContent = languageCopy[languageSelect.value].formStatus;
  let copyButton = document.getElementById("copyEnquiry");
  if (!copyButton) {
    copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.id = "copyEnquiry";
    copyButton.className = "btn btn-ghost";
    copyButton.style.width = "100%";
    copyButton.style.marginTop = "8px";
    copyButton.textContent = languageCopy[languageSelect.value].copy;
    status.insertAdjacentElement("afterend", copyButton);
  }
  copyButton.onclick = async () => {
    try {
      await navigator.clipboard.writeText(message);
      copyButton.textContent = "Copied ✓";
    } catch {
      status.textContent = message;
    }
  };
});
