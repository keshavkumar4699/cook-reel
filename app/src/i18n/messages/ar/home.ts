export default {
  nameTitle: '{name} 👋',
  guestTitle: 'أهلًا وسهلًا 👋',
  composer: {
    title: 'ماذا نطبخ اليوم؟',
    placeholder: 'مثلًا: دجاج حار في 20 دقيقة',
    inputLabel: 'وصف الطبق المطلوب',
    send: 'إرسال إلى شيف',
  },
  prompts: {
    highProteinDinner: 'عشاء غني بالبروتين',
    quickBreakfast: 'فطور في 15 دقيقة',
    cosyDal: 'شوربة عدس دافئة لشخص واحد',
    useLeftovers: 'الاستفادة من بقايا الطعام',
    cheapFilling: 'رخيص ومُشبع',
    impressDate: 'عشاء رومانسي يُبهر',
  },
  actions: {
    youtube: { title: 'من YouTube', body: 'فيديو ← مقاطع خطوات' },
    builder: { title: 'ابتكار مع شيف', body: 'وصف أي طبق' },
    fridge: { title: 'من ثلاجتي', body: 'بما هو متوفر لديك' },
    manual: { title: 'كتابة وصفتي', body: 'أطباق العائلة المفضلة' },
  },
  upsell: {
    badge: 'نقاط مجانية',
    title: 'شيف ومقاطع YouTube بانتظارك',
    body: 'حساب مجاني يفتح لك ميزات الذكاء الاصطناعي — وأولى وصفاتك علينا.',
  },
  sections: {
    cookLater: { title: 'للطبخ لاحقًا', subtitle: 'محفوظة لوقت الجوع' },
    quick: { title: 'سريعة وغنية بالبروتين', subtitle: 'أطباق سريعة ومُشبعة' },
    experiments: { title: 'تجاربك', subtitle: 'لمسات ابتكرتها مع شيف' },
    recent: { title: 'أُضيفت مؤخرًا', subtitle: 'الجديد في مكتبتك' },
  },
  voiceTip: {
    title: 'طبخ دون لمس الشاشة',
    body: 'في وضع الطبخ، قل «التالي» أو «السابق» أو «توقف» — لا حاجة إلى لمس الشاشة بيدين متّسختين.',
    dismiss: 'إخفاء النصيحة',
  },
} as const;
