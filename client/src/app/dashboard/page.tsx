"use client";

import { CheckCircle, Package, Tag, TrendingDown, TrendingUp } from "lucide-react";
import CardExpenseSummary from "./CardExpenseSummary";
import CardPopularProducts from "./CardPopularProducts";
import CardPurchaseSummary from "./CardPurchaseSummary";
import CardSalesSummary from "./CardSalesSummary";
import StatCard from "./StatCard";
import { useTranslation } from "@/i18n";

const Dashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:overflow-auto gap-10 pb-4 custom-grid-rows">
      <CardPopularProducts />
      <CardSalesSummary />
      <CardPurchaseSummary />
      <CardExpenseSummary />
      <StatCard
        title={t("dashboard.statCards.customerExpensesTitle")}
        primaryIcon={<Package className="text-blue-600 w-6 h-6 " />}
        dateRange={t("dashboard.statCards.dateRange")}
        details={[
          {
            title: t("dashboard.statCards.customerGrowth"),
            amount: "175.00",
            changePercentage: 131,
            IconComponent: TrendingUp,
          },
          {
            title: t("dashboard.statCards.expenseGrowth"),
            amount: "10.00",
            changePercentage: -56,
            IconComponent: TrendingDown,
          },
        ]}
      />
      <StatCard
        title={t("dashboard.statCards.duesOrdersTitle")}
        primaryIcon={<CheckCircle className="text-blue-600 w-6 h-6 " />}
        dateRange={t("dashboard.statCards.dateRange")}
        details={[
          {
            title: t("dashboard.statCards.dues"),
            amount: "250.00",
            changePercentage: 131,
            IconComponent: TrendingUp,
          },
          {
            title: t("dashboard.statCards.pendingOrders"),
            amount: "147",
            changePercentage: -56,
            IconComponent: TrendingDown,
          },
        ]}
      />
      <StatCard
        title={t("dashboard.statCards.salesDiscountTitle")}
        primaryIcon={<Tag className="text-blue-600 w-6 h-6 " />}
        dateRange={t("dashboard.statCards.dateRange")}
        details={[
          {
            title: t("dashboard.statCards.sales"),
            amount: "1000.00",
            changePercentage: 20,
            IconComponent: TrendingUp,
          },
          {
            title: t("dashboard.statCards.discount"),
            amount: "200.00",
            changePercentage: -10,
            IconComponent: TrendingDown,
          },
        ]}
      />
    </div>
  );
};

export default Dashboard;
