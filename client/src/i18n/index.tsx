"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "en" | "ru";

type TranslationValue = string | TranslationDictionary;
interface TranslationDictionary {
  [key: string]: TranslationValue;
}
type TemplateVars = Record<string, string | number>;

type TranslationContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, vars?: TemplateVars) => string;
};

const translations: Record<Locale, TranslationDictionary> = {
  en: {
    common: {
      appName: "Stockify",
      loading: "Loading...",
      failedToFetch: "Failed to fetch data",
      cancel: "Cancel",
      create: "Create",
      saveChanges: "Save Changes",
      changePassword: "Change Password",
      updatePassword: "Update Password",
      signOut: "Sign Out",
      uploadNew: "Upload New",
      stockLabel: "Stock",
      searchPlaceholder: "Start typing to search groups & products",
      searchProductPlaceholder: "Search product...",
      price: "Price",
      rating: "Rating",
      id: "ID",
      name: "Name",
      email: "Email",
      actions: "Actions",
      lastSignIn: "Last sign-in",
      joined: "Joined",
      notAvailable: "N/A",
      kSold: "{{count}}k Sold",
      daysLabel: "{{count}} days",
      highestSalesDate: "Highest Sales Date: {{date}}",
      averageLabel: "Average",
      increase: "{{value}} Increase",
      unknownDate: "Unknown date",
      createdOn:
        "You successfully registered on {{date}}. We are glad to have you here.",
      categoryAll: "All",
      categoryOffice: "Office",
      categoryProfessional: "Professional",
      categorySalaries: "Salaries",
    },
    navbar: {
      languageLabel: "Language",
    },
    sidebar: {
      dashboard: "Dashboard",
      inventory: "Inventory",
      products: "Products",
      users: "Developer",
      settings: "Settings",
      expenses: "Expenses",
      footer: "© 2025 Stockify",
    },
    dashboard: {
      popularProductsTitle: "Popular Products",
      salesSummaryTitle: "Sales Summary",
      valueLabel: "Value",
      timeframeDaily: "Daily",
      timeframeWeekly: "Weekly",
      timeframeMonthly: "Monthly",
      purchaseSummaryTitle: "Purchase Summary",
      purchasedLabel: "Purchased",
      expenseSummaryTitle: "Expense Summary",
      expenseCategorySuffix: "{{category}} Expenses",
      statCards: {
        customerExpensesTitle: "Customer & Expenses",
        dateRange: "22 - 29 October 2023",
        customerGrowth: "Customer Growth",
        expenseGrowth: "Expense Growth",
        duesOrdersTitle: "Dues & Pending Orders",
        dues: "Dues",
        pendingOrders: "Pending Orders",
        salesDiscountTitle: "Sales & Discount",
        sales: "Sales",
        discount: "Discount",
      },
    },
    expenses: {
      title: "Expenses by Category",
      subtitle: "A visual representation of expenses over time.",
      filterTitle: "Filter by Category and Date",
      categoryLabel: "Category",
      amountLabel: "Amount",
      dateLabel: "Date",
      downloadReport: "Download CSV report",
      downloadHelper: "Exports the current view with applied filters.",
      startDateLabel: "Start Date",
      endDateLabel: "End Date",
      categories: {
        all: "All",
        office: "Office",
        professional: "Professional",
        salaries: "Salaries",
      },
      error: "Failed to fetch expenses",
    },
    inventory: {
      title: "Inventory",
      error: "Failed to fetch products",
      columns: {
        productName: "Product Name",
        stockQuantity: "Stock Quantity",
      },
    },
    products: {
      title: "Products",
      createButton: "Create Product",
      stockPrefix: "Stock:",
      modalTitle: "Create New Product",
      error: "Failed to fetch products",
      form: {
        productName: "Product Name",
        price: "Price",
        stockQuantity: "Stock Quantity",
        rating: "Rating",
        create: "Create",
        cancel: "Cancel",
        namePlaceholder: "Name",
        pricePlaceholder: "Price",
        stockPlaceholder: "Stock Quantity",
        ratingPlaceholder: "Rating",
      },
    },
    notifications: {
      title: "Notifications",
      welcomeTitle: "Welcome to Stockify!",
      welcomeBody:
        "You successfully registered on {{date}}. We are glad to have you here.",
      adminTitle: "Admin Access Granted",
      adminBody:
        "You have been granted admin privileges. You now have access to the Users page.",
    },
    settings: {
      title: "User Settings",
      success: "Profile updated successfully!",
      table: {
        setting: "Setting",
        value: "Value",
      },
      fields: {
        profilePicture: "Profile Picture",
        username: "Username",
        email: "Email",
        darkMode: "Dark Mode",
      },
      buttons: {
        saveChanges: "Save Changes",
        changePassword: "Change Password",
        signOut: "Sign Out",
      },
      uploadNew: "Upload New",
      errors: {
        profilePicture: "Failed to update profile picture",
        updateProfile: "Failed to update profile",
      },
      passwordModal: {
        title: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        cancel: "Cancel",
        update: "Update Password",
      },
      passwordErrors: {
        mismatch: "New passwords do not match",
        tooShort: "Password must be at least 8 characters long",
        default: "Failed to update password. Check current password.",
      },
    },
    users: {
      title: "Developer",
      success: "User deleted successfully!",
      error: "Failed to fetch users",
      confirmDelete: "Are you sure you want to delete this user?",
      columns: {
        id: "ID",
        name: "Name",
        email: "Email",
        actions: "Actions",
      },
    },
  },
  ru: {
    common: {
      appName: "Stockify",
      loading: "Загрузка...",
      failedToFetch: "Не удалось получить данные",
      cancel: "Отмена",
      create: "Создать",
      saveChanges: "Сохранить изменения",
      changePassword: "Изменить пароль",
      updatePassword: "Обновить пароль",
      signOut: "Выйти",
      uploadNew: "Загрузить новое",
      stockLabel: "Остаток",
      searchPlaceholder: "Начните вводить для поиска групп и товаров",
      searchProductPlaceholder: "Поиск товара...",
      price: "Цена",
      rating: "Рейтинг",
      id: "ID",
      name: "Имя",
      email: "Эл. почта",
      actions: "Действия",
      lastSignIn: "Последний вход",
      joined: "Дата регистрации",
      notAvailable: "Нет данных",
      kSold: "{{count}} тыс. продано",
      daysLabel: "{{count}} дней",
      highestSalesDate: "Максимальные продажи: {{date}}",
      averageLabel: "Среднее",
      increase: "Рост на {{value}}",
      unknownDate: "Неизвестная дата",
      createdOn:
        "Вы успешно зарегистрировались {{date}}. Мы рады видеть вас здесь.",
      categoryAll: "Все",
      categoryOffice: "Офис",
      categoryProfessional: "Профессиональные",
      categorySalaries: "Зарплаты",
    },
    navbar: {
      languageLabel: "Язык",
    },
    sidebar: {
      dashboard: "Панель",
      inventory: "Склад",
      products: "Товары",
      users: "Разработчик",
      settings: "Настройки",
      expenses: "Расходы",
      footer: "© 2025 Stockify",
    },
    dashboard: {
      popularProductsTitle: "Популярные товары",
      salesSummaryTitle: "Сводка продаж",
      valueLabel: "Сумма",
      timeframeDaily: "День",
      timeframeWeekly: "Неделя",
      timeframeMonthly: "Месяц",
      purchaseSummaryTitle: "Сводка закупок",
      purchasedLabel: "Закуплено",
      expenseSummaryTitle: "Сводка расходов",
      expenseCategorySuffix: "Расходы: {{category}}",
      statCards: {
        customerExpensesTitle: "Клиенты и расходы",
        dateRange: "22 - 29 октября 2023",
        customerGrowth: "Рост клиентов",
        expenseGrowth: "Рост расходов",
        duesOrdersTitle: "Долги и ожидающие заказы",
        dues: "Долги",
        pendingOrders: "Ожидающие заказы",
        salesDiscountTitle: "Продажи и скидки",
        sales: "Продажи",
        discount: "Скидки",
      },
    },
    expenses: {
      title: "Расходы по категориям",
      subtitle: "Визуализация динамики расходов.",
      filterTitle: "Фильтр по категории и дате",
      categoryLabel: "Категория",
      amountLabel: "Сумма",
      dateLabel: "Дата",
      downloadReport: "Скачать отчет CSV",
      downloadHelper: "Экспортирует текущий вид с выбранными фильтрами.",
      startDateLabel: "Дата начала",
      endDateLabel: "Дата окончания",
      categories: {
        all: "Все",
        office: "Офис",
        professional: "Профессиональные",
        salaries: "Зарплаты",
      },
      error: "Не удалось получить расходы",
    },
    inventory: {
      title: "Склад",
      error: "Не удалось получить товары",
      columns: {
        productName: "Название товара",
        stockQuantity: "Количество на складе",
      },
    },
    products: {
      title: "Товары",
      createButton: "Создать товар",
      stockPrefix: "Остаток:",
      modalTitle: "Создать новый товар",
      error: "Не удалось получить товары",
      form: {
        productName: "Название товара",
        price: "Цена",
        stockQuantity: "Количество на складе",
        rating: "Рейтинг",
        create: "Создать",
        cancel: "Отмена",
        namePlaceholder: "Название",
        pricePlaceholder: "Цена",
        stockPlaceholder: "Количество на складе",
        ratingPlaceholder: "Рейтинг",
      },
    },
    notifications: {
      title: "Уведомления",
      welcomeTitle: "Добро пожаловать в Stockify!",
      welcomeBody:
        "Вы успешно зарегистрировались {{date}}. Мы рады видеть вас здесь.",
      adminTitle: "Предоставлен доступ администратора",
      adminBody:
        "Вам предоставлены права администратора. Теперь у вас есть доступ к странице пользователей.",
    },
    settings: {
      title: "Настройки пользователя",
      success: "Профиль успешно обновлен!",
      table: {
        setting: "Настройка",
        value: "Значение",
      },
      fields: {
        profilePicture: "Фото профиля",
        username: "Имя пользователя",
        email: "Эл. почта",
        darkMode: "Темная тема",
      },
      buttons: {
        saveChanges: "Сохранить изменения",
        changePassword: "Изменить пароль",
        signOut: "Выйти",
      },
      uploadNew: "Загрузить новое",
      errors: {
        profilePicture: "Не удалось обновить фото профиля",
        updateProfile: "Не удалось обновить профиль",
      },
      passwordModal: {
        title: "Изменить пароль",
        currentPassword: "Текущий пароль",
        newPassword: "Новый пароль",
        confirmPassword: "Подтвердите новый пароль",
        cancel: "Отмена",
        update: "Обновить пароль",
      },
      passwordErrors: {
        mismatch: "Новые пароли не совпадают",
        tooShort: "Пароль должен быть не короче 8 символов",
        default: "Не удалось обновить пароль. Проверьте текущий пароль.",
      },
    },
    users: {
      title: "Разработчик",
      success: "Пользователь успешно удален!",
      error: "Не удалось получить пользователей",
      confirmDelete: "Вы уверены, что хотите удалить этого пользователя?",
      columns: {
        id: "ID",
        name: "Имя",
        email: "Эл. почта",
        actions: "Действия",
      },
    },
  },
};

const TranslationContext = createContext<TranslationContextValue | null>(null);
const LANGUAGE_STORAGE_KEY = "stockify-language";

const resolveTranslation = (
  dictionary: TranslationDictionary,
  key: string
): TranslationValue | undefined => {
  return key.split(".").reduce<TranslationValue | undefined>((acc, part) => {
    if (typeof acc === "object" && acc !== null) {
      return acc[part];
    }
    return undefined;
  }, dictionary);
};

const formatTemplate = (template: string, vars?: TemplateVars) => {
  if (!vars) return template;
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, varName) => {
    const value = vars[varName];
    return value !== undefined ? String(value) : match;
  });
};

export const TranslationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const storedLocale = localStorage.getItem(
      LANGUAGE_STORAGE_KEY
    ) as Locale | null;
    if (storedLocale && (storedLocale === "en" || storedLocale === "ru")) {
      setLocaleState(storedLocale);
      return;
    }
    if (navigator.language.toLowerCase().startsWith("ru")) {
      setLocaleState("ru");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  };

  const t = useMemo(
    () => (key: string, vars?: TemplateVars) => {
      const value =
        resolveTranslation(translations[locale], key) ??
        resolveTranslation(translations.en, key);

      if (typeof value === "string") {
        return formatTemplate(value, vars);
      }
      return key;
    },
    [locale]
  );

  const contextValue = useMemo(
    () => ({
      locale,
      setLocale,
      t,
    }),
    [locale, t]
  );

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};
