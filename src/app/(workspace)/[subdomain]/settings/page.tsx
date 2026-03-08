export default function SettingsPage() {
  return (
    <div className="p-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Organization settings and preferences
        </p>
      </div>

      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Organization Settings
            </h2>
            <p className="text-gray-600 text-sm">
              Organization settings feature coming soon. You'll be able to:
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>✓ Customize organization branding</li>
              <li>✓ Manage notification preferences</li>
              <li>✓ Configure email settings</li>
              <li>✓ Set up two-factor authentication</li>
              <li>✓ API key management</li>
              <li>✓ Export data</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
