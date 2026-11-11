/* Feed a Friend — volunteer portal Arabic (RTL) layer.
 *
 * Loaded by volunteer.html before the React app. It:
 *   - remembers the language the same way connect.html does (?lang=ar and
 *     sessionStorage "connect_lang"), so EN/AR carries across pages;
 *   - flips the page to RTL, swaps in Arabic text and Arabic-Indic digits;
 *   - keeps internal links on the page in the same language (adds ?lang=ar).
 *
 * Only display text changes. Values stored in the database (nationality,
 * languages, project ids, statuses…) always stay in English.
 *
 * To translate a new string, add it to DICT below (exact English text from the
 * page -> Arabic). Anything missing simply stays in English.
 */
(function () {
  "use strict";

  var KEY = "connect_lang";
  var AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

  // ───────────────────────── dictionary ─────────────────────────
  var DICT = {
    // chrome / auth
    "Volunteer Portal": "بوابة المتطوعين",
    "feedafriend.org · Volunteer Portal": "feedafriend.org · بوابة المتطوعين",
    "Sign In": "تسجيل الدخول",
    "Sign In →": "تسجيل الدخول ←",
    "Signing in...": "جارٍ تسجيل الدخول...",
    "Welcome back!": "أهلاً بعودتك!",
    "Email": "البريد الإلكتروني",
    "Email *": "البريد الإلكتروني *",
    "Password": "كلمة المرور",
    "Password *": "كلمة المرور *",
    "Confirm Password *": "تأكيد كلمة المرور *",
    "Show": "إظهار",
    "Hide": "إخفاء",
    "Forgot password?": "نسيت كلمة المرور؟",
    "New volunteer?": "متطوع جديد؟",
    "Register here": "سجّل هنا",
    "Register": "التسجيل",
    "Join our volunteer community.": "انضم إلى مجتمع المتطوعين لدينا.",
    "Reset Password": "إعادة تعيين كلمة المرور",
    "Enter your email for a reset link.": "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين.",
    "Send Reset Link": "إرسال رابط إعادة التعيين",
    "← Back": "→ رجوع",
    "← Back to Sign In": "→ العودة إلى تسجيل الدخول",
    "Profile Photo": "الصورة الشخصية",
    "Tap 📷 to change photo": "اضغط 📷 لتغيير الصورة",
    "top": "أعلى", "center": "وسط", "bottom": "أسفل",
    "First Name": "الاسم الأول", "First Name *": "الاسم الأول *",
    "Surname": "اسم العائلة", "Surname *": "اسم العائلة *",
    "Date of Birth": "تاريخ الميلاد", "Date of Birth *": "تاريخ الميلاد *",
    "Phone Number": "رقم الهاتف", "Phone Number *": "رقم الهاتف *",
    "Nationality": "الجنسية", "Nationality *": "الجنسية *",
    "Employment Status": "الحالة الوظيفية", "Employment Status *": "الحالة الوظيفية *",
    "🎓 Student": "🎓 طالب",
    "💼 Working": "💼 موظف",
    "🏠 Not currently working": "🏠 غير موظف حالياً",
    "Level of study": "المستوى الدراسي",
    "Select level...": "اختر المستوى...",
    "Select...": "اختر...",
    "Secondary School (GCSE)": "المرحلة الثانوية (GCSE)",
    "Sixth Form / A-Levels": "ما قبل الجامعة (A-Levels)",
    "Undergraduate": "مرحلة البكالوريوس",
    "Postgraduate": "الدراسات العليا",
    "Other": "أخرى",
    "School / University": "المدرسة / الجامعة",
    "Profession": "المهنة",
    "Projects you're interested in *": "المشاريع التي تهتم بها *",
    "Project Interests": "اهتماماتك بالمشاريع",
    "Languages Spoken": "اللغات التي تتحدثها",
    "Preferred Language": "اللغة المفضلة",
    "العربية Arabic": "العربية",
    "Fun Fact About Me (optional)": "معلومة طريفة عني (اختياري)",
    "Submit Registration": "إرسال التسجيل",
    "Submitting...": "جارٍ الإرسال...",
    "Save Changes": "حفظ التغييرات",
    "Saving...": "جارٍ الحفظ...",
    "Edit Profile": "تعديل الملف الشخصي",
    "Edit": "تعديل",
    "Student": "طالب",
    "Working": "موظف",
    "Working professional": "موظف محترف",
    "Error: ": "خطأ: ",

    // messages / validation / toasts
    "Please fill in all required fields.": "يرجى تعبئة جميع الحقول المطلوبة.",
    "Please select your employment status.": "يرجى اختيار حالتك الوظيفية.",
    "Please select at least one project you are interested in.": "يرجى اختيار مشروع واحد على الأقل تهتم به.",
    "Passwords do not match.": "كلمتا المرور غير متطابقتين.",
    "Password must be at least 6 characters.": "يجب ألا تقل كلمة المرور عن 6 أحرف.",
    "Please enter your email.": "يرجى إدخال بريدك الإلكتروني.",
    "Your registration is pending admin approval.": "تسجيلك قيد مراجعة الإدارة.",
    "Registration submitted! An admin will review and approve your account shortly.": "تم إرسال التسجيل! ستراجع الإدارة حسابك وتعتمده قريباً.",
    "Reset email sent! Check your inbox.": "تم إرسال رسالة إعادة التعيين! تحقق من بريدك الوارد.",
    "Invalid login credentials": "بيانات الدخول غير صحيحة",
    "Email not confirmed": "لم يتم تأكيد البريد الإلكتروني",
    "User already registered": "هذا البريد الإلكتروني مسجّل مسبقاً",
    "✓ Hours submitted for admin approval!": "✓ تم إرسال الساعات لموافقة الإدارة!",
    "✓ Profile saved!": "✓ تم حفظ الملف الشخصي!",
    "✓ Request sent! Awaiting admin approval.": "✓ تم إرسال الطلب! بانتظار موافقة الإدارة.",
    "✓ Added to waitlist! You'll be notified if a spot opens.": "✓ تمت إضافتك إلى قائمة الانتظار! سنخطرك إذا توفّر مقعد.",
    "Signup cancelled.": "تم إلغاء التسجيل.",
    "Attendance cancelled.": "تم إلغاء الحضور.",
    "Removed from waitlist.": "تمت الإزالة من قائمة الانتظار.",
    "Cancel your attendance?": "هل تريد إلغاء حضورك؟",
    "No match — please pick from the list.": "لا توجد نتيجة — يرجى الاختيار من القائمة.",

    // header / nav
    "Home": "الرئيسية",
    "Opportunities": "الفرص",
    "Log Hours": "تسجيل الساعات",
    "My Hours": "ساعاتي",
    "Sign Out": "تسجيل الخروج",

    // incomplete-profile banner
    "Please complete your profile": "يرجى إكمال ملفك الشخصي",
    "Missing:": "ينقص:",
    "Update Profile": "تحديث الملف الشخصي",

    // dashboard
    "Welcome back,": "أهلاً بعودتك،",
    "Together": "توجزر",
    "for Good": "فور جود",
    "Together for Good": "توجزر فور جود",
    "Find Opportunities →": "ابحث عن فرص ←",
    "Total Hours": "إجمالي الساعات",
    "hrs given": "ساعة تطوع",
    "Activities": "الأنشطة",
    "logged": "مسجّلة",
    "Signups": "التسجيلات",
    "total": "الإجمالي",
    "Upcoming Events": "الفعاليات القادمة",
    "No upcoming events —": "لا توجد فعاليات قادمة —",
    "browse opportunities": "تصفّح الفرص",
    "✓ Approved": "✓ تمت الموافقة",
    "Cancel": "إلغاء",
    "Our Projects": "مشاريعنا",
    "Recent Activity": "النشاط الأخير",
    "No hours logged yet.": "لم يتم تسجيل ساعات بعد.",

    // projects
    "Food Boxes": "صناديق الطعام",
    "Welcome Baby": "أهلاً بالمولود",
    "Community Fridges": "الثلاجات المجتمعية",
    "Little Learners": "المتعلمون الصغار",
    "Share and Care": "شارك واهتم",
    "Giving Garden": "حديقة العطاء",
    "Books for Good": "كتب من أجل الخير",
    "General": "عام",

    // opportunities
    "Volunteer Opportunities": "فرص التطوع",
    "Find your next chance to make a difference.": "اعثر على فرصتك القادمة لصنع الفرق.",
    "All": "الكل",
    "📅 Event Roles": "📅 أدوار الفعاليات",
    "🤝 FAF Team Roles": "🤝 أدوار فريق فيد أ فريند",
    "No FAF Team roles match this filter yet.": "لا توجد أدوار في فريق فيد أ فريند تطابق هذا التصنيف حتى الآن.",
    "No event roles match this filter yet.": "لا توجد أدوار فعاليات تطابق هذا التصنيف حتى الآن.",
    "🎓 Students Only": "🎓 للطلاب فقط",
    "🤝 Join the FAF Team": "🤝 انضم إلى فريق فيد أ فريند",
    "Join the FAF Team →": "انضم إلى الفريق ←",
    "Sign Up →": "سجّل ←",
    "Applications Closed": "التقديم مغلق",
    "⏳ Pending": "⏳ قيد المراجعة",
    "⏸ Waitlist": "⏸ قائمة الانتظار",
    "📍 Checked In": "📍 تم تسجيل الحضور",
    "Read more ▼": "عرض المزيد ▼",
    "Show less ▲": "عرض أقل ▲",
    "Sign Up": "التسجيل",
    "Please answer these questions to apply for": "يرجى الإجابة عن هذه الأسئلة للتقديم على",
    "✓ Yes": "✓ نعم",
    "✕ No": "✕ لا",
    "Submit Application →": "إرسال الطلب ←",

    // log hours
    "Log Your Hours": "سجّل ساعاتك",
    "Every hour counts — thank you!": "كل ساعة لها قيمتها — شكراً لك!",
    "Project": "المشروع",
    "Event Name": "اسم الفعالية",
    "Date of Event": "تاريخ الفعالية",
    "Hours Volunteered": "عدد ساعات التطوع",
    "Notes (optional)": "ملاحظات (اختياري)",
    "Submit Hours 🌿": "إرسال الساعات 🌿",

    // history + card
    "Volunteer Card": "بطاقة متطوع",
    "tap to flip →": "اضغط للقلب ←",
    "Feed a Friend · Volunteer": "فيد أ فريند · متطوع",
    "No hours yet — go volunteer!": "لا توجد ساعات بعد — انطلق وتطوّع!",

    // short units / fragments produced by JSX interpolation
    "h": "س",
    "h ": "س ",
    "spots": "مقاعد",
    "opportunities": "فرصة",
    "hours across": "ساعة عبر",
    "activities.": "نشاط.",
    "sessions": "جلسة",
    "h volunteered": "ساعة تطوع",
    "volunteered ·": "ساعة تطوع ·",
    "h logged! 🌟": "ساعة تم تسجيلها! 🌟",

    // languages (display only) — also used for chips/suggestions
    "English": "الإنجليزية",
    "Arabic": "العربية"
  };

  var PLACEHOLDERS = {
    "you@email.com": "you@email.com",
    "Min. 6 characters": "6 أحرف على الأقل",
    "Repeat password": "أعد إدخال كلمة المرور",
    "Sara": "سارة",
    "Ahmed": "أحمد",
    "e.g. 33123456": "مثال: 33123456",
    "e.g. University of Manchester": "مثال: جامعة مانشستر",
    "e.g. Teacher, Nurse...": "مثال: معلم، ممرض...",
    "e.g. I once hiked Everest base camp! 🏔️": "مثال: تسلقت ذات مرة إلى معسكر قاعدة إيفرست! 🏔️",
    "Start typing... e.g. Qatari": "ابدأ الكتابة... مثال: قطري",
    "Type a language and press Enter...": "اكتب لغة ثم اضغط Enter...",
    "Your answer...": "إجابتك...",
    "e.g. Pantry Stock": "مثال: تجهيز مخزن الطعام",
    "e.g. 3": "مثال: 3",
    "Share anything about your experience...": "شاركنا أي شيء عن تجربتك..."
  };

  var PER = { day: "اليوم", week: "الأسبوع", month: "الشهر", year: "السنة" };

  var MISSING = {
    "phone number": "رقم الهاتف",
    "nationality": "الجنسية",
    "languages spoken": "اللغات المتحدَّث بها",
    "preferred language": "اللغة المفضلة"
  };

  var LANG_AR = {
    "English": "الإنجليزية", "Arabic": "العربية", "Hindi": "الهندية", "Urdu": "الأردية",
    "Tagalog / Filipino": "التاغالوغية / الفلبينية", "Malayalam": "المالايالامية", "Tamil": "التاميلية",
    "Bengali": "البنغالية", "Nepali": "النيبالية", "Sinhala": "السنهالية", "Indonesian / Bahasa": "الإندونيسية",
    "French": "الفرنسية", "Swahili": "السواحيلية", "Amharic": "الأمهرية", "Spanish": "الإسبانية",
    "Telugu": "التيلوغوية", "Punjabi": "البنجابية", "Pashto": "البشتو", "Farsi / Persian": "الفارسية",
    "Turkish": "التركية", "Russian": "الروسية", "Chinese (Mandarin)": "الصينية (الماندرين)",
    "Portuguese": "البرتغالية", "German": "الألمانية", "Italian": "الإيطالية"
  };

  var NAT_AR = {
    "Afghan": "أفغاني", "Albanian": "ألباني", "Algerian": "جزائري", "American": "أمريكي", "Andorran": "أندوري",
    "Angolan": "أنغولي", "Antiguan and Barbudan": "أنتيغوي وبربودي", "Argentine": "أرجنتيني", "Armenian": "أرميني",
    "Australian": "أسترالي", "Austrian": "نمساوي", "Azerbaijani": "أذربيجاني", "Bahamian": "باهامي",
    "Bahraini": "بحريني", "Bangladeshi": "بنغلاديشي", "Barbadian": "بربادوسي", "Belarusian": "بيلاروسي",
    "Belgian": "بلجيكي", "Belizean": "بيليزي", "Beninese": "بنيني", "Bhutanese": "بوتاني", "Bolivian": "بوليفي",
    "Bosnian": "بوسني", "Botswanan": "بوتسواني", "Brazilian": "برازيلي", "British": "بريطاني", "Bruneian": "بروني",
    "Bulgarian": "بلغاري", "Burkinabe": "بوركينابي", "Burmese": "ميانماري", "Burundian": "بوروندي",
    "Cambodian": "كمبودي", "Cameroonian": "كاميروني", "Canadian": "كندي", "Cape Verdean": "من الرأس الأخضر",
    "Central African": "من أفريقيا الوسطى", "Chadian": "تشادي", "Chilean": "تشيلي", "Chinese": "صيني",
    "Colombian": "كولومبي", "Comoran": "قمري", "Congolese": "كونغولي", "Costa Rican": "كوستاريكي",
    "Croatian": "كرواتي", "Cuban": "كوبي", "Cypriot": "قبرصي", "Czech": "تشيكي", "Danish": "دنماركي",
    "Djiboutian": "جيبوتي", "Dominican": "دومينيكاني", "Dutch": "هولندي", "East Timorese": "تيموري شرقي",
    "Ecuadorian": "إكوادوري", "Egyptian": "مصري", "Emirati": "إماراتي", "English": "إنجليزي",
    "Equatorial Guinean": "غيني استوائي", "Eritrean": "إريتري", "Estonian": "إستوني", "Ethiopian": "إثيوبي",
    "Fijian": "فيجي", "Filipino": "فلبيني", "Finnish": "فنلندي", "French": "فرنسي", "Gabonese": "غابوني",
    "Gambian": "غامبي", "Georgian": "جورجي", "German": "ألماني", "Ghanaian": "غاني", "Greek": "يوناني",
    "Grenadian": "غرينادي", "Guatemalan": "غواتيمالي", "Guinean": "غيني", "Guinea-Bissauan": "غيني بيساوي",
    "Guyanese": "غياني", "Haitian": "هايتي", "Honduran": "هندوراسي", "Hungarian": "مجري", "Icelandic": "آيسلندي",
    "Indian": "هندي", "Indonesian": "إندونيسي", "Iranian": "إيراني", "Iraqi": "عراقي", "Irish": "أيرلندي",
    "Israeli": "إسرائيلي", "Italian": "إيطالي", "Ivorian": "إيفواري", "Jamaican": "جامايكي", "Japanese": "ياباني",
    "Jordanian": "أردني", "Kazakh": "كازاخستاني", "Kenyan": "كيني", "Kittitian": "من سانت كيتس ونيفيس",
    "Kosovar": "كوسوفي", "Kuwaiti": "كويتي", "Kyrgyz": "قيرغيزي", "Laotian": "لاوسي", "Latvian": "لاتفي",
    "Lebanese": "لبناني", "Basotho": "ليسوتي", "Liberian": "ليبيري", "Libyan": "ليبي",
    "Liechtensteiner": "ليختنشتايني", "Lithuanian": "ليتواني", "Luxembourgish": "لوكسمبورغي",
    "Macedonian": "مقدوني", "Malagasy": "مدغشقري", "Malawian": "مالاوي", "Malaysian": "ماليزي",
    "Maldivian": "مالديفي", "Malian": "مالي", "Maltese": "مالطي", "Marshallese": "من جزر مارشال",
    "Mauritanian": "موريتاني", "Mauritian": "موريشيوسي", "Mexican": "مكسيكي", "Micronesian": "ميكرونيزي",
    "Moldovan": "مولدوفي", "Monacan": "موناكي", "Mongolian": "منغولي", "Montenegrin": "مونتينيغري",
    "Moroccan": "مغربي", "Mozambican": "موزمبيقي", "Namibian": "ناميبي", "Nauruan": "ناوروي", "Nepali": "نيبالي",
    "New Zealander": "نيوزيلندي", "Nicaraguan": "نيكاراغوي", "Nigerian": "نيجيري", "Nigerien": "نيجري",
    "North Korean": "كوري شمالي", "Northern Irish": "أيرلندي شمالي", "Norwegian": "نرويجي", "Omani": "عماني",
    "Pakistani": "باكستاني", "Palauan": "بالاوي", "Palestinian": "فلسطيني", "Panamanian": "بنمي",
    "Papua New Guinean": "بابوي", "Paraguayan": "باراغوياني", "Peruvian": "بيروفي", "Polish": "بولندي",
    "Portuguese": "برتغالي", "Puerto Rican": "بورتوريكي", "Qatari": "قطري", "Romanian": "روماني",
    "Russian": "روسي", "Rwandan": "رواندي", "Saint Lucian": "من سانت لوسيا", "Salvadoran": "سلفادوري",
    "Samoan": "ساموي", "San Marinese": "سان مارينو", "Sao Tomean": "ساوتومي", "Saudi": "سعودي",
    "Scottish": "اسكتلندي", "Senegalese": "سنغالي", "Serbian": "صربي", "Seychellois": "سيشلي",
    "Sierra Leonean": "سيراليوني", "Singaporean": "سنغافوري", "Slovak": "سلوفاكي", "Slovenian": "سلوفيني",
    "Solomon Islander": "من جزر سليمان", "Somali": "صومالي", "South African": "جنوب أفريقي",
    "South Korean": "كوري جنوبي", "South Sudanese": "جنوب سوداني", "Spanish": "إسباني", "Sri Lankan": "سريلانكي",
    "Sudanese": "سوداني", "Surinamese": "سورينامي", "Swazi": "إسواتيني", "Swedish": "سويدي", "Swiss": "سويسري",
    "Syrian": "سوري", "Taiwanese": "تايواني", "Tajik": "طاجيكي", "Tanzanian": "تنزاني", "Thai": "تايلندي",
    "Togolese": "توغولي", "Tongan": "تونغي", "Trinidadian": "ترينيدادي", "Tunisian": "تونسي", "Turkish": "تركي",
    "Turkmen": "تركماني", "Tuvaluan": "توفالي", "Ugandan": "أوغندي", "Ukrainian": "أوكراني",
    "Uruguayan": "أوروغوياني", "Uzbek": "أوزبكي", "Vanuatuan": "فانواتي", "Venezuelan": "فنزويلي",
    "Vietnamese": "فيتنامي", "Welsh": "ويلزي", "Yemeni": "يمني", "Zambian": "زامبي", "Zimbabwean": "زيمبابوي"
  };

  // ───────────────────────── state ─────────────────────────
  function readStored() {
    try {
      var q = new URLSearchParams(location.search).get("lang");
      if (q === "ar" || q === "en") return q;
    } catch (e) {}
    try { return sessionStorage.getItem(KEY) === "ar" ? "ar" : "en"; } catch (e) { return "en"; }
  }

  var pref = readStored();      // what the visitor chose
  var adminMode = false;        // staff screens stay English / LTR
  var listeners = [];
  var textRec = new WeakMap();  // text node -> {en, out}
  var attrRec = new WeakMap();  // element -> {en, out}

  function eff() { return adminMode ? "en" : pref; }
  function isAr() { return eff() === "ar"; }

  // ───────────────────────── translation ─────────────────────────
  function toArDigits(s) {
    if (/@|https?:|www\./.test(s)) return s;
    return s.replace(/[0-9]/g, function (d) { return AR_DIGITS.charAt(+d); })
            .replace(/([٠-٩])\.([٠-٩])/g, "$1٫$2");
  }

  function translateCore(core) {
    if (DICT.hasOwnProperty(core)) return DICT[core];
    var m;
    if ((m = /^Error: ([\s\S]+)$/.exec(core))) return "خطأ: " + translateCore(m[1]);
    // "phone number, nationality and languages spoken"
    if (/^(?:phone number|nationality|languages spoken|preferred language)(?:(?:, | and )(?:phone number|nationality|languages spoken|preferred language))*\.?$/.test(core)) {
      var dot = /\.$/.test(core) ? "." : "";
      var parts = core.replace(/\.$/, "").split(/, | and /);
      var out = parts.map(function (p) { return MISSING[p]; });
      var last = out.pop();
      return (out.length ? out.join("، ") + " و" : "") + last + dot;
    }
    // ongoing-role date / commitment text
    if (/Runs \S+ – \S+|Ongoing since \S+|hrs\//.test(core)) {
      return core
        .replace(/Runs (\S+) – (\S+)/, "من $1 إلى $2")
        .replace(/Ongoing since (\S+)/, "مستمر منذ $1")
        .replace(/⏱ ([\d.]+) hrs\/(day|week|month|year)/, function (_, n, p) { return "⏱ " + n + " ساعة/" + PER[p]; });
    }
    return core;
  }

  function translateText(s) {
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s);
    var core = m[2];
    if (!core) return s;
    return m[1] + toArDigits(translateCore(core)) + m[3];
  }

  function processTextNode(node) {
    var p = node.parentNode;
    if (!p) return;
    var tag = p.nodeName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "NOSCRIPT") return;
    if (p.closest && p.closest("[data-no-i18n]")) return;
    var v = node.nodeValue;
    var rec = textRec.get(node);
    var en = rec && rec.out === v ? rec.en : v;   // React rewrote it -> v is fresh English
    var out = isAr() ? translateText(en) : en;
    if (out !== v) node.nodeValue = out;
    if (out !== en) textRec.set(node, { en: en, out: out });
    else if (rec) textRec.delete(node);
  }

  function processAttrs(el) {
    if (!el.getAttribute) return;
    var v = el.getAttribute("placeholder");
    if (v === null) return;
    var rec = attrRec.get(el);
    var en = rec && rec.out === v ? rec.en : v;
    var out = isAr() && PLACEHOLDERS.hasOwnProperty(en) ? PLACEHOLDERS[en] : en;
    if (out !== v) el.setAttribute("placeholder", out);
    if (out !== en) attrRec.set(el, { en: en, out: out });
    else if (rec) attrRec.delete(el);
  }

  function processTree(root) {
    if (!root) return;
    if (root.nodeType === 3) { processTextNode(root); return; }
    if (root.nodeType !== 1) return;
    processAttrs(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) processTextNode(n); else processAttrs(n);
    }
  }

  function processLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var list = scope.querySelectorAll("a[href]");
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (!a.dataset.fafBase) a.dataset.fafBase = a.getAttribute("href");
      var base = a.dataset.fafBase;
      if (/^(mailto:|tel:|#|javascript:|blob:|data:)/i.test(base)) continue;
      var u;
      try { u = new URL(base, location.href); } catch (e) { continue; }
      if (!/(^|\.)feedafriend\.org$/.test(u.hostname) && u.host !== location.host) continue;
      if (isAr()) u.searchParams.set("lang", "ar"); else u.searchParams.delete("lang");
      var next = u.toString();
      if (a.getAttribute("href") !== next) a.setAttribute("href", next);
    }
  }

  // ───────────────────────── page-level styling ─────────────────────────
  var CSS = [
    "html[lang='ar'] *{font-family:Cairo,'Segoe UI',Tahoma,sans-serif !important;letter-spacing:0 !important;text-transform:none !important}",
    "html[dir='rtl'] input[type=email],html[dir='rtl'] input[type=tel],html[dir='rtl'] input[type=number],html[dir='rtl'] input[type=date]{text-align:right}",
    "html[dir='rtl'] input[type=email],html[dir='rtl'] input[type=tel],html[dir='rtl'] input[type=password]{direction:ltr;text-align:right}",
    "html[dir='rtl'] #faf-lang-toggle{left:auto}"
  ].join("\n");

  function applyPage() {
    var ar = isAr();
    var h = document.documentElement;
    h.setAttribute("lang", ar ? "ar" : "en");
    h.setAttribute("dir", ar ? "rtl" : "ltr");
    if (ar && !document.getElementById("faf-cairo")) {
      var l = document.createElement("link");
      l.id = "faf-cairo"; l.rel = "stylesheet";
      l.href = "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(l);
    }
    document.title = ar ? "فيد أ فريند — بوابة المتطوعين" : "Feed a Friend — Volunteer Portal";
  }

  function applyAll() {
    applyPage();
    processTree(document.getElementById("root") || document.body);
    processLinks(document);
  }

  function persist() {
    try { sessionStorage.setItem(KEY, pref); } catch (e) {}
    try {
      var u = new URL(location.href);
      if (pref === "ar") u.searchParams.set("lang", "ar"); else u.searchParams.delete("lang");
      history.replaceState(null, "", u.toString());
    } catch (e) {}
  }

  function notify() { listeners.slice().forEach(function (f) { try { f(); } catch (e) {} }); }

  // ───────────────────────── public API ─────────────────────────
  var api = {
    get lang() { return eff(); },
    get pref() { return pref; },
    isAr: isAr,
    setLang: function (l) {
      pref = l === "ar" ? "ar" : "en";
      persist(); applyAll(); notify();
    },
    toggle: function () { api.setLang(pref === "ar" ? "en" : "ar"); },
    onChange: function (f) { listeners.push(f); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; },
    // Staff (admin) screens stay English / left-to-right.
    setAdmin: function (v) {
      v = !!v;
      if (v === adminMode) return;
      adminMode = v; applyAll(); notify();
    },
    t: function (s) { return isAr() ? translateText(s) : s; },
    nat: function (n) { return isAr() && NAT_AR[n] ? NAT_AR[n] : n; },
    langName: function (l) { return isAr() && LANG_AR[l] ? LANG_AR[l] : l; },
    // Does `query` match this nationality/language in English or Arabic?
    matchNat: function (n, q) { return n.toLowerCase().indexOf(q) > -1 || (NAT_AR[n] || "").indexOf(q) > -1; },
    matchLang: function (l, q) { return l.toLowerCase().indexOf(q) > -1 || (LANG_AR[l] || "").indexOf(q) > -1; },
    // Reverse lookups so an Arabic name typed in resolves to the English value we store.
    natFromText: function (q, list) {
      q = (q || "").trim().toLowerCase();
      for (var i = 0; i < list.length; i++) if (list[i].toLowerCase() === q || (NAT_AR[list[i]] || "") === q) return list[i];
      return null;
    },
    num: function (x) { return isAr() ? toArDigits(String(x)) : String(x); },
    url: function (href) {
      try {
        var u = new URL(href, location.href);
        if (isAr()) u.searchParams.set("lang", "ar"); else u.searchParams.delete("lang");
        return u.toString();
      } catch (e) { return href; }
    }
  };
  window.FAF_I18N = api;

  // Native dialogs (alert / confirm) get translated too.
  var _alert = window.alert.bind(window), _confirm = window.confirm.bind(window);
  window.alert = function (m) { return _alert(api.t(String(m))); };
  window.confirm = function (m) { return _confirm(api.t(String(m))); };

  // ───────────────────────── live observer ─────────────────────────
  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);
  applyPage();

  function start() {
    var target = document.body;
    var obs = new MutationObserver(function (muts) {
      var linksDirty = false;
      for (var i = 0; i < muts.length; i++) {
        var m = muts[i];
        if (m.type === "characterData") processTextNode(m.target);
        else if (m.type === "attributes") processAttrs(m.target);
        else {
          for (var j = 0; j < m.addedNodes.length; j++) { processTree(m.addedNodes[j]); linksDirty = true; }
        }
      }
      if (linksDirty) processLinks(document);
    });
    obs.observe(target, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder"] });
    applyAll();
  }
  if (document.body) start(); else document.addEventListener("DOMContentLoaded", start);
})();
