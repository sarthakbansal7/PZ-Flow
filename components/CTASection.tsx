'use client'

export default function CTASection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-sky-600 via-blue-600 to-blue-700"></div>
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl lg:text-6xl font-bold text-white mb-8">
          Ready to Transform Your
          <span className="block">Payment Operations?</span>
        </h2>
        <p className="text-xl text-sky-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of organizations already using VietBuildPay to streamline their Web3 payment workflows. 
          Start your free trial today.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <button className="px-12 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
            Start Free Trial
          </button>
          <button className="px-12 py-4 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300">
            Schedule Demo
          </button>
        </div>
        
        <div className="mt-12 text-sky-100 text-sm">
          No credit card required • 14-day free trial • Enterprise support included
        </div>
      </div>
    </section>
  )
}
