import { plural } from '../../catalog';

export default {
  hero: {
    title: 'المزيد من الطبخ مع شيف',
    notEnough: 'النقاط غير كافية',
    outOfCredits: 'نفدت نقاطك',
    body: 'دفعة جديدة من النقاط كل شهر للوصفات الذكية والتجارب ومقاطع خطوات YouTube.',
    bodyOut: 'يمكنك اختيار خطة لمواصلة ابتكار الوصفات وتحويل الفيديوهات إلى مقاطع خطوات. وصفاتك المحفوظة مجانية دائمًا.',
  },
  creditsLeft: plural({
    zero: 'لم تتبقَّ نقاط',
    one: 'تبقّت نقطة واحدة',
    two: 'تبقّت نقطتان',
    few: 'تبقّت {count} نقاط',
    many: 'تبقّت {count} نقطة',
    other: 'تبقّت {count} نقطة',
  }),
  period: {
    monthly: 'شهري',
    yearly: 'سنوي',
    yearlySave: 'سنوي · توفير {percent}%',
  },
  plans: {
    basic: {
      name: 'أساسي',
      tagline: 'لبضعة أطباق جديدة كل أسبوع',
      perks: {
        ai: 'وصفات ذكية ووضع الثلاجة واللمسات',
        youtube: 'مقاطع خطوات من YouTube وShorts',
        topups: 'باقات نقاط إضافية عند النفاد',
      },
    },
    pro: {
      name: 'برو',
      tagline: 'لمن يطبخ معظم الأيام',
      perks: {
        everything: 'كل مزايا «أساسي»',
        credits: 'أكثر من 3 أضعاف نقاط «أساسي»',
      },
    },
    max: {
      name: 'ماكس',
      tagline: 'لمحبي التحضير المسبق ومبتكري الوصفات',
      perks: {
        everything: 'كل مزايا «برو»',
        value: 'أفضل سعر للنقطة',
      },
    },
  },
  planA11y: {
    monthly: '{name}، {price} شهريًا',
    yearly: '{name}، {price} سنويًا',
  },
  badges: {
    current: 'الحالية',
    mostPopular: 'الأكثر شيوعًا',
  },
  perMonth: 'شهريًا',
  perMonthApprox: '≈ {price}/شهر',
  monthlyCredits: plural({
    zero: 'لا نقاط شهرية',
    one: 'نقطة واحدة كل شهر',
    two: 'نقطتان كل شهر',
    few: '{count} نقاط كل شهر',
    many: '{count} نقطة كل شهر',
    other: '{count} نقطة كل شهر',
  }),
  approxRecipes: plural({
    zero: '≈ {count} وصفة',
    one: '≈ وصفة واحدة',
    two: '≈ وصفتان',
    few: '≈ {count} وصفات',
    many: '≈ {count} وصفة',
    other: '≈ {count} وصفة',
  }),
  costs: {
    title: 'ما الذي يستهلك النقاط',
    recipe: 'وصفة ذكية من شيف',
    experiment: 'نسخة معدّلة من وصفة',
    youtube: 'تقسيم فيديو YouTube',
    youtubeShort: 'تقسيم YouTube Short',
    free: 'الحفظ والتخطيط ووضع الطبخ',
    freeValue: 'مجانًا',
    note: 'أسئلة شيف مجانية. تُعاد نقاط الاستيراد الفاشل تلقائيًا. تتجدد النقاط الشهرية مع كل شهر فوترة، أما النقاط الإضافية فلا تنتهي صلاحيتها أبدًا.',
  },
  topups: {
    title: 'باقات نقاط إضافية',
    unit: plural({ zero: 'نقطة', one: 'نقطة', two: 'نقطة', few: 'نقاط', many: 'نقطة', other: 'نقطة' }),
    a11y: plural({
      zero: '{count} نقطة مقابل {price}',
      one: 'نقطة واحدة مقابل {price}',
      two: 'نقطتان مقابل {price}',
      few: '{count} نقاط مقابل {price}',
      many: '{count} نقطة مقابل {price}',
      other: '{count} نقطة مقابل {price}',
    }),
  },
  links: {
    restore: 'استعادة المشتريات',
    terms: 'الشروط',
    privacy: 'الخصوصية',
  },
  renewal: 'تتجدد الاشتراكات تلقائيًا ما لم تُلغَ من إعدادات {store} قبل 24 ساعة على الأقل من نهاية الفترة.',
  genericStore: 'متجر التطبيقات',
  cta: {
    signUp: 'إنشاء حساب للاشتراك',
    current: 'خطتك الحالية: {plan}',
    continue: 'المتابعة مع {plan}',
    perMonth: '{price}/شهر',
    perYear: '{price}/سنة',
  },
  toasts: {
    unavailable: 'هذا المنتج غير متوفر في متجرك بعد.',
    appsOnly: 'المشتريات متاحة في تطبيقَي iOS وAndroid.',
    done: plural({
      zero: 'كل شيء جاهز.',
      one: 'كل شيء جاهز — نقطة واحدة بانتظارك.',
      two: 'كل شيء جاهز — نقطتان بانتظارك.',
      few: 'كل شيء جاهز — {count} نقاط بانتظارك.',
      many: 'كل شيء جاهز — {count} نقطة بانتظارك.',
      other: 'كل شيء جاهز — {count} نقطة بانتظارك.',
    }),
    restored: 'استُعيدت المشتريات',
  },
  errors: {
    purchaseFailed: 'لم تكتمل عملية الشراء.',
    restoreFailed: 'تعذّرت استعادة المشتريات.',
  },
} as const;
