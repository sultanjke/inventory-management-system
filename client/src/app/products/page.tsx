"use client";

import { useCreateProductMutation, useGetProductsQuery } from "@/state/api";
import { PlusCircleIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import { useTranslation } from "@/i18n";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
};

const Products = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialSearch = searchParams.get("search") ?? "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t, locale } = useTranslation();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const searchQuery = searchTerm.trim();
  const canCreateProduct = role === "ADMIN" || role === "STAFF";
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
        style: "currency",
        currency: "USD",
      }),
    [locale]
  );

  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  const {
    data: products,
    isLoading,
    isError,
  } = useGetProductsQuery(searchQuery);

  const [createProduct] = useCreateProductMutation();
  const handleCreateProduct = async (productData: ProductFormData) => {
    await createProduct(productData);
  };

  if (isLoading || isRoleLoading) {
    return <div className="py-4">{t("common.loading")}</div>;
  }

  if (isError || !products) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("products.error")}
      </div>
    );
  }

  return (
    <div className="mx-auto pb-5 w-full">
      {/* SEARCH BAR */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder={t("common.searchProductPlaceholder")}
            value={searchTerm}
            onChange={(e) => {
              const next = e.target.value;
              setSearchTerm(next);
              const query = next.trim()
                ? `?search=${encodeURIComponent(next.trim())}`
                : "";
              router.replace(`${pathname}${query}`);
            }}
          />
        </div>
      </div>

      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-6">
        <Header name={t("products.title")} />
        {canCreateProduct && (
          <button
            className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" />{" "}
            {t("products.createButton")}
          </button>
        )}
      </div>
      {/* BODY PRODUCTS LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
        {isLoading ? (
          <div>{t("common.loading")}</div>
        ) : (
          products?.map((product) => (
            <div
              key={product.productId}
              className="border shadow rounded-md p-4 max-w-full w-full mx-auto"
            >
              <div className="flex flex-col items-center">
                <Image
                  src={`https://aws-s3-inventorymanagement-basicsofis.s3.eu-north-1.amazonaws.com/product${
                    Math.floor(Math.random() * 3) + 1
                  }.png`}
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mb-3 rounded-2xl w-36 h-36"
                />
                <h3 className="text-lg text-gray-900 font-semibold">
                  {product.name}
                </h3>
                <p className="text-gray-800">
                  {currencyFormatter.format(product.price)}
                </p>
                <div className="text-sm text-gray-600 mt-1">
                  {t("products.stockPrefix")} {product.stockQuantity}
                </div>
                {product.rating && (
                  <div className="flex items-center mt-2">
                    <Rating rating={product.rating} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL */}
      <CreateProductModal
        isOpen={isModalOpen && canCreateProduct}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
};

export default Products;
