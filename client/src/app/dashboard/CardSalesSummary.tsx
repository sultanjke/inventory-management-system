import { useGetDashboardMetricsQuery } from "@/state/api";
import { TrendingUp } from "lucide-react";
import React, { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslation } from "@/i18n";
import { useAuth } from "@clerk/nextjs";

const CardSalesSummary = () => {
  const { isLoaded } = useAuth();
  const { data, isLoading, isError } = useGetDashboardMetricsQuery(undefined, {
    skip: !isLoaded,
  });
  const salesData = data?.salesSummary || [];
  const { t, locale } = useTranslation();
  const dateLocale = locale === "ru" ? "ru-RU" : "en-US";
  const millionSuffix = locale === "ru" ? "млн" : "m";

  const [timeframe, setTimeframe] = useState("weekly");

  const totalValueSum =
    salesData.reduce((acc, curr) => acc + curr.totalValue, 0) || 0;

  const averageChangePercentage =
    salesData.reduce((acc, curr, _, array) => {
      return acc + curr.changePercentage! / array.length;
    }, 0) || 0;

  const highestValueData = salesData.reduce((acc, curr) => {
    return acc.totalValue > curr.totalValue ? acc : curr;
  }, salesData[0] || {});

  const highestValueDate = highestValueData.date
    ? new Date(highestValueData.date).toLocaleDateString(dateLocale, {
        month: "numeric",
        day: "numeric",
        year: "2-digit",
      })
    : t("common.unknownDate");

  if (isError) {
    return <div className="m-5">{t("common.failedToFetch")}</div>;
  }

  return (
    <div className="row-span-3 xl:row-span-6 bg-white shadow-md rounded-2xl flex flex-col justify-between">
      {isLoading ? (
        <div className="m-5">{t("common.loading")}</div>
      ) : (
        <>
          {/* HEADER */}
          <div>
            <h2 className="text-lg font-semibold mb-2 px-7 pt-5">
              {t("dashboard.salesSummaryTitle")}
            </h2>
            <hr />
          </div>
          {/* BODY */}
          <div>
            {/* BODY HEADER */}
            <div className="flex justify-between items-center mb-6 px-7 mt-5">
              <div className="text-lg font-medium">
                <p className="text-xs text-gray-400">
                  {t("dashboard.valueLabel")}
                </p>
                <span className="text-2xl font-extrabold">
                  $
                  {(totalValueSum / 1000000).toLocaleString(locale, {
                    maximumFractionDigits: 2,
                  })}
                  {millionSuffix}
                </span>
                <span className="text-green-500 text-sm ml-2">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {averageChangePercentage.toFixed(2)}%
                </span>
              </div>
              {/* <select
                className="shadow-sm border border-gray-300 bg-white p-2 rounded"
                value={timeframe}
                onChange={(e) => {
                  setTimeframe(e.target.value);
                }}
              >
                <option value="daily">{t("dashboard.timeframeDaily")}</option>
                <option value="weekly">{t("dashboard.timeframeWeekly")}</option>
                <option value="monthly">
                  {t("dashboard.timeframeMonthly")}
                </option>
              </select> */}
            </div>
            {/* CHART */}
            <ResponsiveContainer width="100%" height={300} className="px-7">
              <BarChart
                data={salesData}
                margin={{ top: 0, right: 0, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  tickFormatter={(value) => {
                    return `$${(value / 1000000).toLocaleString(locale, {
                      maximumFractionDigits: 0,
                    })}${millionSuffix}`;
                  }}
                  tick={{ fontSize: 12, dx: -1 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: number) => [
                    `$${value.toLocaleString(locale)}`,
                  ]}
                  labelFormatter={(label) => {
                    const date = new Date(label);
                    return date.toLocaleDateString(dateLocale, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  }}
                />
                <Bar
                  dataKey="totalValue"
                  fill="#3182ce"
                  barSize={10}
                  radius={[10, 10, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* FOOTER */}
          <div>
            <hr />
            <div className="flex justify-between items-center text-sm px-7 mb-5 mt-5">
              <p>{t("common.daysLabel", { count: salesData.length || 0 })}</p>
              <p className="text-sm">
                {t("common.highestSalesDate", { date: highestValueDate })}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CardSalesSummary;
