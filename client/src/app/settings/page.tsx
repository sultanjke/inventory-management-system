"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/app/(components)/Header";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";
import { useTranslation } from "@/i18n";

type UserSettingKey = "profilePicture" | "username" | "email" | "darkMode";
type UserSetting = {
  key: UserSettingKey;
  label: string;
  value: string | boolean;
  type: "text" | "toggle" | "image";
};

const Settings = () => {
    const { user, isLoaded } = useUser();
    const dispatch = useAppDispatch();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const { t } = useTranslation();
    const userSettingOptions = useMemo<UserSetting[]>(
      () => [
        {
          key: "profilePicture",
          label: t("settings.fields.profilePicture"),
          value: user?.imageUrl || "",
          type: "image",
        },
        {
          key: "username",
          label: t("settings.fields.username"),
          value: user?.fullName || user?.username || "",
          type: "text",
        },
        {
          key: "email",
          label: t("settings.fields.email"),
          value: user?.primaryEmailAddress?.emailAddress || "",
          type: "text",
        },
        {
          key: "darkMode",
          label: t("settings.fields.darkMode"),
          value: isDarkMode,
          type: "toggle",
        },
      ],
      [isDarkMode, t, user]
    );
    const [userSettings, setUserSettings] = useState<UserSetting[]>(userSettingOptions);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
      setUserSettings(userSettingOptions);
    }, [userSettingOptions]);

    const handleToggleChange = (index: number) => {
        const setting = userSettings[index];
        if (!setting) return;

        if (setting.key === "darkMode") {
            dispatch(setIsDarkMode(!Boolean(setting.value)));
            return;
        }

        const settingsCopy = [...userSettings];
        const updatedValue = !(setting.value as boolean);
        settingsCopy[index] = { ...setting, value: updatedValue };
        setUserSettings(settingsCopy);
    }

    const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        try {
            await user.setProfileImage({ file });
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error("Error updating profile picture:", err);
            alert(t("settings.errors.profilePicture"));
        }
    }

    const handleSave = async () => {
        if (!user) return;
        const usernameSetting = userSettings.find(s => s.key === "username");

        if (usernameSetting && typeof usernameSetting.value === 'string') {
            const [firstName, ...lastNameParts] = usernameSetting.value.split(' ');
            const lastName = lastNameParts.join(' ');

            try {
                await user.update({
                    firstName: firstName,
                    lastName: lastName
                });
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } catch (err) {
                console.error("Error updating profile:", err);
                alert(t("settings.errors.updateProfile"));
            }
        }
    }

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError(t("settings.passwordErrors.mismatch"));
            return;
        }

        if (passwordData.newPassword.length < 8) {
             setPasswordError(t("settings.passwordErrors.tooShort"));
             return;
        }

        if (!user) return;

        try {
            await user.updatePassword({
                newPassword: passwordData.newPassword,
                currentPassword: passwordData.currentPassword
            });
            setIsPasswordModalOpen(false);
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setPasswordError("");
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err: any) {
            console.error("Error updating password:", err);
            setPasswordError(err.errors?.[0]?.message || t("settings.passwordErrors.default"));
        }
    }

    if (!isLoaded) return <div>{t("common.loading")}</div>;

  return (
    <div className="w-full">
        {showSuccess && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-green-500 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500 ease-in-out">
                <div className="bg-green-100 p-1 rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <span className="font-medium">{t("settings.success")}</span>
            </div>
        )}
      <Header name={t("settings.title")} />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                {t("settings.table.setting")}
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                {t("settings.table.value")}
              </th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50" key={setting.key}>
                <td className="py-2 px-4">{setting.label}</td>
                <td className="py-2 px-4">
                  {setting.type === "toggle" ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={setting.value as boolean} onChange={() => handleToggleChange(index)} />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600">

                        </div>
                    </label>
                    ) : setting.type === "image" ? (
                    <div className="flex items-center gap-4">
                        <img
                            src={setting.value as string}
                            alt={t("settings.fields.profilePicture")}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-300"
                        />
                        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded transition-colors text-sm">
                            {t("settings.uploadNew")}
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                            />
                        </label>
                    </div>
                  ) : (
                    <input type="text"
                    className={`px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 ${setting.key === "email" ? "bg-gray-100 cursor-not-allowed" : "bg-white dark:bg-gray-100"}`}
                    value={setting.value as string}
                    readOnly={setting.key === "email"}
                    onChange={(e) => {
                      if (setting.key === "email") return;
                      const settingsCopy = [...userSettings];
                      settingsCopy[index].value = e.target.value;
                      setUserSettings(settingsCopy);
                    }}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-between items-center">
        <div className="flex gap-4">
            <button
                onClick={handleSave}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                {t("settings.buttons.saveChanges")}
            </button>
            <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                {t("settings.buttons.changePassword")}
            </button>
        </div>

        <SignOutButton>
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
                {t("settings.buttons.signOut")}
            </button>
        </SignOutButton>
      </div>

        {isPasswordModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h2 className="text-xl font-bold mb-4">{t("settings.passwordModal.title")}</h2>
                    {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.passwordModal.currentPassword")}</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.passwordModal.newPassword")}</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("settings.passwordModal.confirmPassword")}</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => {
                                setIsPasswordModalOpen(false);
                                setPasswordError("");
                                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                            }}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            {t("settings.passwordModal.cancel")}
                        </button>
                        <button
                            onClick={handlePasswordChange}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            {t("settings.passwordModal.update")}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Settings
