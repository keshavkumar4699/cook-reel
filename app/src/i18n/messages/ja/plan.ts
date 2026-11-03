import { plural } from '../../catalog';

/** Plan tab (meal plan and shopping list) and the add-to-plan sheet. */
export default {
  header: {
    planSubtitle: '1週間の献立',
    toBuy: plural({ other: '買うもの{count}点' }),
    allSet: '今のところ準備OK',
    mealPlanTab: '献立',
    shoppingTab: '買い物',
    shoppingTabCount: '買い物 · {count}',
  },
  week: {
    previous: '前の週',
    next: '次の週',
  },
  summary: {
    kcalGoal: '/ {target}kcal',
    proteinGoal: '/ たんぱく質{target}',
  },
  addToSlot: {
    breakfast: '朝食を追加',
    lunch: '昼食を追加',
    dinner: '夕食を追加',
    snack: '軽食を追加',
  },
  removeFromPlan: '献立から削除',
  shopWeek: {
    button: '今週の買い物リストを作る',
    empty: 'まず献立をいくつか決めると、ワンタップで買い物リストにできます。',
    added: plural({ other: '今週分の新しいアイテムを{count}点追加しました' }),
  },
  picker: {
    title: 'レシピを選ぶ',
    searchPlaceholder: 'レシピ帳を検索',
    cookLater: 'あとで作る',
  },
  shopping: {
    addPlaceholder: 'アイテムを追加…',
    progress: plural({ other: '{count}点中{done}点' }),
    clearTicked: 'チェック済みを削除',
    removeItem: '{name}を削除',
    emptyTitle: 'リストは空です',
    emptyBody: 'レシピから材料を追加するか、1週間の献立を立ててワンタップで買い物リストにしましょう。',
  },
  addSheet: {
    title: '献立に追加',
    servings: '人数',
    add: '献立に追加',
    plannedToday: '今日の{slot}に追加しました',
    plannedOn: '{day}曜の{slot}に追加しました',
  },
} as const;
