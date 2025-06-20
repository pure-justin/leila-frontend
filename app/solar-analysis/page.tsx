'use client';

import { useState, useEffect } from 'react';
import { 
  Sun, Battery, DollarSign, Leaf, Calculator, 
  TrendingUp, Award, Info, MapPin, Home 
} from 'lucide-react';
import PropertyMap3D from '@/components/PropertyMap3D';
import { solarService, SolarPotential, SolarInstallationQuote } from '@/lib/solar-service';
import { propertyDataService, PropertyData } from '@/lib/property-data-service';

export default function SolarAnalysisPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [solarData, setSolarData] = useState<SolarPotential | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [quote, setQuote] = useState<SolarInstallationQuote | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<'analysis' | 'financial' | 'environmental'>('analysis');

  const analyzeProperty = async () => {
    if (!address) return;
    
    setLoading(true);
    try {
      // Get solar potential analysis
      const solar = await solarService.analyzeSolarPotential(address);
      setSolarData(solar);
      
      // Get property data
      const property = await propertyDataService.getParcelData(address);
      if (property) {
        setPropertyData({ parcel: property });
      }
      
      // Generate quote
      if (solar || property) {
        const solarQuote = await solarService.generateSolarQuote(
          address, 
          solar, 
          property?.buildingSize
        );
        setQuote(solarQuote);
      }
      
      setShowMap(true);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <Sun className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h1 className="text-4xl font-bold mb-4">Solar Potential Analysis</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Discover your home's solar potential with Google's advanced Solar API. 
              Get accurate estimates for energy production, cost savings, and environmental impact.
            </p>
          </div>
        </div>
      </div>

      {/* Address Input */}
      <div className="max-w-4xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your property address..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && analyzeProperty()}
            />
            <button
              onClick={analyzeProperty}
              disabled={!address || loading}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing...' : 'Analyze Solar Potential'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {quote && (
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Size</p>
                  <p className="text-2xl font-bold">{quote.systemSizeKw} kW</p>
                  <p className="text-sm text-gray-500">{quote.recommendedPanels} panels</p>
                </div>
                <Sun className="w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annual Production</p>
                  <p className="text-2xl font-bold">{(quote.annualProduction / 1000).toFixed(1)}k</p>
                  <p className="text-sm text-gray-500">kWh/year</p>
                </div>
                <Battery className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annual Savings</p>
                  <p className="text-2xl font-bold">${quote.savings.annual.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">per year</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Payback Period</p>
                  <p className="text-2xl font-bold">{quote.paybackPeriod.toFixed(1)}</p>
                  <p className="text-sm text-gray-500">years</p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b">
              <div className="flex">
                {(['analysis', 'financial', 'environmental'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 px-6 text-center font-medium capitalize transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-purple-600 text-purple-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8">
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Solar System Specifications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Recommended Panels</span>
                          <span className="font-medium">{quote.recommendedPanels} panels</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">System Capacity</span>
                          <span className="font-medium">{quote.systemSizeKw} kW</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Roof Area Required</span>
                          <span className="font-medium">{quote.roofArea.toLocaleString()} sq ft</span>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Annual Production</span>
                          <span className="font-medium">{quote.annualProduction.toLocaleString()} kWh</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Panel Type</span>
                          <span className="font-medium">Monocrystalline 350W</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600">Warranty</span>
                          <span className="font-medium">25 years</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {solarData && (
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-4">Roof Analysis</h3>
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Max Panels</p>
                            <p className="text-2xl font-bold">{solarData.maxArrayPanelsCount}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Sunshine Hours</p>
                            <p className="text-2xl font-bold">{Math.round(solarData.maxSunshineHoursPerYear)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Roof Segments</p>
                            <p className="text-2xl font-bold">{solarData.roofSegments?.length || 1}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Image Quality</p>
                            <p className="text-2xl font-bold">{solarData.imageryQuality}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Cost & Savings Breakdown</h3>
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-semibold mb-4 text-purple-900">Installation Costs</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>System Cost</span>
                              <span className="font-medium">${quote.estimatedCost.average.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Federal Tax Credit (30%)</span>
                              <span className="font-medium">-${(quote.estimatedCost.average * 0.3).toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold">
                              <span>Net Cost</span>
                              <span>${(quote.estimatedCost.average * 0.7).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-4 text-blue-900">Lifetime Savings</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span>Year 1 Savings</span>
                              <span className="font-medium">${quote.savings.annual.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>25-Year Savings</span>
                              <span className="font-medium">${quote.savings.lifetime.toLocaleString()}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                              <span>Total Profit</span>
                              <span>${(quote.savings.lifetime - quote.estimatedCost.average * 0.7).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Return on Investment</h3>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">ROI Progress</span>
                          <span className="text-sm font-medium">
                            {((quote.savings.lifetime / (quote.estimatedCost.average * 0.7) - 1) * 100).toFixed(0)}% ROI
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-green-500 h-4 rounded-full"
                            style={{ width: '75%' }}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        Your solar investment will pay for itself in {quote.paybackPeriod.toFixed(1)} years, 
                        then generate pure profit for the remaining {(25 - quote.paybackPeriod).toFixed(1)} years.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Financing Available</h4>
                        <p className="text-blue-800 text-sm mt-1">
                          $0 down financing options available. Monthly payments as low as 
                          ${Math.round((quote.estimatedCost.average * 0.7) / 84)} with 7-year loan.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'environmental' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Environmental Impact</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-50 rounded-lg p-6 text-center">
                        <Leaf className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-3xl font-bold text-green-900">
                          {quote.environmentalImpact.co2OffsetTons.toFixed(1)}
                        </p>
                        <p className="text-sm text-green-700">Tons of CO₂ Offset</p>
                        <p className="text-xs text-green-600 mt-1">Over 25 years</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">🌳</div>
                        <p className="text-3xl font-bold text-blue-900">
                          {quote.environmentalImpact.treesEquivalent.toLocaleString()}
                        </p>
                        <p className="text-sm text-blue-700">Trees Planted Equivalent</p>
                        <p className="text-xs text-blue-600 mt-1">Environmental benefit</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-6 text-center">
                        <div className="text-4xl mb-3">🚗</div>
                        <p className="text-3xl font-bold text-purple-900">
                          {Math.round(quote.environmentalImpact.co2OffsetTons * 2.5)}
                        </p>
                        <p className="text-sm text-purple-700">Cars Off the Road</p>
                        <p className="text-xs text-purple-600 mt-1">For one year</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6">
                    <h4 className="font-semibold mb-3">Your Green Energy Contribution</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <Award className="w-5 h-5 text-green-600 mr-2" />
                        Reduce dependence on fossil fuels
                      </li>
                      <li className="flex items-center">
                        <Award className="w-5 h-5 text-green-600 mr-2" />
                        Support renewable energy infrastructure
                      </li>
                      <li className="flex items-center">
                        <Award className="w-5 h-5 text-green-600 mr-2" />
                        Increase property value by 4-6%
                      </li>
                      <li className="flex items-center">
                        <Award className="w-5 h-5 text-green-600 mr-2" />
                        Energy independence from the grid
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
          {showMap && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold mb-4">Property Solar Analysis</h3>
              <div className="h-[500px]">
                <PropertyMap3D 
                  address={address} 
                  onPropertyData={(data) => setPropertyData(data)}
                />
              </div>
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Go Solar?</h2>
            <p className="text-xl mb-6 opacity-90">
              Get connected with certified solar installers in your area
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Get Free Quotes from Installers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}