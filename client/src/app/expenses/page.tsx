"use client";

import {
  ExpenseByCategorySummary,
  useGetExpensesByCategoryQuery,
} from "@/state/api";
import { useCallback, useMemo, useState, useEffect } from "react";
import Header from "@/app/(components)/Header";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTranslation } from "@/i18n";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";

type AggregatedDataItem = {
  name: string;
  color?: string;
  amount: number;
};

type AggregatedData = {
  [category: string]: AggregatedDataItem;
};

const Expenses = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { t } = useTranslation();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const router = useRouter();

  const {
    data: expensesData,
    isLoading,
    isError,
  } = useGetExpensesByCategoryQuery(undefined, {
    skip: isRoleLoading || !role || role === "STAFF",
  });

  const expenses = useMemo(() => expensesData ?? [], [expensesData]);

  const translateCategory = useCallback((category: string) => {
    switch (category) {
      case "Office":
        return t("expenses.categories.office");
      case "Professional":
        return t("expenses.categories.professional");
      case "Salaries":
        return t("expenses.categories.salaries");
      case "All":
        return t("expenses.categories.all");
      default:
        return category;
    }
  }, [t]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const aggregatedData: AggregatedDataItem[] = useMemo(() => {
    const filtered: AggregatedData = expenses
      .filter((data: ExpenseByCategorySummary) => {
        const matchesCategory =
          selectedCategory === "All" || data.category === selectedCategory;
        const dataDate = parseDate(data.date);
        const matchesDate =
          !startDate ||
          !endDate ||
          (dataDate >= startDate && dataDate <= endDate);
        return matchesCategory && matchesDate;
      })
      .reduce((acc: AggregatedData, data: ExpenseByCategorySummary) => {
        const displayCategory = translateCategory(data.category);
        const amount = parseInt(data.amount);
        if (!acc[displayCategory]) {
          acc[displayCategory] = { name: displayCategory, amount: 0 };
          acc[displayCategory].color = `#${Math.floor(
            Math.random() * 16777215
          ).toString(16)}`;
        }
        acc[displayCategory].amount += amount;
        return acc;
      }, {});

    return Object.values(filtered);
  }, [expenses, selectedCategory, startDate, endDate, translateCategory]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((data: ExpenseByCategorySummary) => {
      const matchesCategory =
        selectedCategory === "All" || data.category === selectedCategory;
      const dataDate = parseDate(data.date);
      const matchesDate =
        !startDate || !endDate || (dataDate >= startDate && dataDate <= endDate);
      return matchesCategory && matchesDate;
    });
  }, [expenses, selectedCategory, startDate, endDate]);

  const handleDownloadReport = () => {
    const headers = [
      t("expenses.categoryLabel"),
      t("expenses.amountLabel"),
      t("expenses.dateLabel"),
    ];

    const toCsvValue = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const rows = filteredExpenses.map((item) => [
      translateCategory(item.category),
      Number(item.amount) || 0,
      parseDate(item.date),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(toCsvValue).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const classNames = {
    label: "block text-sm font-medium text-gray-700",
    selectInput:
      "mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md",
  };

  useEffect(() => {
    if (!isRoleLoading && role === "STAFF") {
      router.push("/dashboard");
    }
  }, [isRoleLoading, role, router]);

  if (isRoleLoading || isLoading) {
    return <div className="py-4">{t("common.loading")}</div>;
  }

  if (role === "STAFF") {
    return null;
  }

  if (isError || !expensesData) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("expenses.error")}
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="mb-5 ">
        <Header name={t("expenses.title")} />
        <p className="text-sm text-gray-500">{t("expenses.subtitle")}</p>
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full md:w-1/3 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">
            {t("expenses.filterTitle")}
          </h3>
          <div className="space-y-4">
            {/* CATEGORY */}
            <div>
              <label htmlFor="category" className={classNames.label}>
                {t("expenses.categoryLabel")}
              </label>
              <select
                id="category"
                name="category"
                className={classNames.selectInput}
                defaultValue="All"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">{t("expenses.categories.all")}</option>
                <option value="Office">{t("expenses.categories.office")}</option>
                <option value="Professional">
                  {t("expenses.categories.professional")}
                </option>
                <option value="Salaries">
                  {t("expenses.categories.salaries")}
                </option>
              </select>
            </div>
            {/* START DATE */}
            <div>
              <label htmlFor="start-date" className={classNames.label}>
                {t("expenses.startDateLabel")}
              </label>
              <input
                type="date"
                id="start-date"
                name="start-date"
                className={classNames.selectInput}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            {/* END DATE */}
            <div>
              <label htmlFor="end-date" className={classNames.label}>
                {t("expenses.endDateLabel")}
              </label>
              <input
                type="date"
                id="end-date"
                name="end-date"
                className={classNames.selectInput}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleDownloadReport}
                className="w-full inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t("expenses.downloadReport")}
              </button>
              <p className="mt-2 text-xs text-gray-500">
                {t("expenses.downloadHelper")}
              </p>
            </div>
          </div>
        </div>
        {/* PIE CHART */}
        <div className="flex-grow bg-white shadow rounded-lg p-4 md:p-6">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={aggregatedData}
                cx="50%"
                cy="50%"
                label
                outerRadius={150}
                fill="#8884d8"
                dataKey="amount"
                onMouseEnter={(_, index) => setActiveIndex(index)}
              >
                {aggregatedData.map((entry: AggregatedDataItem, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === activeIndex ? "rgb(29, 78, 216)" : entry.color} />
                ))}

              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
