'use client';

import { useState } from 'react';
import Chatbot from './components/Chatbot';
import LocalStorageSync from './components/LocalStorageSync';

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-blue-900">Telkom</h1>
                <p className="text-blue-600 text-sm">Network Services</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#services" className="text-blue-900 hover:text-blue-600 font-medium">Services</a>
              <a href="#plans" className="text-blue-900 hover:text-blue-600 font-medium">Plans</a>
              <a href="#support" className="text-blue-900 hover:text-blue-600 font-medium">Support</a>
              <a href="#contact" className="text-blue-900 hover:text-blue-600 font-medium">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-blue-900 mb-6">
            Connect to the Future
          </h2>
          <p className="text-xl text-blue-700 mb-8 max-w-3xl mx-auto">
            Experience lightning-fast internet, reliable mobile services, and 24/7 customer support 
            with South Africa's leading telecommunications provider.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              View Plans
            </button>
            <button 
              onClick={() => setIsChatOpen(true)}
              className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Chat with Support
            </button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-12">Our Services</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">📶</span>
              </div>
              <h4 className="text-xl font-semibold text-blue-900 mb-3">Mobile Services</h4>
              <p className="text-blue-700">Prepaid and contract mobile plans with nationwide coverage and 5G connectivity.</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🌐</span>
              </div>
              <h4 className="text-xl font-semibold text-blue-900 mb-3">Fiber Internet</h4>
              <p className="text-blue-700">Ultra-fast fiber internet with speeds up to 1Gbps for homes and businesses.</p>
            </div>
            <div className="text-center p-6 rounded-lg border border-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">☁️</span>
              </div>
              <h4 className="text-xl font-semibold text-blue-900 mb-3">Cloud Solutions</h4>
              <p className="text-blue-700">Enterprise cloud services, hosting, and digital transformation solutions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="plans" className="py-16 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-12">Popular Plans</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-lg border-t-4 border-blue-400">
              <h4 className="text-2xl font-bold text-blue-900 mb-4">Starter</h4>
              <div className="text-3xl font-bold text-blue-600 mb-4">R299<span className="text-lg text-blue-400">/month</span></div>
              <ul className="space-y-3 text-blue-700 mb-6">
                <li>✓ 20GB Data</li>
                <li>✓ Unlimited SMS</li>
                <li>✓ 100 Minutes</li>
                <li>✓ 4G/5G Access</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Choose Plan
              </button>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg border-t-4 border-blue-600 transform scale-105">
              <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold inline-block mb-4">Most Popular</div>
              <h4 className="text-2xl font-bold text-blue-900 mb-4">Premium</h4>
              <div className="text-3xl font-bold text-blue-600 mb-4">R599<span className="text-lg text-blue-400">/month</span></div>
              <ul className="space-y-3 text-blue-700 mb-6">
                <li>✓ 100GB Data</li>
                <li>✓ Unlimited SMS</li>
                <li>✓ 500 Minutes</li>
                <li>✓ 5G Priority Access</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Choose Plan
              </button>
            </div>
            <div className="bg-white rounded-lg p-8 shadow-lg border-t-4 border-blue-400">
              <h4 className="text-2xl font-bold text-blue-900 mb-4">Business</h4>
              <div className="text-3xl font-bold text-blue-600 mb-4">R999<span className="text-lg text-blue-400">/month</span></div>
              <ul className="space-y-3 text-blue-700 mb-6">
                <li>✓ Unlimited Data</li>
                <li>✓ Unlimited SMS</li>
                <li>✓ Unlimited Minutes</li>
                <li>✓ Priority Support</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Choose Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section id="support" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-blue-900 mb-8">Need Help?</h3>
          <p className="text-xl text-blue-700 mb-8">Our support team is available 24/7 to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setIsChatOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              💬 Live Chat
            </button>
            <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
              📞 Call Us: 10210
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center mr-2">
                  <span className="text-blue-900 font-bold">T</span>
                </div>
                <span className="text-xl font-bold">Telkom</span>
              </div>
              <p className="text-blue-200">Connecting South Africa to the digital world.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Services</h5>
              <ul className="space-y-2 text-blue-200">
                <li>Mobile Plans</li>
                <li>Fiber Internet</li>
                <li>Business Solutions</li>
                <li>Cloud Services</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-blue-200">
                <li>Help Center</li>
                <li>Live Chat</li>
                <li>Store Locator</li>
                <li>Network Status</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contact</h5>
              <ul className="space-y-2 text-blue-200">
                <li>📞 10210</li>
                <li>📧 support@telkom.co.za</li>
                <li>🏢 Telkom Towers, Pretoria</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200">
            <p>&copy; 2024 Telkom. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      
      {/* LocalStorage Sync Component */}
      <LocalStorageSync />

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        >
          💬
        </button>
      )}
    </div>
  );
}
