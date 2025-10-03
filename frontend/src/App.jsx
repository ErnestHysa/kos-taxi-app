import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Car, User } from 'lucide-react'
import RiderView from './components/RiderView.jsx'
import DriverView from './components/DriverView.jsx'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('rider')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Kos Taxi</h1>
                <p className="text-sm text-gray-500">Private Ride Service</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Serving Kos Island</p>
              <p className="text-xs text-gray-500">🇬🇷 Greece</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-6xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl">Welcome to Kos Taxi</CardTitle>
            <CardDescription className="text-base">
              Book your private ride or manage trips as a driver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="rider" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Request a Ride
                </TabsTrigger>
                <TabsTrigger value="driver" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Driver Dashboard
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="rider">
                <RiderView />
              </TabsContent>
              
              <TabsContent value="driver">
                <DriverView />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 text-center text-sm text-gray-500">
        <p>© 2025 Kos Taxi - Private Ride Service | Kos Island, Greece</p>
      </footer>
    </div>
  )
}

export default App
