import { plural } from '../../catalog';

export default {
  notFound: {
    title: 'الوصفة غير موجودة',
    body: 'ربما حُذفت.',
    action: 'العودة إلى المكتبة',
  },
  youtubeShort: 'Short',
  variationOf: 'نسخة معدّلة من {title}',
  stats: {
    totalTime: 'الوقت الكلي',
    kcalPerServing: 'سعرة / حصة',
    protein: 'بروتين',
  },
  badges: {
    mealPrep: 'تحضير مسبق',
    costPerServing: '{price} / حصة',
  },
  changes: {
    title: 'ما الذي تغيّر',
  },
  servings: {
    title: 'الحصص',
    asWritten: 'كما في الوصفة',
    scaled: 'الكميات ×{factor}',
  },
  sections: {
    equipment: 'الأدوات اللازمة',
    ingredients: 'المكوّنات',
    addToList: 'إلى القائمة',
    ingredientsHint: 'اضغط على ما هو متوفر لديك لشطبه.',
    method: 'طريقة التحضير',
    storage: 'حفظ البقايا',
  },
  experiment: {
    title: 'تجربة',
    variations: plural({
      zero: 'لا نسخ معدّلة',
      one: 'نسخة معدّلة واحدة',
      two: 'نسختان معدّلتان',
      few: '{count} نسخ معدّلة',
      many: '{count} نسخة معدّلة',
      other: '{count} نسخة معدّلة',
    }),
    create: 'إنشاء نسخة معدّلة',
    headline: 'وصفة على ذوقك',
    body: 'نباتية، بروتين أكثر، في القلاية الهوائية، أرخص… وشيف يعيد كتابتها.',
    variation: 'نسخة معدّلة',
  },
  notes: {
    title: 'ملاحظاتك',
    placeholder: 'فلفل حار أقل في المرة القادمة، وعصرة ليمون…',
  },
  rating: {
    title: 'كيف كانت؟',
    rate: plural({
      zero: 'تقييم {count} من 5',
      one: 'تقييم {count} من 5',
      two: 'تقييم {count} من 5',
      few: 'تقييم {count} من 5',
      many: 'تقييم {count} من 5',
      other: 'تقييم {count} من 5',
    }),
    timesCooked: plural({
      zero: 'لم تُطبخ بعد',
      one: 'طُبخت مرة واحدة',
      two: 'طُبخت مرتين',
      few: 'طُبخت {count} مرات',
      many: 'طُبخت {count} مرة',
      other: 'طُبخت {count} مرة',
    }),
  },
  cookLater: {
    save: 'حفظ للطبخ لاحقًا',
    add: 'للطبخ لاحقًا',
    remove: 'إزالة من «للطبخ لاحقًا»',
    saved: 'حُفظت في «للطبخ لاحقًا»',
    removed: 'أُزيلت من «للطبخ لاحقًا»',
  },
  menu: {
    more: 'المزيد',
    edit: 'تعديل الوصفة',
    addToCollection: 'إضافة إلى مجموعة',
    addToPlan: 'إضافة إلى خطة الوجبات',
    addToShopping: 'إضافة المكوّنات إلى قائمة التسوّق',
    share: 'مشاركة الوصفة',
    delete: 'حذف الوصفة',
  },
  deleteConfirm: {
    title: 'حذف هذه الوصفة؟',
    message: 'ستُحذف من هذا الهاتف.',
  },
  toasts: {
    addedToShopping: plural({
      zero: 'لم يُضف أي عنصر إلى قائمة التسوّق',
      one: 'أُضيف عنصر واحد إلى قائمة التسوّق',
      two: 'أُضيف عنصران إلى قائمة التسوّق',
      few: 'أُضيفت {count} عناصر إلى قائمة التسوّق',
      many: 'أُضيف {count} عنصرًا إلى قائمة التسوّق',
      other: 'أُضيف {count} عنصر إلى قائمة التسوّق',
    }),
    shoppingUpdated: 'حُدّثت قائمة التسوّق',
    view: 'عرض',
    deleted: 'حُذفت الوصفة',
  },
  cta: {
    experiment: 'تجربة',
    startCooking: 'لنبدأ الطبخ',
    narratedClips: 'مقاطع بتعليق صوتي',
    videoClips: 'مقاطع فيديو',
    voiceGuided: 'بإرشاد صوتي',
  },

  facts: {
    kcal: '{n} سعرة',
    protein: '{n} غ بروتين',
  },

  nutrition: {
    title: 'القيمة الغذائية',
    kcalUnit: 'سعرة',
    serving: 'للحصة',
    allServings: plural({
      zero: 'الكل ({count})',
      one: 'الكل ({count})',
      two: 'الكل ({count})',
      few: 'الكل ({count})',
      many: 'الكل ({count})',
      other: 'الكل ({count})',
    }),
    barLabel: 'السعرات حسب العناصر الغذائية الكبرى',
    protein: 'بروتين',
    carbs: 'نشويات',
    fat: 'دهون',
    fibre: 'ألياف',
    disclaimer: 'قيم تقديرية مبنية على بيانات غذائية قياسية. تختلف القيم باختلاف العلامات التجارية وأحجام الحصص.',
  },

  ingredients: {
    line: '{quantity} {name}',
    optional: 'اختياري',
    toTaste: 'حسب الذوق',
    swapWith: 'بدائل: {items}',
    substitutesFor: 'بدائل {name}',
  },

  steps: {
    doneWhen: 'علامة الجاهزية:',
    clipRange: '{start}–{end}',
    glossaryTerm: '{term}:',
  },
} as const;
