import { plural } from '../../catalog';

export default {
  header: {
    planSubtitle: 'وجبات أسبوعك',
    toBuy: plural({
      zero: 'لا شيء للشراء',
      one: 'عنصر واحد للشراء',
      two: 'عنصران للشراء',
      few: '{count} عناصر للشراء',
      many: '{count} عنصرًا للشراء',
      other: '{count} عنصر للشراء',
    }),
    allSet: 'كل شيء جاهز حاليًا',
    mealPlanTab: 'الوجبات',
    shoppingTab: 'التسوّق',
    shoppingTabCount: 'التسوّق · {count}',
  },
  week: {
    previous: 'الأسبوع السابق',
    next: 'الأسبوع التالي',
  },
  summary: {
    kcalGoal: '/ {target} سعرة',
    proteinGoal: '/ {target} بروتين',
  },
  addToSlot: {
    breakfast: 'إضافة فطور',
    lunch: 'إضافة غداء',
    dinner: 'إضافة عشاء',
    snack: 'إضافة وجبة خفيفة',
  },
  removeFromPlan: 'إزالة من الخطة',
  shopWeek: {
    button: 'تسوّق هذا الأسبوع',
    empty: 'لا وجبات في الخطة بعد. بعد تخطيط بعضها، يمكنك التسوّق لها كلها بلمسة واحدة.',
    added: plural({
      zero: 'لم تُضف عناصر جديدة لهذا الأسبوع',
      one: 'أُضيف عنصر جديد واحد لهذا الأسبوع',
      two: 'أُضيف عنصران جديدان لهذا الأسبوع',
      few: 'أُضيفت {count} عناصر جديدة لهذا الأسبوع',
      many: 'أُضيف {count} عنصرًا جديدًا لهذا الأسبوع',
      other: 'أُضيف {count} عنصر جديد لهذا الأسبوع',
    }),
  },
  picker: {
    title: 'اختيار وصفة',
    searchPlaceholder: 'بحث في مكتبتك',
    cookLater: 'للطبخ لاحقًا',
  },
  shopping: {
    addPlaceholder: 'إضافة عنصر…',
    progress: plural({
      zero: '{done} من {count}',
      one: '{done} من عنصر واحد',
      two: '{done} من عنصرين',
      few: '{done} من {count} عناصر',
      many: '{done} من {count} عنصرًا',
      other: '{done} من {count} عنصر',
    }),
    clearTicked: 'إزالة المحدَّد',
    removeItem: 'إزالة {name}',
    emptyTitle: 'قائمتك فارغة',
    emptyBody: 'يمكنك إضافة مكوّنات من أي وصفة، أو تخطيط أسبوعك والتسوّق له بلمسة واحدة.',
  },
  addSheet: {
    title: 'إضافة إلى خطة الوجبات',
    servings: 'الحصص',
    add: 'إضافة إلى الخطة',
    plannedToday: 'أُضيفت لليوم · {slot}',
    plannedOn: 'أُضيفت ليوم {day} · {slot}',
  },
} as const;
