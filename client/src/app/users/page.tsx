"use client";

import { useEffect, useState } from "react";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getClerkUsers, deleteClerkUser } from "./actions";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useMemo } from "react";

const Users = () => {
  const { user, isLoaded } = useUser();
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async (userId: string) => {
    if (confirm(t("users.confirmDelete"))) {
      try {
        await deleteClerkUser(userId);
        setUsers(users.filter((u) => u.userId !== userId));
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "userId", headerName: t("users.columns.id"), width: 90 },
      { field: "name", headerName: t("users.columns.name"), width: 200 },
      { field: "email", headerName: t("users.columns.email"), width: 200 },
      {
        field: "actions",
        headerName: t("users.columns.actions"),
        width: 100,
        renderCell: (params) => (
          <button
            onClick={() => handleDelete(params.row.userId)}
            className="flex items-center justify-center w-full h-full text-red-500 hover:text-red-700"
          >
            <Trash2 size={20} />
          </button>
        ),
      },
    ],
    [t]
  );

  useEffect(() => {
    if (isLoaded) {
        const isAdmin = user?.primaryEmailAddress?.emailAddress === "s.mecheyev@outlook.com" || user?.fullName === "Sultan Mecheyev";
        if (!isAdmin) {
            redirect("/dashboard");
        }
    }
  }, [isLoaded, user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getClerkUsers();
        setUsers(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        setIsError(true);
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (!isLoaded || isLoading) {
    return <div className="py-4">{t("common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("users.error")}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
        {showSuccess && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-green-500 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500 ease-in-out">
                <div className="bg-green-100 p-1 rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <span className="font-medium">{t("users.success")}</span>
            </div>
        )}
      <Header name={t("users.title")} />
      <DataGrid
        rows={users}
        columns={columns}
        getRowId={(row) => row.userId}
        checkboxSelection
        className="bg-white shadow rounded-lg border border-gray-200 mt-5 text-gray-700"
      />
    </div>
  );
};

export default Users;
