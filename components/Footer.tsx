'use client'

import { Globe, Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="py-16 px-4 bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="font-bold text-2xl text-white mb-4">
              VietBuild<span className="text-sky-400">Pay</span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed mb-6">
              The most trusted Web3 payments platform for enterprises. 
              Secure, scalable, and compliant payment solutions for the modern business.
            </p>
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors cursor-pointer">
                <Globe className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-sky-600 transition-colors cursor-pointer">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <div className="space-y-3">
              <a href="#" className="block hover:text-sky-400 transition-colors">Payment Processing</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Smart Contracts</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">API Integration</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Analytics</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <div className="space-y-3">
              <a href="#" className="block hover:text-sky-400 transition-colors">Documentation</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">API Reference</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Support Center</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Status Page</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <div className="space-y-3">
              <a href="#" className="block hover:text-sky-400 transition-colors">About Us</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Careers</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Press</a>
              <a href="#" className="block hover:text-sky-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-500">© 2025 VietBuildPay. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-500 hover:text-sky-400 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
