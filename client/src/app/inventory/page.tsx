"use client";

import { useGetProductsQuery } from "@/state/api";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMemo } from "react";
import { useTranslation } from "@/i18n";

const Inventory = () => {
  const { t, locale } = useTranslation();
  const { data: products, isError, isLoading } = useGetProductsQuery();
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
        style: "currency",
        currency: "USD",
      }),
    [locale]
  );

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "productId", headerName: t("common.id"), width: 90 },
      {
        field: "name",
        headerName: t("inventory.columns.productName"),
        width: 200,
      },
      {
        field: "price",
        headerName: t("common.price"),
        width: 110,
        type: "number",
        valueGetter: (_value, row) => currencyFormatter.format(row.price),
      },
      {
        field: "rating",
        headerName: t("common.rating"),
        width: 110,
        type: "number",
        valueGetter: (_value, row) =>
          row.rating ? row.rating : t("common.notAvailable"),
      },
      {
        field: "stockQuantity",
        headerName: t("inventory.columns.stockQuantity"),
        width: 150,
        type: "number",
      },
    ],
    [currencyFormatter, t]
  );

  if (isLoading) {
    return <div className="py-4">{t("common.loading")}</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("inventory.error")}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header name={t("inventory.title")} />
      <DataGrid
        rows={products}
        columns={columns}
        getRowId={(row) => row.productId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 text-gray-700"
      />
    </div>
  );
};

export default Inventory;
