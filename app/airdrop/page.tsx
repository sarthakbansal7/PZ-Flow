"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, 
  Upload, 
  Users, 
  Package,
  CheckCircle, 
  Circle,
  Play,
  Home,
  Wallet,
  Plus,
  X,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Edit,
  Gift,
  Info
} from "lucide-react";
import Link from "next/link";

// Recipient interface for airdrop
interface Recipient {
  id: string;
  address: string;
  quantity: string;
}

const AirdropPage: React.FC = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddRecipientModal, setShowAddRecipientModal] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  const [newRecipient, setNewRecipient] = useState({
    address: "",
    quantity: ""
  });

  // Initialize with empty recipients array and check first visit
  useEffect(() => {
    setRecipients([]);
    
    // Check if this is the first visit
    const hasVisitedAirdrop = localStorage.getItem('airdrop-visited');
    if (!hasVisitedAirdrop) {
      setShowTutorial(true);
      localStorage.setItem('airdrop-visited', 'true');
    }
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check for duplicate recipients
  const isDuplicate = (newRec: Omit<Recipient, 'id'>, existingRecipients: Recipient[]): boolean => {
    return existingRecipients.some(rec => 
      rec.address.toLowerCase() === newRec.address.toLowerCase()
    );
  };

  // Save recipients as CSV
  const saveRecipientsAsCSV = () => {
    if (recipients.length === 0) {
      showNotification('info', 'No recipients to save');
      return;
    }

    const csvContent = `Address,Quantity\\n${recipients.map(rec => 
      `${rec.address},${rec.quantity}`
    ).join('\\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `airdrop_recipients_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('success', 'Recipient list saved as CSV');
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csvContent = `Address,Quantity
0x742F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7C8,100
0x123F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7C9,250
0x456F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7D0,500`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airdrop_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle CSV file upload
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      
      // Skip header row and process data
      const csvRecipients: Recipient[] = [];
      const duplicates: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [address, quantity] = line.split(',');
        if (address && quantity) {
          const newRec = {
            address: address.trim(),
            quantity: quantity.trim()
          };
          
          if (!isDuplicate(newRec, recipients) && !isDuplicate(newRec, csvRecipients)) {
            csvRecipients.push({
              id: Date.now().toString() + i,
              ...newRec
            });
          } else {
            duplicates.push(newRec.address);
          }
        }
      }
      
      // Add new recipients to existing list
      setRecipients(prev => [...prev, ...csvRecipients]);
      
      if (csvRecipients.length > 0) {
        showNotification('success', `Added ${csvRecipients.length} recipients from CSV`);
      }
      if (duplicates.length > 0) {
        showNotification('info', `Skipped ${duplicates.length} duplicate entries`);
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Add or update recipient
  const handleAddRecipient = () => {
    if (!newRecipient.address || !newRecipient.quantity) {
      showNotification('error', 'Please fill in all fields');
      return;
    }

    // Validate wallet address format
    if (!newRecipient.address.startsWith('0x') || newRecipient.address.length !== 42) {
      showNotification('error', 'Please enter a valid wallet address');
      return;
    }

    // Validate quantity is a number
    if (isNaN(parseFloat(newRecipient.quantity)) || parseFloat(newRecipient.quantity) <= 0) {
      showNotification('error', 'Please enter a valid quantity');
      return;
    }

    // Check for duplicates (exclude current recipient when editing)
    const otherRecipients = editingRecipient 
      ? recipients.filter(rec => rec.id !== editingRecipient.id)
      : recipients;
    
    if (isDuplicate(newRecipient, otherRecipients)) {
      showNotification('error', 'Address already exists in the list');
      return;
    }

    if (editingRecipient) {
      // Update existing recipient
      setRecipients(prev => prev.map(rec => 
        rec.id === editingRecipient.id 
          ? { ...rec, ...newRecipient }
          : rec
      ));
      showNotification('success', 'Recipient updated successfully!');
    } else {
      // Add new recipient
      const recipient: Recipient = {
        id: Date.now().toString(),
        address: newRecipient.address,
        quantity: newRecipient.quantity
      };
      setRecipients(prev => [...prev, recipient]);
      showNotification('success', 'Recipient added successfully!');
    }

    setNewRecipient({ address: "", quantity: "" });
    setEditingRecipient(null);
    setShowAddRecipientModal(false);
  };

  // Toggle recipient selection
  const toggleRecipientSelection = (recipientId: string) => {
    setSelectedRecipients(prev =>
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  };

  // Toggle all recipients
  const toggleAllRecipients = () => {
    if (selectedRecipients.length === recipients.length) {
      setSelectedRecipients([]);
    } else {
      setSelectedRecipients(recipients.map(rec => rec.id));
    }
  };

  // Calculate total quantity for selected recipients
  const calculateTotalQuantity = () => {
    return recipients
      .filter(rec => selectedRecipients.includes(rec.id))
      .reduce((sum, rec) => sum + parseFloat(rec.quantity), 0);
  };

  // Delete recipient
  const handleDeleteRecipient = (recipientId: string) => {
    const recipient = recipients.find(rec => rec.id === recipientId);
    setRecipients(prev => prev.filter(rec => rec.id !== recipientId));
    setSelectedRecipients(prev => prev.filter(id => id !== recipientId));
    showNotification('success', `Removed ${recipient?.address.slice(0, 8)}...`);
  };

  // Edit recipient
  const handleEditRecipient = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setNewRecipient({
      address: recipient.address,
      quantity: recipient.quantity
    });
    setShowAddRecipientModal(true);
  };

  // Handle airdrop to selected recipients
  const handleAirdropToSelected = () => {
    if (selectedRecipients.length === 0) {
      showNotification('error', 'Please select at least one recipient');
      return;
    }
    
    // Show save prompt if there are recipients
    if (recipients.length > 0) {
      setShowSavePrompt(true);
    } else {
      proceedWithAirdrop();
    }
  };

  // Proceed with airdrop after save prompt
  const proceedWithAirdrop = () => {
    setShowSavePrompt(false);
    setIsLoading(true);
    // Simulate airdrop process
    setTimeout(() => {
      showNotification('success', `Airdrop initiated for ${selectedRecipients.length} recipients. Total: ${calculateTotalQuantity()} tokens`);
      setSelectedRecipients([]);
      setIsLoading(false);
    }, 2000);
  };

  // Save CSV and proceed with airdrop
  const saveAndProceedWithAirdrop = () => {
    saveRecipientsAsCSV();
    proceedWithAirdrop();
  };

  const allSelected = selectedRecipients.length === recipients.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 to-violet-600/10 backdrop-blur-sm border-b border-purple-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-purple-600 hover:text-purple-800 transition-all duration-300 hover:scale-110">
                <Home size={24} />
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent animate-pulse">
                Crypto Airdrop Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadCSVTemplate}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-md hover:from-purple-600 hover:to-violet-600 transition-colors text-sm"
                >
                  <Download size={14} />
                  <span>Template</span>
                </button>
                
                <label className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-md hover:from-purple-600 hover:to-violet-600 transition-colors cursor-pointer text-sm">
                  <Upload size={14} />
                  <span>Upload CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVUpload}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => setShowAddRecipientModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-md hover:from-purple-600 hover:to-violet-600 transition-colors text-sm"
                >
                  <Plus size={14} />
                  <span>Add Recipient</span>
                </button>
                
                <button
                  onClick={() => setShowTutorial(true)}
                  className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  title="Show Tutorial"
                >
                  i
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipient Table */}
        <div className="bg-transparent backdrop-blur-sm rounded-lg border border-purple-200/50 shadow-sm">
          <div className="px-6 py-4 border-b border-purple-100/50 bg-purple-50/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <h2 className="text-lg font-medium text-gray-900">Recipient List</h2>
                {/* Recipients stats */}
                <div className="flex items-center space-x-4 text-sm text-purple-700 font-medium">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-purple-100 rounded-full">
                    <Users size={14} />
                    <span>{recipients.length} Recipients</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-violet-100 rounded-full">
                    <CheckCircle size={14} />
                    <span>{selectedRecipients.length} Selected</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-fuchsia-100 rounded-full">
                    <Package size={14} />
                    <span>{calculateTotalQuantity().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {selectedRecipients.length > 0 && (
                <button
                  onClick={handleAirdropToSelected}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-lg hover:from-purple-600 hover:to-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Gift size={18} />
                  <span>
                    {isLoading ? 'Processing...' : `Airdrop to Selected (${selectedRecipients.length})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-50/30 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleAllRecipients}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {allSelected ? (
                          <CheckCircle size={20} className="text-blue-600" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select All
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-purple-100/50">
                {recipients.map((recipient) => (
                  <tr 
                    key={recipient.id}
                    className={`hover:bg-gray-50 ${
                      selectedRecipients.includes(recipient.id) ? 'bg-purple-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleRecipientSelection(recipient.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedRecipients.includes(recipient.id) ? (
                          <CheckCircle size={20} className="text-blue-600" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Wallet size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 font-mono">
                          {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {parseFloat(recipient.quantity).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditRecipient(recipient)}
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                          title="Edit recipient"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecipient(recipient.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete recipient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {recipients.length === 0 && (
            <div className="text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No recipients</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add recipients manually or upload a CSV file to get started.
              </p>
            </div>
          )}
        </div>


      </div>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">🎁 Welcome to Crypto Airdrop Distribution!</h2>
                  <p className="text-purple-100 mt-1">Efficient token distribution for your Web3 community</p>
                </div>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                    <h3 className="font-bold text-purple-800 text-lg">Prepare Recipients</h3>
                  </div>
                  <div className="space-y-3 text-sm text-purple-700">
                    <p>• Collect wallet addresses from your community</p>
                    <p>• Verify addresses are valid and active</p>
                    <p>• Determine allocation amounts per recipient</p>
                    <p>• Consider snapshot dates for eligibility</p>
                    <div className="bg-purple-100 p-3 rounded-lg mt-3">
                      <p className="font-medium text-purple-800">Address Types:</p>
                      <code className="text-xs text-purple-700">Ethereum, BSC, Polygon, etc.</code>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                    <h3 className="font-bold text-purple-800 text-lg">Add Recipients</h3>
                  </div>
                  <div className="space-y-3 text-sm text-purple-700">
                    <div>
                      <p className="font-medium">Input Methods:</p>
                      <p>• <span className="bg-blue-100 px-2 py-1 rounded text-xs">Manual</span> - Add one by one</p>
                      <p>• <span className="bg-green-100 px-2 py-1 rounded text-xs">CSV Upload</span> - Bulk import</p>
                      <p>• <span className="bg-purple-100 px-2 py-1 rounded text-xs">Address,Quantity</span> format</p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg mt-3">
                      <p className="font-medium text-purple-800">Pro Tip:</p>
                      <p className="text-xs text-purple-700">Use CSV for large airdrops (1000+ recipients)!</p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                    <h3 className="font-bold text-purple-800 text-lg">Execute Airdrop</h3>
                  </div>
                  <div className="space-y-3 text-sm text-purple-700">
                    <p>• Review recipient list carefully</p>
                    <p>• Select recipients for current batch</p>
                    <p>• Ensure sufficient token balance in wallet</p>
                    <p>• Execute batch transfer transaction</p>
                    <div className="bg-purple-100 p-3 rounded-lg mt-3">
                      <p className="font-medium text-purple-800">Gas Optimization:</p>
                      <p className="text-xs text-purple-700">Batch transfers save significant gas fees!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Airdrop-specific Features */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-100 to-violet-100 rounded-lg border border-purple-300">
                <div className="flex items-start space-x-3">
                  <Gift className="text-purple-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-purple-800 mb-2">🚀 Crypto-Native Features:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-purple-700">
                      <li><strong>Multi-Chain Support:</strong> Ethereum, BSC, Polygon compatible</li>
                      <li><strong>Batch Transfers:</strong> Gas-efficient bulk token distribution</li>
                      <li><strong>Address Validation:</strong> Prevent failed transactions</li>
                      <li><strong>Allocation Management:</strong> Flexible quantity distribution</li>
                      <li><strong>CSV Templates:</strong> Easy bulk import for large campaigns</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Start Your Airdrop 🎁
                </button>
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    downloadCSVTemplate();
                  }}
                  className="px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium"
                >
                  Download Template 📄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Recipient Modal */}
      {showAddRecipientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRecipient ? 'Edit Recipient' : 'Add New Recipient'}
              </h3>
              <button
                onClick={() => {
                  setShowAddRecipientModal(false);
                  setEditingRecipient(null);
                  setNewRecipient({ address: "", quantity: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newRecipient.address}
                  onChange={(e) => setNewRecipient({...newRecipient, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="0x742F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7C8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={newRecipient.quantity}
                  onChange={(e) => setNewRecipient({...newRecipient, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddRecipientModal(false);
                  setEditingRecipient(null);
                  setNewRecipient({ address: "", quantity: "" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRecipient}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-md hover:from-purple-600 hover:to-violet-600 transition-colors"
              >
                {editingRecipient ? 'Update Recipient' : 'Add Recipient'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save CSV Prompt Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Save Recipient Data</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Would you like to save your current recipient list as a CSV file before processing the airdrop? 
              This will help you keep a backup for future use.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={proceedWithAirdrop}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                No (Continue Airdrop)
              </button>
              <button
                onClick={saveAndProceedWithAirdrop}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-md hover:from-purple-600 hover:to-violet-600 transition-colors"
              >
                Yes (Save & Airdrop)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' :
          notification.type === 'error' ? 'bg-red-500 text-white' :
          'bg-purple-500 text-white'
        }`}>
          {notification.type === 'success' && <CheckCircle2 size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'info' && <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default AirdropPage;
