'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Zap, TrendingUp, Home, TreePine } from 'lucide-react';

interface SolarPotentialOverlayProps {
  map: google.maps.Map | null;
  position?: google.maps.LatLngLiteral;
  onClose?: () => void;
}

interface SolarData {
  maxSunshineHoursPerYear: number;
  roofArea: number;
  carbonOffsetFactorKgPerMwh: number;
  solarPanelCapacityWatts: number;
  yearlyEnergyDcKwh: number;
  roofSegments: Array<{
    pitchDegrees: number;
    azimuthDegrees: number;
    area: number;
  }>;
}

export default function SolarPotentialOverlay({ map, position, onClose }: SolarPotentialOverlayProps) {
  const [solarData, setSolarData] = useState<SolarData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!map || !position || !window.google || !(window.google.maps as any).SolarApi) {
      return;
    }

    const fetchSolarData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const solarApi = new (window.google.maps as any).SolarApi();
        const response = await solarApi.findClosestBuilding({
          location: {
            latitude: position.lat,
            longitude: position.lng
          }
        });

        if (response && response.solarPotential) {
          setSolarData({
            maxSunshineHoursPerYear: response.solarPotential.maxSunshineHoursPerYear || 0,
            roofArea: response.solarPotential.wholeRoofStats?.areaMeters2 || 0,
            carbonOffsetFactorKgPerMwh: response.solarPotential.carbonOffsetFactorKgPerMwh || 0,
            solarPanelCapacityWatts: response.solarPotential.solarPanelCapacityWatts || 0,
            yearlyEnergyDcKwh: response.solarPotential.financialAnalyses?.[0]?.yearlyEnergyDcKwh || 0,
            roofSegments: response.solarPotential.roofSegmentStats || []
          });
        } else {
          setError('No solar data available for this location');
        }
      } catch (err) {
        console.error('Solar API error:', err);
        setError('Unable to fetch solar data');
      } finally {
        setLoading(false);
      }
    };

    fetchSolarData();
  }, [map, position]);

  if (!position) return null;

  const potentialSavings = solarData ? Math.round(solarData.yearlyEnergyDcKwh * 0.12) : 0; // $0.12/kWh average
  const co2Offset = solarData ? Math.round(solarData.yearlyEnergyDcKwh * solarData.carbonOffsetFactorKgPerMwh / 1000) : 0;
  const treesEquivalent = Math.round(co2Offset * 16.5); // 1 tree absorbs ~60kg CO2/year

  return (
    <AnimatePresence>
      <motion.div
        className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-sm"
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <motion.div
              className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sun className="w-6 h-6 text-white" />
            </motion.div>
            <h3 className="ml-3 text-lg font-bold text-gray-900 dark:text-white">
              Solar Potential
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <motion.div
              className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-gray-600 dark:text-gray-400">Analyzing solar potential...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : solarData ? (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center text-yellow-600 dark:text-yellow-400 mb-1">
                  <Sun className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Sunshine Hours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {solarData.maxSunshineHoursPerYear.toLocaleString()}h
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">per year</p>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center text-green-600 dark:text-green-400 mb-1">
                  <Zap className="w-4 h-4 mr-1" />
                  <span className="text-xs font-medium">Energy Production</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(solarData.yearlyEnergyDcKwh).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">kWh/year</p>
              </motion.div>
            </div>

            {/* Savings */}
            <motion.div
              className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Potential Annual Savings</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${potentialSavings.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </motion.div>

            {/* Environmental Impact */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Environmental Impact
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Home className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">CO₂ Offset</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {co2Offset} tons/year
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TreePine className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Equivalent to</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {treesEquivalent} trees
                  </span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-medium shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Solar Installation Quote
            </motion.button>
          </div>
        ) : null}
      </motion.div>
    </AnimatePresence>
  );
}