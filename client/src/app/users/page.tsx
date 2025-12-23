"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  getClerkUsers,
  deleteClerkUser,
  createClerkUser,
  inviteClerkUser,
  getClerkInvitations,
  revokeClerkInvitation,
} from "./actions";
import { useAuth, useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ChevronDown, Trash2, X } from "lucide-react";
import { useTranslation } from "@/i18n";
import { useUserRole } from "@/hooks/useUserRole";

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

const Users = () => {
  const { isLoaded } = useUser();
  const { getToken } = useAuth();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [isRolesLoading, setIsRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"users" | "invitations">("users");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isInvitesLoading, setIsInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [inviteStatusFilter, setInviteStatusFilter] = useState<string>("all");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [inviteSearch, setInviteSearch] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "invite">("create");
  const [createForm, setCreateForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    skipPasswordChecks: false,
  });
  const [inviteForm, setInviteForm] = useState({
    email: "",
    expiresInDays: 30,
  });
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetModal = () => {
    setActiveTab("create");
    setCreateForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      skipPasswordChecks: false,
    });
    setInviteForm({ email: "", expiresInDays: 30 });
    setModalError(null);
    setIsModalOpen(false);
  };

  const handleDelete = useCallback(
    async (userId: string) => {
      if (confirm(t("users.confirmDelete"))) {
        try {
          await deleteClerkUser(userId);
          setUsers((prev) => prev.filter((u) => u.userId !== userId));
          setRoleMap((prev) => {
            const { [userId]: _removed, ...rest } = prev;
            return rest;
          });
          triggerToast(t("users.success"), "success");
        } catch (error) {
          console.error("Failed to delete user:", error);
          triggerToast(t("users.error"), "error");
        }
      }
    },
    [t]
  );

  const handleCreateUser = async (event: FormEvent) => {
    event.preventDefault();
    if (!createForm.email || !createForm.password) {
      setModalError("Email and password are required.");
      return;
    }

    setModalError(null);
    setIsSubmittingCreate(true);
    try {
      const newUser = await createClerkUser({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        skipPasswordChecks: createForm.skipPasswordChecks,
      });
      setUsers((prev) => [...prev, newUser]);
      setRoleMap((prev) => ({ ...prev, [newUser.userId]: "STAFF" }));
      triggerToast("User created successfully.", "success");
      resetModal();
    } catch (error) {
      console.error("Failed to create user:", error);
      setModalError(
        (error as any)?.errors?.[0]?.message ||
          (error as any)?.message ||
          "Failed to create user. Please try again."
      );
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleInviteUser = async (event: FormEvent) => {
    event.preventDefault();
    if (!inviteForm.email) {
      setModalError("Email is required to send an invitation.");
      return;
    }

    setModalError(null);
    setIsSubmittingInvite(true);
    try {
      const invitation = await inviteClerkUser({
        email: inviteForm.email,
        expiresInDays: inviteForm.expiresInDays || undefined,
      });
      triggerToast("Invitation sent successfully.", "success");
      setInvitations((prev) => [invitation, ...prev]);
      resetModal();
    } catch (error) {
      console.error("Failed to invite user:", error);
      setModalError(
        (error as any)?.errors?.[0]?.message ||
          (error as any)?.message ||
          "Failed to invite user. Please try again."
      );
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRoleChange = async (userId: string, nextRole: string) => {
    try {
      setRoleUpdatingId(userId);
      const token = await getToken();
      const response = await fetch(`${getApiBaseUrl()}/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      const updated = await response.json();
      setRoleMap((prev) => ({ ...prev, [userId]: updated.role }));
      triggerToast("Role updated.", "success");
    } catch (error: any) {
      console.error("Failed to update role:", error);
      triggerToast(error?.message || "Failed to update role.", "error");
    } finally {
      setRoleUpdatingId(null);
    }
  };

  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const status = (inv.status || "").toLowerCase();
      const matchesStatus = inviteStatusFilter === "all" ? true : status === inviteStatusFilter;
      const q = inviteSearch.trim().toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        (inv.emailAddress || "").toLowerCase().includes(q) ||
        (inv.name || "").toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [invitations, inviteStatusFilter, inviteSearch]);

  const usersWithRoles = useMemo(() => {
    return users.map((userItem) => ({
      ...userItem,
      role: roleMap[userItem.userId] || "STAFF",
    }));
  }, [users, roleMap]);

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Status: All" },
      { value: "pending", label: "Status: Pending" },
      { value: "accepted", label: "Status: Accepted" },
      { value: "revoked", label: "Status: Revoked" },
      { value: "expired", label: "Status: Expired" },
    ],
    []
  );
  const currentStatusOption =
    statusOptions.find((opt) => opt.value === inviteStatusFilter) ??
    statusOptions[0];

  const handleRevokeInvitation = async (invitationId: string) => {
    if (!invitationId) return;
    setRevokingId(invitationId);
    try {
      const revoked = await revokeClerkInvitation(invitationId);
      setInvitations((prev) =>
        prev.map((inv) => (inv.id === invitationId ? revoked : inv))
      );
      triggerToast("Invitation revoked.", "success");
    } catch (error: any) {
      console.error("Failed to revoke invitation:", error);
      triggerToast(error?.message || "Failed to revoke invitation.", "error");
    } finally {
      setRevokingId(null);
    }
  };

  const columns: GridColDef[] = useMemo(
    () => [
      { field: "userId", headerName: t("users.columns.id"), width: 90 },
      { field: "name", headerName: t("users.columns.name"), width: 200 },
      { field: "email", headerName: t("users.columns.email"), width: 200 },
      {
        field: "role",
        headerName: "Role",
        width: 160,
        renderCell: (params) => {
          const currentRole = roleMap[params.row.userId] || "STAFF";
          const isUpdating = roleUpdatingId === params.row.userId;
          return (
            <select
              value={currentRole}
              disabled={isUpdating}
              onChange={(event) => handleRoleChange(params.row.userId, event.target.value)}
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            >
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="STAFF">Staff</option>
            </select>
          );
        },
      },
      {
        field: "lastSignInAt",
        headerName: t("Last Signed In"),
        width: 200,
        valueGetter: (_value, row) => {
          if (!row.lastSignInAt) return "-";
          const date = new Date(row.lastSignInAt);
          return date.toLocaleString();
        },
      },
      {
        field: "createdAt",
        headerName: t("Joined"),
        width: 160,
        valueGetter: (_value, row) => {
          if (!row.createdAt) return "-";
          const date = new Date(row.createdAt);
          return date.toLocaleDateString();
        },
      },
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
    [t, handleDelete, handleRoleChange, roleMap, roleUpdatingId]
  );

  const inviteColumns: GridColDef[] = useMemo(
    () => [
      { field: "emailAddress", headerName: "Email", flex: 1 },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        renderCell: (params) => {
          const status = (params.row.status || "").toLowerCase();
          const styles: Record<
            string,
            { bg: string; text: string; border: string; label: string }
          > = {
            accepted: {
              bg: "bg-green-100",
              text: "text-green-800",
              border: "border-green-200",
              label: "Accepted",
            },
            pending: {
              bg: "bg-blue-100",
              text: "text-blue-800",
              border: "border-blue-200",
              label: "Pending",
            },
            revoked: {
              bg: "bg-red-100",
              text: "text-red-800",
              border: "border-red-200",
              label: "Revoked",
            },
            expired: {
              bg: "bg-amber-100",
              text: "text-amber-800",
              border: "border-amber-200",
              label: "Expired",
            },
          };
          const style = styles[status] || {
            bg: "bg-gray-100",
            text: "text-gray-700",
            border: "border-gray-200",
            label: params.row.status || "Pending",
          };

          return (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border} transition hover:brightness-95 hover:shadow-sm`}
            >
              {style.label}
            </span>
          );
        },
      },
      {
        field: "createdAt",
        headerName: "Invited Date",
        width: 180,
        valueGetter: (_value, row) => {
          if (!row.createdAt) return "-";
          const date = new Date(row.createdAt);
          return date.toLocaleString();
        },
      },
      {
        field: "expiresAt",
        headerName: "Expiry Date",
        width: 180,
        valueGetter: (_value, row) => {
          if (!row.expiresAt) return "-";
          const date = new Date(row.expiresAt);
          return date.toLocaleString();
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 120,
        renderCell: (params) => {
          const status = (params.row.status || "").toLowerCase();
          const isDisabled = status === "revoked" || status === "expired";
          return (
            <button
              onClick={() => handleRevokeInvitation(params.row.id)}
              disabled={isDisabled || revokingId === params.row.id}
              className={`px-3 py-1 rounded-md text-xs font-semibold border transition ${
                isDisabled
                  ? "border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50"
                  : "border-red-200 text-red-700 hover:bg-red-50"
              } ${revokingId === params.row.id ? "opacity-60" : ""}`}
            >
              {revokingId === params.row.id ? "Revoking..." : "Revoke"}
            </button>
          );
        },
      },
    ],
    [handleRevokeInvitation, revokingId]
  );

  useEffect(() => {
    if (isLoaded && !isRoleLoading && role && role !== "ADMIN") {
      redirect("/dashboard");
    }
  }, [isLoaded, isRoleLoading, role]);

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

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsRolesLoading(true);
        const token = await getToken();
        const response = await fetch(`${getApiBaseUrl()}/users`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) {
          throw new Error("Failed to load user roles");
        }

        const data = await response.json();
        const nextRoleMap = data.reduce((acc: Record<string, string>, item: any) => {
          acc[item.userId] = item.role;
          return acc;
        }, {});

        setRoleMap(nextRoleMap);
        setRolesError(null);
      } catch (error: any) {
        console.error("Failed to fetch user roles:", error);
        setRolesError(error?.message || "Failed to load user roles.");
      } finally {
        setIsRolesLoading(false);
      }
    };

    if (role === "ADMIN" && isLoaded && !isRolesLoading && Object.keys(roleMap).length === 0) {
      fetchRoles();
    }
  }, [getToken, isLoaded, isRolesLoading, role, roleMap]);

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setIsInvitesLoading(true);
        const data = await getClerkInvitations();
        setInvitations(data);
        setInvitesError(null);
      } catch (error: any) {
        console.error("Failed to fetch invitations:", error);
        setInvitesError(error?.message || "Failed to load invitations.");
      } finally {
        setIsInvitesLoading(false);
      }
    };

    if (viewTab === "invitations" && invitations.length === 0 && !isInvitesLoading) {
      fetchInvitations();
    }
  }, [viewTab, invitations.length, isInvitesLoading]);

  if (!isLoaded || isLoading || isRoleLoading) {
    return <div className="py-4">{t("common.loading")}</div>;
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 py-4">
        {t("users.error")}
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center text-red-500 py-4">
        Unable to load user role.
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg border flex items-center gap-3 transition-all duration-500 ease-in-out ${
            toast.type === "success"
              ? "bg-green-50 border-green-500 text-green-700"
              : "bg-red-50 border-red-500 text-red-700"
          }`}
        >
          <div
            className={`p-1 rounded-full ${
              toast.type === "success" ? "bg-green-100" : "bg-red-100"
            }`}
          >
            <svg
              className={`w-5 h-5 ${
                toast.type === "success" ? "text-green-600" : "text-red-600"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {toast.type === "success" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              )}
            </svg>
          </div>
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <Header name={t("users.title")} />
      </div>

      <div className="flex items-center gap-6 mt-4 border-b border-gray-200 pb-2">
        <button
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            viewTab === "users"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setViewTab("users")}
        >
          Users
        </button>
        <button
          className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
            viewTab === "invitations"
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setViewTab("invitations")}
        >
          Invitations
        </button>
      </div>

      {viewTab === "users" ? (
        <div className="mt-3">
          {rolesError && (
            <div className="mb-3 text-sm text-red-600">{rolesError}</div>
          )}
          <DataGrid
            rows={usersWithRoles}
            columns={columns}
            getRowId={(row) => row.userId}
            checkboxSelection
            className="bg-white shadow rounded-lg border border-gray-200 text-gray-700"
          />
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
              placeholder="Search email or name..."
              className="flex-1 min-w-[220px] rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <div
              className="relative"
              tabIndex={0}
              onBlur={() => setTimeout(() => setIsStatusOpen(false), 100)}
            >
              <button
                type="button"
                onClick={() => setIsStatusOpen((prev) => !prev)}
                className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 text-sm bg-white shadow-sm hover:border-indigo-500 focus:outline-none"
                aria-expanded={isStatusOpen}
                aria-label="Status filter"
              >
                <span className="text-gray-700">{currentStatusOption.label}</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    isStatusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isStatusOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-md border border-gray-200 bg-white shadow-lg z-50">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 ${
                        opt.value === inviteStatusFilter
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-700"
                      }`}
                      onClick={() => {
                        setInviteStatusFilter(opt.value);
                        setIsStatusOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1" />
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition-all"
            >
              + Invite user
            </button>
          </div>

          <div className="bg-white shadow rounded-lg border border-gray-200">
            {invitesError ? (
              <div className="p-6 text-red-600 text-sm">{invitesError}</div>
            ) : (
              <>
                <DataGrid
                  rows={filteredInvitations}
                  columns={inviteColumns}
                  getRowId={(row) => row.id}
                  autoHeight
                  className="text-gray-700"
                  loading={isInvitesLoading}
                  disableRowSelectionOnClick
                />
                {!isInvitesLoading && filteredInvitations.length === 0 && (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    No invitations found.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">
                  {activeTab === "create" ? "Create new user" : "Invite new user"}
                </h2>
              </div>
              <button
                onClick={resetModal}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pt-4 border-b border-gray-200">
              <div className="flex gap-8">
                <button
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "create"
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("create");
                    setModalError(null);
                  }}
                >
                  Create User
                </button>
                <button
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "invite"
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => {
                    setActiveTab("invite");
                    setModalError(null);
                  }}
                >
                  Invite User
                </button>
              </div>
            </div>

            {modalError && (
              <div className="px-6 pt-4 text-sm text-red-600">{modalError}</div>
            )}

            {activeTab === "create" ? (
              <form onSubmit={handleCreateUser} className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">First name</label>
                    <input
                      type="text"
                      value={createForm.firstName}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="First name"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">Last name</label>
                    <input
                      type="text"
                      value={createForm.lastName}
                      onChange={(e) =>
                        setCreateForm((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Password</label>
                  <input
                    type="password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="********"
                    required
                  />
                </div>

                <label className="inline-flex items-start gap-3 text-gray-800 text-sm">
                  <input
                    type="checkbox"
                    checked={createForm.skipPasswordChecks}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        skipPasswordChecks: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>
                    Ignore password policies
                    <p className="text-xs text-gray-500">
                      If checked, password policies will not be enforced on this password.
                    </p>
                  </span>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingCreate}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isSubmittingCreate ? "Creating..." : "Create user"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleInviteUser} className="px-6 py-5 space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600">Email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="name@example.com"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">Set invitation expiry</label>
                  <p className="text-xs text-gray-500">
                    Invite links will expire after the specified number of days.
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      value={inviteForm.expiresInDays}
                      onChange={(e) =>
                        setInviteForm((prev) => ({
                          ...prev,
                          expiresInDays: Number(e.target.value) || 0,
                        }))
                      }
                      className="w-32 rounded-lg bg-white border border-gray-200 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Days</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvite}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {isSubmittingInvite ? "Inviting..." : "Invite user"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
