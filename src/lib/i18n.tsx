import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "ru" | "kk";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  ru: {
    "nav.dashboard": "Главная",
    "nav.transactions": "Транзакции",
    "nav.categories": "Категории",
    "nav.upload": "Загрузка",
    "nav.taxes": "Налоги",
    "nav.analytics": "Аналитика",
    "nav.reminders": "Напоминания",
    "nav.settings": "Настройки",
    "dashboard.title": "Панель управления",
    "dashboard.totalIncome": "Общий доход",
    "dashboard.totalExpenses": "Общие расходы",
    "dashboard.netProfit": "Чистая прибыль",
    "dashboard.estimatedTax": "Расчетный налог",
    "dashboard.thisYear": "За этот год",
    "dashboard.recentTransactions": "Последние транзакции",
    "dashboard.upcomingDeadlines": "Предстоящие платежи",
    "dashboard.monthlyOverview": "Обзор по месяцам",
    "dashboard.noTransactions": "Нет транзакций",
    "dashboard.addFirst": "Добавьте первую транзакцию или загрузите выписку",
    "dashboard.noPayments": "Нет предстоящих платежей",
    "transactions.title": "Транзакции",
    "transactions.add": "Добавить",
    "transactions.income": "Доход",
    "transactions.expense": "Расход",
    "transactions.all": "Все",
    "transactions.date": "Дата",
    "transactions.amount": "Сумма",
    "transactions.description": "Описание",
    "transactions.category": "Категория",
    "transactions.type": "Тип",
    "transactions.save": "Сохранить",
    "transactions.cancel": "Отмена",
    "transactions.delete": "Удалить",
    "categories.title": "Категории",
    "categories.add": "Добавить категорию",
    "categories.name": "Название",
    "categories.icon": "Иконка",
    "categories.forIncome": "Для доходов",
    "categories.forExpense": "Для расходов",
    "upload.title": "Загрузка выписок",
    "upload.description": "Импортируйте банковскую выписку для автоматического добавления транзакций",
    "upload.selectFile": "Выберите файл",
    "upload.dragDrop": "или перетащите сюда",
    "upload.supportedFormats": "Поддерживаемые форматы",
    "upload.import": "Импортировать",
    "upload.transactionsFound": "Транзакций найдено",
    "upload.errors": "Ошибок",
    "upload.preview": "Предпросмотр транзакций",
    "upload.selected": "Выбрано",
    "upload.notes": "Замечания",
    "taxes.title": "Налоговый калькулятор",
    "taxes.period": "Период",
    "taxes.year": "Год",
    "taxes.quarter": "Квартал",
    "taxes.calculate": "Рассчитать",
    "taxes.income": "Доходы",
    "taxes.expenses": "Расходы",
    "taxes.taxableBase": "Налогооблагаемая база",
    "taxes.taxAmount": "Сумма налога",
    "taxes.rate": "Ставка",
    "analytics.title": "Аналитика",
    "analytics.incomeVsExpenses": "Доходы vs Расходы",
    "analytics.byCategory": "По категориям",
    "analytics.trend": "Динамика",
    "reminders.title": "Налоговые напоминания",
    "reminders.dueDate": "Срок оплаты",
    "reminders.paid": "Оплачено",
    "reminders.unpaid": "Не оплачено",
    "reminders.markPaid": "Отметить оплаченным",
    "settings.title": "Настройки",
    "settings.language": "Язык",
    "settings.theme": "Тема",
    "settings.taxSystem": "Налоговая система",
    "common.loading": "Загрузка...",
    "common.error": "Ошибка",
    "common.success": "Успешно",
    "common.confirm": "Подтвердить",
    "common.of": "из",
    "nav.assistant": "ИИ-ассистент",
    "assistant.title": "Финансовый ИИ-ассистент",
    "assistant.subtitle": "Задайте вопрос о налогах, финансах или бухгалтерии для ИП в Казахстане",
    "assistant.placeholder": "Например: Какие налоги платит ИП на упрощёнке?",
    "assistant.send": "Отправить",
    "assistant.thinking": "Думаю...",
    "assistant.error": "Не удалось получить ответ. Попробуйте позже.",
    "assistant.noApiKey": "API ключ OpenAI не настроен. Обратитесь к администратору.",
  },
  kk: {
    "nav.dashboard": "Басты бет",
    "nav.transactions": "Транзакциялар",
    "nav.categories": "Санаттар",
    "nav.upload": "Жүктеу",
    "nav.taxes": "Салықтар",
    "nav.analytics": "Талдау",
    "nav.reminders": "Еске салулар",
    "nav.settings": "Баптаулар",
    "dashboard.title": "Басқару тақтасы",
    "dashboard.totalIncome": "Жалпы кіріс",
    "dashboard.totalExpenses": "Жалпы шығыс",
    "dashboard.netProfit": "Таза пайда",
    "dashboard.estimatedTax": "Болжамды салық",
    "dashboard.thisYear": "Осы жылға",
    "dashboard.recentTransactions": "Соңғы транзакциялар",
    "dashboard.upcomingDeadlines": "Алдағы төлемдер",
    "dashboard.monthlyOverview": "Айлық шолу",
    "dashboard.noTransactions": "Транзакциялар жоқ",
    "dashboard.addFirst": "Алғашқы транзакцияны қосыңыз немесе үзінді жүктеңіз",
    "dashboard.noPayments": "Алдағы төлемдер жоқ",
    "transactions.title": "Транзакциялар",
    "transactions.add": "Қосу",
    "transactions.income": "Кіріс",
    "transactions.expense": "Шығыс",
    "transactions.all": "Барлығы",
    "transactions.date": "Күні",
    "transactions.amount": "Сома",
    "transactions.description": "Сипаттама",
    "transactions.category": "Санат",
    "transactions.type": "Түрі",
    "transactions.save": "Сақтау",
    "transactions.cancel": "Бас тарту",
    "transactions.delete": "Жою",
    "categories.title": "Санаттар",
    "categories.add": "Санат қосу",
    "categories.name": "Атауы",
    "categories.icon": "Белгіше",
    "categories.forIncome": "Кіріс үшін",
    "categories.forExpense": "Шығыс үшін",
    "upload.title": "Үзінділерді жүктеу",
    "upload.description": "Транзакцияларды автоматты түрде қосу үшін банк үзіндісін импорттаңыз",
    "upload.selectFile": "Файлды таңдаңыз",
    "upload.dragDrop": "немесе осында сүйреңіз",
    "upload.supportedFormats": "Қолданылатын форматтар",
    "upload.import": "Импорттау",
    "upload.transactionsFound": "Транзакциялар табылды",
    "upload.errors": "Қателер",
    "upload.preview": "Транзакцияларды алдын ала қарау",
    "upload.selected": "Таңдалды",
    "upload.notes": "Ескертпелер",
    "taxes.title": "Салық калькуляторы",
    "taxes.period": "Кезең",
    "taxes.year": "Жыл",
    "taxes.quarter": "Тоқсан",
    "taxes.calculate": "Есептеу",
    "taxes.income": "Кірістер",
    "taxes.expenses": "Шығыстар",
    "taxes.taxableBase": "Салық салынатын база",
    "taxes.taxAmount": "Салық сомасы",
    "taxes.rate": "Мөлшерлеме",
    "analytics.title": "Талдау",
    "analytics.incomeVsExpenses": "Кірістер мен шығыстар",
    "analytics.byCategory": "Санат бойынша",
    "analytics.trend": "Динамика",
    "reminders.title": "Салық еске салулары",
    "reminders.dueDate": "Төлем мерзімі",
    "reminders.paid": "Төленді",
    "reminders.unpaid": "Төленбеді",
    "reminders.markPaid": "Төленген деп белгілеу",
    "settings.title": "Баптаулар",
    "settings.language": "Тіл",
    "settings.theme": "Тақырып",
    "settings.taxSystem": "Салық жүйесі",
    "common.loading": "Жүктелуде...",
    "common.error": "Қате",
    "common.success": "Сәтті",
    "common.confirm": "Растау",
    "common.of": "-ден/-дан",
    "nav.assistant": "AI-көмекші",
    "assistant.title": "Қаржылық AI-көмекші",
    "assistant.subtitle": "Қазақстандағы ЖК салықтары, қаржысы немесе бухгалтериясы туралы сұрақ қойыңыз",
    "assistant.placeholder": "Мысалы: Жеңілдетілген салық төлейтін ЖК қандай салықтар төлейді?",
    "assistant.send": "Жіберу",
    "assistant.thinking": "Ойлаймын...",
    "assistant.error": "Жауап алу мүмкін болмады. Кейінірек көріңіз.",
    "assistant.noApiKey": "OpenAI API кілті орнатылмаған. Әкімшіге хабарласыңыз.",
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("esepte-language");
      return (saved as Language) || "ru";
    }
    return "ru";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("esepte-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted">
      <button
        onClick={() => setLanguage("ru")}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          language === "ru" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        data-testid="button-lang-ru"
      >
        РУС
      </button>
      <button
        onClick={() => setLanguage("kk")}
        className={`px-3 py-1 text-sm rounded-md transition-colors ${
          language === "kk" ? "bg-background shadow-sm" : "hover:bg-background/50"
        }`}
        data-testid="button-lang-kk"
      >
        ҚАЗ
      </button>
    </div>
  );
}
