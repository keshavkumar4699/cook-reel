import { plural } from '../../catalog';

export default {
  createSheet: {
    title: 'إضافة وصفة',
    subtitleSignedIn: 'خيارات الذكاء الاصطناعي تستهلك نقاطًا',
    subtitleGuest: 'خيارات الذكاء الاصطناعي تتطلب حسابًا مجانيًا',
    aiBadge: 'AI',
    youtubeTitle: 'من فيديو على YouTube',
    youtubeBody: 'رابط واحد يتحول إلى مقاطع خطوة بخطوة',
    chefTitle: 'ابتكار مع شيف',
    chefBody: 'وصف ما في بالك، ثم بضعة أسئلة',
    fridgeTitle: 'الطبخ مما في ثلاجتي',
    fridgeBody: 'ما لديك يتحول إلى وصفة مع شيف',
    manualTitle: 'كتابة وصفتي',
    manualBody: 'لحفظ وصفة عائلية أو من ابتكارك',
  },
  creditsPill: {
    a11y: plural({
      zero: 'لا نقاط. الحصول على المزيد',
      one: 'نقطة واحدة. الحصول على المزيد',
      two: 'نقطتان. الحصول على المزيد',
      few: '{count} نقاط. الحصول على المزيد',
      many: '{count} نقطة. الحصول على المزيد',
      other: '{count} نقطة. الحصول على المزيد',
    }),
  },
  stepper: {
    decrease: 'إنقاص',
    increase: 'زيادة',
  },
  hero: {
    sideStep: 'الخطوة {n}',
    stepOf: 'الخطوة {current} من {total} · {range}',
    stepTitle: 'تقليب النودلز',
    sayNext: 'قل «التالي»',
  },
} as const;
