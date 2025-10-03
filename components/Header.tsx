'use client'

import { useState } from 'react'
import { ChevronDown, Gift, Users, DollarSign, Clock, FileText, CreditCard, QrCode, Calendar } from 'lucide-react'

const services = [
  { name: 'Airdrops', icon: Gift, description: 'Distribute tokens efficiently to multiple wallets' },
  { name: 'Payroll', icon: Users, description: 'Automate salary payments in crypto' },
  { name: 'Grants Distribution', icon: DollarSign, description: 'Manage and distribute funding grants' },
  { name: 'Token Vesting', icon: Clock, description: 'Set up vesting schedules for token releases' },
  { name: 'Subscriptions', icon: FileText, description: 'Recurring crypto subscription payments' },
  { name: 'Bill Payments', icon: CreditCard, description: 'Pay bills using cryptocurrency' },
  { name: 'Invoice Links', icon: FileText, description: 'Generate payment links for invoices' },
  { name: 'Donations', icon: Gift, description: 'Accept crypto donations seamlessly' },
  { name: 'Payment QR Generator', icon: QrCode, description: 'Create QR codes for instant payments' },
  { name: 'Event Ticketing', icon: Calendar, description: 'Blockchain-based event tickets' }
]

export default function Header() {
  const [isServicesOpen, setIsServicesOpen] = useState(false)

  return (
    <nav className="relative top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="font-bold text-2xl text-slate-800">
          PayZoll
        </div>
        
        {/* Services Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsServicesOpen(!isServicesOpen)}
            className="flex items-center space-x-2 text-slate-700 hover:text-sky-600 transition-colors py-2 px-4 font-medium"
          >
            <span>Our Services</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isServicesOpen && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-sky-100 py-4 z-50">
              <div className="grid grid-cols-1 gap-2 px-4">
                {services.map((service) => (
                  <a
                    key={service.name}
                    href="#"
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sky-50 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <service.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-800 group-hover:text-blue-600">{service.name}</div>
                      <div className="text-sm text-slate-500">{service.description}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
