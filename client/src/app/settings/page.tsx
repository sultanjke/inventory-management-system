"use client";

import React, { useState, useEffect } from 'react'
import Header from '@/app/(components)/Header';
import { useUser, SignOutButton } from "@clerk/nextjs";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";

type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle" | "image";
};

const mockSettings: UserSetting[] = [
    { label: "Profile Picture", value: "", type: "image" },
    { label: "Username", value: "", type: "text" },
    { label: "Email", value: "", type: "text" },
    { label: "Dark Mode", value: false, type: "toggle" },
]

const Settings = () => {
    const { user, isLoaded } = useUser();
    const dispatch = useAppDispatch();
    const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
    const [userSettings, setUserSettings] = useState<UserSetting[]>(mockSettings);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (user) {
            setUserSettings(prev => {
                const newSettings = [...prev];

                const profilePicIndex = newSettings.findIndex(s => s.label === "Profile Picture");
                if (profilePicIndex !== -1) newSettings[profilePicIndex] = { ...newSettings[profilePicIndex], value: user.imageUrl || "" };

                const usernameIndex = newSettings.findIndex(s => s.label === "Username");
                if (usernameIndex !== -1) newSettings[usernameIndex] = { ...newSettings[usernameIndex], value: user.fullName || user.username || "" };

                const emailIndex = newSettings.findIndex(s => s.label === "Email");
                if (emailIndex !== -1) newSettings[emailIndex] = { ...newSettings[emailIndex], value: user.primaryEmailAddress?.emailAddress || "" };

                return newSettings;
            });
        }
    }, [user]);

    useEffect(() => {
        setUserSettings(prev => {
            const newSettings = [...prev];
            const darkModeIndex = newSettings.findIndex(s => s.label === "Dark Mode");
            if (darkModeIndex !== -1) {
                newSettings[darkModeIndex] = { ...newSettings[darkModeIndex], value: isDarkMode };
            }
            return newSettings;
        });
    }, [isDarkMode]);

    const handleToggleChange = (index: number) => {
        const settingsCopy = [...userSettings];
        const setting = settingsCopy[index];

        if (setting.label === "Dark Mode") {
            dispatch(setIsDarkMode(!setting.value));
            return;
        }

        settingsCopy[index].value = !settingsCopy[index].value as boolean;
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
            alert("Failed to update profile picture");
        }
    }

    const handleSave = async () => {
        if (!user) return;
        const usernameSetting = userSettings.find(s => s.label === "Username");

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
                alert("Failed to update profile");
            }
        }
    }

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        if (passwordData.newPassword.length < 8) {
             setPasswordError("Password must be at least 8 characters long");
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
            setPasswordError(err.errors?.[0]?.message || "Failed to update password. Check current password.");
        }
    }

    if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="w-full">
        {showSuccess && (
            <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-green-500 text-green-700 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-500 ease-in-out">
                <div className="bg-green-100 p-1 rounded-full">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <span className="font-medium">Profile updated successfully!</span>
            </div>
        )}
      <Header name="User Settings" />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Setting
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50" key={setting.label}>
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
                            alt="Profile"
                            className="w-12 h-12 rounded-xl object-cover border border-gray-300"
                        />
                        <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded transition-colors text-sm">
                            Upload New
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
                    className={`px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500 ${setting.label === "Email" ? "bg-gray-100 cursor-not-allowed" : "bg-white dark:bg-gray-100"}`}
                    value={setting.value as string}
                    readOnly={setting.label === "Email"}
                    onChange={(e) => {
                      if (setting.label === "Email") return;
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
                Save Changes
            </button>
            <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
                Change Password
            </button>
        </div>

        <SignOutButton>
            <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
                Sign Out
            </button>
        </SignOutButton>
      </div>

        {isPasswordModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                    <h2 className="text-xl font-bold mb-4">Change Password</h2>
                    {passwordError && <p className="text-red-500 text-sm mb-2">{passwordError}</p>}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
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
                            Cancel
                        </button>
                        <button
                            onClick={handlePasswordChange}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Update Password
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  )
}

export default Settings