"use client";

import { useEffect, useState } from "react";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getClerkUsers, deleteClerkUser } from "./actions";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Trash2 } from "lucide-react";

const Users = () => {
  const { user, isLoaded } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
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

  const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "email", headerName: "Email", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
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
  ];

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
    return <div className="py-4">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-4">Failed to fetch users</div>
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
                <span className="font-medium">User deleted successfully!</span>
            </div>
        )}
      <Header name="Users" />
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
