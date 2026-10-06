/**
 * Sana Insights (سَـنَـا البَصِيرَة) Data Module
 * Inspiring, authentic spiritual and academic reflections for Palestinian students
 * Platform: مِشكاتي (Mishkati)
 */

export interface SanaItem {
  id: number;
  text: string;
  period: 'morning' | 'night' | 'all';
  category?: 'spiritual' | 'academic' | 'motivation' | 'patriotism';
  source?: string;
}

export const SANA_INSIGHTS: SanaItem[] = [
  // --- صباحية (Morning Insights) ---
  {
    id: 1,
    text: "«بُورِكَ لِأُمَّتِي فِي بُكُورِهَا»؛ فابدأ يومك بنية صالحة وعزيمة لا تلين، فإن بركة الصباح مفتاح كل نجاح.",
    period: "morning",
    category: "spiritual",
    source: "حديث نبوي شريف"
  },
  {
    id: 2,
    text: "ما أشرقت شمس يومٍ إلا نادت: يا طالب العلم، أنا خَلْقٌ جديد، وعلى سَعْيِكَ شهيد، فاغتنم لحظاتي بالجد والتفوق.",
    period: "morning",
    category: "motivation",
    source: "مأثور الحكمة"
  },
  {
    id: 3,
    text: "العلم صيدٌ والكتابة قيده؛ قيّد فتوحات ذهنك مع أول بزوغ النور، وتوكّل على الحيّ القيوم.",
    period: "morning",
    category: "academic",
    source: "الإمام الشافعي"
  },
  {
    id: 4,
    text: "من استفتح صباحه بذكر الله، هانت عليه أصعب المسائل وانشرح صدره لفهم أدق العلوم.",
    period: "morning",
    category: "spiritual",
    source: "نور المشكاة"
  },
  {
    id: 5,
    text: "صباحك أملٌ يتجدد؛ تعثر الأمس درسٌ مضى، وفجر اليوم بدايةٌ لصعود قمم جديدة بإذن الله.",
    period: "morning",
    category: "motivation",
    source: "سنا البصيرة"
  },
  {
    id: 6,
    text: "طالب العلم في فلسطين لا يحمل قلماً فحسب؛ بل يحمل أمانة أمة، وشرف مرابطة، وعزّة وطن.",
    period: "morning",
    category: "patriotism",
    source: "رسالة إلى الطالب الفلسطيني"
  },
  {
    id: 7,
    text: "اللهم إنا نسألك في هذا الصباح علماً نافعاً، وذهناً متوقداً، ورزقاً طيباً، وعملاً متقبلاً.",
    period: "morning",
    category: "spiritual",
    source: "الدعاء النبوي"
  },

  // --- مسائية ولَيْلِيَّة (Night Insights) ---
  {
    id: 8,
    text: "استودع الله ما بذلت اليوم من جهد وسهر، ونَم قرير العين؛ فإن ربك لا يُضيع أجر المحسنين.",
    period: "night",
    category: "spiritual",
    source: "وعد القرآن الكريم"
  },
  {
    id: 9,
    text: "قليلٌ دائم خيرٌ من كثيرٍ منقطع؛ تفكّر فيما حصدته اليوم بحمدٍ وسكينة، واشحن همتك لغدٍ واعد.",
    period: "night",
    category: "academic",
    source: "حكمة نبوية"
  },
  {
    id: 10,
    text: "الراحة بنية التقوي على طاعة الله وإكمال مسيرة العلم عبادةٌ يؤجر عليها المؤمن؛ فأرِح جسدك بسلام.",
    period: "night",
    category: "spiritual",
    source: "فقه النية"
  },
  {
    id: 11,
    text: "ألقِ هموم الامتحانات والنتائج بين يدي مدبّر الأمر؛ فما قُدّر لك من الخير سيسوقه الله إليك.",
    period: "night",
    category: "motivation",
    source: "سنا البصيرة"
  },
  {
    id: 12,
    text: "أفضل ختام ليومك ركعة وترٍ في جوف الليل؛ تستنير بها بصيرتك، ودعوة صادقة للقدس وفلسطين.",
    period: "night",
    category: "spiritual",
    source: "زاد المرابط"
  },
  {
    id: 13,
    text: "طوبى لمن انقضى نهاره في طلب العلم، وأقبل ليله بالاستغفار وشكر المنعم على فضل الفهم.",
    period: "night",
    category: "spiritual",
    source: "آداب الطالب"
  },
  {
    id: 14,
    text: "فلتكن آخر خواطرك قبل النوم: «رضيت بالله رباً، وبالإسلام ديناً، وبمحمدٍ ﷺ نبياً ورسولاً».",
    period: "night",
    category: "spiritual",
    source: "أذكار المساء"
  },

  // --- عامة طوال اليوم (All-Day Insights) ---
  {
    id: 15,
    text: "«مَن سَلَكَ طَرِيقاً يَلْتَمِسُ فِيهِ عِلْماً، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقاً إِلَى الجَنَّةِ».",
    period: "all",
    category: "spiritual",
    source: "صحيح مسلم"
  },
  {
    id: 16,
    text: "ليس العلم ما حُفِظ، إنما العلم ما نَفَع وظهر أثره في حُسن العمل وخدمة الناس.",
    period: "all",
    category: "academic",
    source: "الإمام الشافعي"
  },
  {
    id: 17,
    text: "إذا استعصت عليك مسألة في درسك أو امتحانك؛ فأكثر من الاستغفار، فإن الاستغفار يفتح مغاليق الفهم.",
    period: "all",
    category: "academic",
    source: "ابن تيمية رحمه الله"
  },
  {
    id: 18,
    text: "سلاح الطالب الفلسطيني هو وعيه المتين وثباته العلمي؛ فالعلم نورٌ به نحفظ الأرض ونبني المجد.",
    period: "all",
    category: "patriotism",
    source: "صوت فلسطين"
  },
  {
    id: 19,
    text: "اصبر على كدّ التعلم وسهر الليالي؛ فما نال العلا من خاف التعب، وحلاوة النجاح تُنسي مرارة السعي.",
    period: "all",
    category: "motivation",
    source: "ديوان الحكمة"
  },
  {
    id: 20,
    text: "«وَقُل رَّبِّ زِدْنِي عِلْمًا»؛ لم يأمر الله نبيه بالاستزادة من شيء في القرآن إلا من العلم لشرفه.",
    period: "all",
    category: "spiritual",
    source: "سورة طه: 114"
  },
  {
    id: 21,
    text: "الهمة العالية لا تقنع بالدون؛ اجعل سقف طموحك خدمة دينك وأهلك، وتفوّق لتكون قدوة مباركة.",
    period: "all",
    category: "motivation",
    source: "سنا البصيرة"
  },
  {
    id: 22,
    text: "ركّز في اللحظة التي بين يديك؛ صفحة تتقنها ومسألة تفهمها خيرٌ من تشتيت الذهن في الغد.",
    period: "all",
    category: "academic",
    source: "مهارات المذاكرة الذكية"
  },
  {
    id: 23,
    text: "تثبيت العلم يكون بالعمل به، وبذل زكاته يكون في تعليم من حولك ومساعدتهم.",
    period: "all",
    category: "spiritual",
    source: "الإمام النووي"
  },
  {
    id: 24,
    text: "تذكّر وأنت تذاكر: الملائكة تضع أجنحتها رضا لطالب العلم بما يصنع؛ فاستحضر هيبة هذا المجلس.",
    period: "all",
    category: "spiritual",
    source: "جامع الترمذي"
  }
];
