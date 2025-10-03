"use client";

import React, { useState, useEffect } from "react";
import { 
  Download, 
  Upload, 
  Users, 
  DollarSign, 
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
  Info
} from "lucide-react";
import Link from "next/link";

// Employee interface
interface Employee {
  id: string;
  wallet: string;
  name: string;
  email: string;
  salary: string;
}

const PayrollPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'info'; message: string} | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    wallet: "",
    name: "",
    email: "",
    salary: ""
  });

  // Initialize with empty employees array and check first visit
  useEffect(() => {
    setEmployees([]);
    
    // Check if this is the first visit
    const hasVisitedPayroll = localStorage.getItem('payroll-visited');
    if (!hasVisitedPayroll) {
      setShowTutorial(true);
      localStorage.setItem('payroll-visited', 'true');
    }
  }, []);

  // Show notification
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Check for duplicate employees
  const isDuplicate = (newEmp: Omit<Employee, 'id'>, existingEmployees: Employee[]): boolean => {
    return existingEmployees.some(emp => 
      emp.wallet.toLowerCase() === newEmp.wallet.toLowerCase() || 
      emp.email.toLowerCase() === newEmp.email.toLowerCase()
    );
  };

  // Save employees as CSV
  const saveEmployeesAsCSV = () => {
    if (employees.length === 0) {
      showNotification('info', 'No employees to save');
      return;
    }

    const csvContent = `Wallet Address,Name,Email,Salary\n${employees.map(emp => 
      `${emp.wallet},${emp.name},${emp.email},${emp.salary}`
    ).join('\n')}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    showNotification('success', 'Employee list saved as CSV');
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    const csvContent = `Wallet Address,Name,Email,Salary
0x742F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7C8,John Doe,john.doe@company.com,5000
0x123F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7C9,Jane Smith,jane.smith@company.com,4500
0x456F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7D0,Mike Johnson,mike.johnson@company.com,6000`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payroll_template.csv';
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
      const csvEmployees: Employee[] = [];
      const duplicates: string[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const [wallet, name, email, salary] = line.split(',');
        if (wallet && name && email && salary) {
          const newEmp = {
            wallet: wallet.trim(),
            name: name.trim(),
            email: email.trim(),
            salary: salary.trim()
          };
          
          if (!isDuplicate(newEmp, employees) && !isDuplicate(newEmp, csvEmployees)) {
            csvEmployees.push({
              id: Date.now().toString() + i,
              ...newEmp
            });
          } else {
            duplicates.push(newEmp.name);
          }
        }
      }
      
      // Add new employees to existing list
      setEmployees(prev => [...prev, ...csvEmployees]);
      
      if (csvEmployees.length > 0) {
        showNotification('success', `Added ${csvEmployees.length} employees from CSV`);
      }
      if (duplicates.length > 0) {
        showNotification('info', `Skipped ${duplicates.length} duplicate entries`);
      }
    };
    
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  // Add or update employee
  const handleAddEmployee = () => {
    if (!newEmployee.wallet || !newEmployee.name || !newEmployee.email || !newEmployee.salary) {
      showNotification('error', 'Please fill in all fields');
      return;
    }

    // Validate wallet address format
    if (!newEmployee.wallet.startsWith('0x') || newEmployee.wallet.length !== 42) {
      showNotification('error', 'Please enter a valid wallet address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmployee.email)) {
      showNotification('error', 'Please enter a valid email address');
      return;
    }

    // Validate salary is a number
    if (isNaN(parseFloat(newEmployee.salary)) || parseFloat(newEmployee.salary) <= 0) {
      showNotification('error', 'Please enter a valid salary amount');
      return;
    }

    // Check for duplicates (exclude current employee when editing)
    const otherEmployees = editingEmployee 
      ? employees.filter(emp => emp.id !== editingEmployee.id)
      : employees;
    
    if (isDuplicate(newEmployee, otherEmployees)) {
      showNotification('error', 'Employee with this wallet or email already exists');
      return;
    }

    if (editingEmployee) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...newEmployee }
          : emp
      ));
      showNotification('success', 'Employee updated successfully!');
    } else {
      // Add new employee
      const employee: Employee = {
        id: Date.now().toString(),
        wallet: newEmployee.wallet,
        name: newEmployee.name,
        email: newEmployee.email,
        salary: newEmployee.salary
      };
      setEmployees(prev => [...prev, employee]);
      showNotification('success', 'Employee added successfully!');
    }

    setNewEmployee({ wallet: "", name: "", email: "", salary: "" });
    setEditingEmployee(null);
    setShowAddEmployeeModal(false);
  };

  // Toggle employee selection
  const toggleEmployeeSelection = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  // Toggle all employees
  const toggleAllEmployees = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp.id));
    }
  };

  // Calculate total amount for selected employees
  const calculateTotalAmount = () => {
    return employees
      .filter(emp => selectedEmployees.includes(emp.id))
      .reduce((sum, emp) => sum + parseFloat(emp.salary), 0);
  };

  // Delete employee
  const handleDeleteEmployee = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
    showNotification('success', `Removed ${employee?.name || 'employee'}`);
  };

  // Edit employee
  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setNewEmployee({
      wallet: employee.wallet,
      name: employee.name,
      email: employee.email,
      salary: employee.salary
    });
    setShowAddEmployeeModal(true);
  };

  // Handle pay selected employees
  const handlePaySelectedEmployees = () => {
    if (selectedEmployees.length === 0) {
      showNotification('error', 'Please select at least one employee to pay');
      return;
    }
    
    // Show save prompt if there are employees
    if (employees.length > 0) {
      setShowSavePrompt(true);
    } else {
      proceedWithPayment();
    }
  };

  // Proceed with payment after save prompt
  const proceedWithPayment = () => {
    setShowSavePrompt(false);
    setIsLoading(true);
    // Simulate payment process
    setTimeout(() => {
      showNotification('success', `Payment initiated for ${selectedEmployees.length} employees. Total: $${calculateTotalAmount()}`);
      setSelectedEmployees([]);
      setIsLoading(false);
    }, 2000);
  };

  // Save CSV and proceed with payment
  const saveAndProceedWithPayment = () => {
    saveEmployeesAsCSV();
    proceedWithPayment();
  };

  const allSelected = selectedEmployees.length === employees.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-green-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-green-600 hover:text-green-800 transition-colors">
                <Home size={24} />
              </Link>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent"> Corporate Payroll</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Action buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={downloadExcelTemplate}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <Download size={14} />
                  <span>Template</span>
                </button>
                
                <label className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer text-sm">
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
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus size={14} />
                  <span>Add Employee</span>
                </button>
                
                <button
                  onClick={() => setShowTutorial(true)}
                  className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
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
        {/* Employee Table */}
        <div className="bg-transparent backdrop-blur-sm rounded-lg border border-green-200/50 shadow-sm">
          <div className="px-6 py-4 border-b border-green-100/50 bg-green-50/30">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-6">
                <h2 className="text-lg font-medium text-gray-900">Employee List</h2>
                {/* Employee stats */}
                <div className="flex items-center space-x-4 text-sm text-green-700">
                  <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 rounded-full">
                    <Users size={14} />
                    <span>{employees.length} Employees</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-100 rounded-full">
                    <CheckCircle size={14} />
                    <span>{selectedEmployees.length} Selected</span>
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 bg-teal-100 rounded-full">
                    <DollarSign size={14} />
                    <span>${calculateTotalAmount().toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {selectedEmployees.length > 0 && (
                <button
                  onClick={handlePaySelectedEmployees}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={18} />
                  <span>
                    {isLoading ? 'Processing...' : `Pay Selected (${selectedEmployees.length})`}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-50/30 backdrop-blur-sm">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleAllEmployees}
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
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-green-100/50">
                {employees.map((employee) => (
                  <tr 
                    key={employee.id}
                    className={`hover:bg-gray-50 ${
                      selectedEmployees.includes(employee.id) ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEmployeeSelection(employee.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedEmployees.includes(employee.id) ? (
                          <CheckCircle size={20} className="text-blue-600" />
                        ) : (
                          <Circle size={20} />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{employee.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Wallet size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500 font-mono">
                          {employee.wallet.slice(0, 6)}...{employee.wallet.slice(-4)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${parseFloat(employee.salary).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditEmployee(employee)}
                          className="text-blue-400 hover:text-blue-600 transition-colors"
                          title="Edit employee"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          title="Delete employee"
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

          {employees.length === 0 && (
            <div className="text-center py-16 bg-transparent rounded-b-lg">
              <Users className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No employees yet</h3>
              <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                Start building your team! Add employees manually or upload a CSV file to get started.
              </p>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Add First Employee
                </button>
                <button
                  onClick={downloadExcelTemplate}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Download Template
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h3>
              <button
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setEditingEmployee(null);
                  setNewEmployee({ wallet: "", name: "", email: "", salary: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={newEmployee.wallet}
                  onChange={(e) => setNewEmployee({...newEmployee, wallet: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="0x742F35Cc6C4D0f2f8A78a0D8B2A7D3E4F5A6B7C8"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Salary ($)
                </label>
                <input
                  type="number"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({...newEmployee, salary: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddEmployeeModal(false);
                  setEditingEmployee(null);
                  setNewEmployee({ wallet: "", name: "", email: "", salary: "" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                {editingEmployee ? 'Update Employee' : 'Add Employee'}
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
              <h3 className="text-lg font-medium text-gray-900">Save Employee Data</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Would you like to save your current employee list as a CSV file before processing the payment? 
              This will help you keep a backup for future use.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={proceedWithPayment}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                No (Continue to Pay)
              </button>
              <button
                onClick={saveAndProceedWithPayment}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Yes (Save & Pay)
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
          'bg-green-500 text-white'
        }`}>
          {notification.type === 'success' && <CheckCircle2 size={20} />}
          {notification.type === 'error' && <AlertCircle size={20} />}
          {notification.type === 'info' && <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">🚀 Welcome to Corporate Payroll!</h2>
                  <p className="text-green-100 mt-1">Get started with managing your employee payments in just a few simple steps</p>
                </div>
                <button
                  onClick={() => setShowTutorial(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">1</div>
                    <h3 className="font-bold text-green-800 text-lg">Download Template</h3>
                  </div>
                  <div className="space-y-3 text-sm text-green-700">
                    <p>• Click <span className="bg-green-100 px-2 py-1 rounded font-medium">"Template"</span> button in header</p>
                    <p>• Download the CSV template file</p>
                    <p>• Open in Excel or Google Sheets</p>
                    <p>• Fill employee details: Name, Email, Wallet, Salary</p>
                    <div className="bg-green-100 p-3 rounded-lg mt-3">
                      <p className="font-medium text-green-800">CSV Format:</p>
                      <code className="text-xs text-green-700">Name, Email, Wallet, Salary</code>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">2</div>
                    <h3 className="font-bold text-green-800 text-lg">Add Employees</h3>
                  </div>
                  <div className="space-y-3 text-sm text-green-700">
                    <div>
                      <p className="font-medium">Bulk Upload:</p>
                      <p>• Click <span className="bg-green-100 px-2 py-1 rounded font-medium">"Upload CSV"</span> with your filled template</p>
                    </div>
                    <div>
                      <p className="font-medium">Manual Entry:</p>
                      <p>• Click <span className="bg-green-100 px-2 py-1 rounded font-medium">"Add Employee"</span> for single entries</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg mt-3">
                      <p className="font-medium text-green-800">Pro Tip:</p>
                      <p className="text-xs text-green-700">Bulk upload is faster for multiple employees!</p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-3">3</div>
                    <h3 className="font-bold text-green-800 text-lg">Process Payments</h3>
                  </div>
                  <div className="space-y-3 text-sm text-green-700">
                    <p>• Select employees using checkboxes</p>
                    <p>• Review total amount in the stats badges</p>
                    <p>• Click <span className="bg-green-100 px-2 py-1 rounded font-medium">"Pay Selected"</span> button</p>
                    <p>• Confirm payment details and execute</p>
                    <div className="bg-green-100 p-3 rounded-lg mt-3">
                      <p className="font-medium text-green-800">Security:</p>
                      <p className="text-xs text-green-700">Always verify wallet addresses before paying!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-300">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="text-green-600 mt-1" size={20} />
                  <div>
                    <h4 className="font-bold text-green-800 mb-2">💡 Pro Tips for Success:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-green-700">
                      <li>Ensure all wallet addresses are valid before uploading</li>
                      <li>You can edit employee details anytime by clicking the edit icon</li>
                      <li>Use "Select All" checkbox to pay all employees at once</li>
                      <li>Download your employee list as backup using the export feature</li>
                      <li>The system prevents duplicate entries by email and wallet address</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={() => setShowTutorial(false)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Got it! Let's start 🚀
                </button>
                <button
                  onClick={() => {
                    setShowTutorial(false);
                    downloadExcelTemplate();
                  }}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Download Template First 📄
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPage;
