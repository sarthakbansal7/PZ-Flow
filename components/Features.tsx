'use client'

import { Shield, Zap, Globe } from 'lucide-react'

interface FeaturesProps {
  scrollY: number
}

export default function Features({ scrollY }: FeaturesProps) {
  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      description: 'Multi-signature wallets, hardware security modules, and SOC 2 compliance ensure your funds are always protected.',
      color: 'from-emerald-500 to-green-600'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Process thousands of transactions per second with our optimized blockchain infrastructure and smart contract automation.',
      color: 'from-sky-500 to-blue-600'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Support for 50+ cryptocurrencies and integration with major blockchain networks worldwide.',
      color: 'from-purple-500 to-indigo-600'
    }
  ]

  return (
    <section className="py-24 px-4 bg-white/60 backdrop-blur-sm relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Why Leading Companies
            <span className="block bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              Choose VietBuildPay
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Enterprise features that scale with your business needs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100"
              style={{
                transform: `translateY(${Math.sin(scrollY * 0.001 + index) * 5}px)`
              }}
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
