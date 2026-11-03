import { plural } from '../../catalog';

export default {
  subtitle: plural({
    zero: 'لا وصفات محفوظة على هذا الهاتف',
    one: 'وصفة واحدة محفوظة على هذا الهاتف',
    two: 'وصفتان محفوظتان على هذا الهاتف',
    few: '{count} وصفات محفوظة على هذا الهاتف',
    many: '{count} وصفة محفوظة على هذا الهاتف',
    other: '{count} وصفة محفوظة على هذا الهاتف',
  }),
  newRecipe: 'وصفة جديدة',
  search: {
    placeholder: 'بحث في الوصفات والمكوّنات والوسوم',
    clear: 'مسح البحث',
  },
  filters: {
    all: 'الكل',
    cookLater: 'للطبخ لاحقًا',
    mine: 'وصفاتي',
    variations: 'نسخ معدّلة',
    quick: '≤ {duration}',
    protein: 'غنية بالبروتين',
    light: 'أقل من {kcal} سعرة',
    mealPrep: 'تحضير مسبق',
  },
  collections: {
    new: 'مجموعة جديدة',
    delete: 'حذف المجموعة',
  },
  newCollection: {
    title: 'مجموعة جديدة',
    subtitle: 'وصفاتك مرتّبة على طريقتك — «عطلة الأسبوع»، «للأطفال»، «العزائم»…',
    namePlaceholder: 'اسم المجموعة',
    create: 'إنشاء المجموعة',
    hint: 'يمكنك إضافة وصفات إليها من قائمة ••• في أي وصفة.',
  },
  noResults: {
    title: 'لا نتائج مطابقة',
    body: 'يمكنك تجربة بحث أو فلتر آخر.',
  },
  emptyLibrary: {
    title: 'كتاب طبخك يبدأ من هنا',
    body: 'يمكنك حفظ وصفات من YouTube، أو ابتكارها مع شيف، أو كتابة وصفاتك الخاصة.',
    action: 'إضافة وصفة',
  },
  collectionSheet: {
    title: 'المجموعات',
    subtitle: 'اضغط للإضافة أو الإزالة',
    empty: 'لا مجموعات بعد — ابدأ بإنشاء أول مجموعة.',
    newPlaceholder: 'مجموعة جديدة',
  },
} as const;
