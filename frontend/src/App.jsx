import { useState } from 'react';
import RiderView from './components/RiderView';
import DriverView from './components/DriverView';
import { Car, User, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('rider');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                <Car className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Kos Taxi
                </h1>
                <p className="text-xs text-gray-500 font-medium">Private Ride Service</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl">
              <button
                onClick={() => setActiveTab('rider')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'rider'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Request Ride</span>
              </button>
              <button
                onClick={() => setActiveTab('driver')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                  activeTab === 'driver'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Car className="w-5 h-5" />
                <span>Driver Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8">
        {/* Welcome Banner */}
        {activeTab === 'rider' && (
          <div className="mx-6 mb-6 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Welcome to Kos Taxi</h2>
            </div>
            <p className="text-blue-100">
              Book your private ride in Kos, Greece. Fast, reliable, and comfortable transportation.
            </p>
          </div>
        )}

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'rider' ? <RiderView /> : <DriverView />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm">
              © 2025 Kos Taxi. Private ride-hailing service in Kos, Greece.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Powered by</span>
              <span className="font-semibold text-blue-600">Stripe</span>
              <span>•</span>
              <span className="font-semibold text-green-600">OpenStreetMap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
