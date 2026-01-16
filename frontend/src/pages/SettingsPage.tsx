import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, Button } from '../components/common';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader title="Profile" subtitle="Your account information" />
        <div className="flex items-center gap-4 mb-6">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">
                {user.name[0]}
              </span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{user.name}</h3>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Member since {new Date(user.createdAt).toLocaleDateString()}
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Credits"
          subtitle="Your current credit balance"
        />
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 mb-4">
          <div>
            <p className="text-3xl font-bold text-primary-600">{user.credits}</p>
            <p className="text-sm text-gray-500">Available credits</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>1 credit = 1 persona feedback</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg
              className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">MVP Mode</p>
              <p className="text-sm text-yellow-700 mt-1">
                Credits are currently managed manually. Contact the administrator
                to purchase more credits.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Account Actions" />
        <Button variant="danger" onClick={logout}>
          Sign Out
        </Button>
      </Card>
    </div>
  );
};
