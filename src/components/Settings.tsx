import React, { useState } from 'react';
import { Save, Database, Download, Upload, Trash2 } from 'lucide-react';

export function Settings() {
  const [businessInfo, setBusinessInfo] = useState({
    name: 'TechFlow IMS',
    address: '123 Business Street, Tech City',
    phone: '+1-555-0123',
    email: 'info@techflow.com',
    taxRate: 10
  });

  const handleSave = () => {
    localStorage.setItem('businessInfo', JSON.stringify(businessInfo));
    alert('Settings saved successfully!');
  };

  const exportData = () => {
    const data = {
      products: JSON.parse(localStorage.getItem('products') || '[]'),
      customers: JSON.parse(localStorage.getItem('customers') || '[]'),
      suppliers: JSON.parse(localStorage.getItem('suppliers') || '[]'),
      sales: JSON.parse(localStorage.getItem('sales') || '[]'),
      purchases: JSON.parse(localStorage.getItem('purchases') || '[]'),
      courses: JSON.parse(localStorage.getItem('courses') || '[]'),
      invoices: JSON.parse(localStorage.getItem('invoices') || '[]')
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate data structure
        const requiredKeys = ['products', 'customers', 'suppliers', 'sales', 'purchases', 'courses', 'invoices'];
        const isValid = requiredKeys.every(key => Array.isArray(data[key]));
        
        if (!isValid) {
          alert('Invalid backup file format');
          return;
        }

        // Import data
        Object.keys(data).forEach(key => {
          localStorage.setItem(key, JSON.stringify(data[key]));
        });

        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      const keys = ['products', 'customers', 'suppliers', 'sales', 'purchases', 'courses', 'invoices'];
      keys.forEach(key => localStorage.removeItem(key));
      alert('All data cleared successfully! Please refresh the page.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Configure your business settings and manage data</p>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                value={businessInfo.name}
                onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={businessInfo.email}
                onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={businessInfo.phone}
                onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={businessInfo.taxRate}
                onChange={(e) => setBusinessInfo({ ...businessInfo, taxRate: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <textarea
                value={businessInfo.address}
                onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Save size={20} />
            <span>Save Settings</span>
          </button>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Export Data</h4>
                <p className="text-sm text-gray-600">Download a backup of all your data</p>
              </div>
              <button
                onClick={exportData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Import Data</h4>
                <p className="text-sm text-gray-600">Restore data from a backup file</p>
              </div>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload size={16} />
                <span>Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h4 className="font-medium text-red-900">Clear All Data</h4>
                <p className="text-sm text-red-600">Permanently delete all data (cannot be undone)</p>
              </div>
              <button
                onClick={clearAllData}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-red-700 transition-colors"
              >
                <Trash2 size={16} />
                <span>Clear Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Storage:</span>
              <span className="font-medium">Local Browser Storage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-medium">IndexedDB (Browser)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Backup:</span>
              <span className="font-medium">JSON Export/Import</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}