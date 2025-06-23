'use client';

import { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Copy, CheckCircle } from 'lucide-react';

interface QRConfig {
  service: string;
  size: number;
  bgColor: string;
  fgColor: string;
  includeImage: boolean;
}

export default function QRGenerator() {
  const [config, setConfig] = useState<QRConfig>({
    service: 'plumbing',
    size: 256,
    bgColor: '#FFFFFF',
    fgColor: '#7C3AED',
    includeImage: true,
  });
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const services = [
    { value: 'plumbing', label: 'Plumbing', emoji: '🔧' },
    { value: 'electrical', label: 'Electrical', emoji: '⚡' },
    { value: 'cleaning', label: 'House Cleaning', emoji: '🧹' },
    { value: 'hvac', label: 'HVAC', emoji: '❄️' },
    { value: 'landscaping', label: 'Landscaping', emoji: '🌿' },
    { value: 'handyman', label: 'Handyman', emoji: '🔨' },
    { value: 'general', label: 'General (All Services)', emoji: '🏠' },
  ];

  const getQRValue = () => {
    // This URL will trigger App Clip on iOS and redirect to mobile web on Android
    return `https://heyleila.com/qr/${config.service}`;
  };

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `leila-qr-${config.service}-${config.size}.png`;
      link.href = url;
      link.click();
    }
  };

  const copyURL = () => {
    navigator.clipboard.writeText(getQRValue());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">QR Code Generator</h1>
        <p className="text-gray-600">
          Generate QR codes for billboards, flyers, and marketing materials. 
          These codes will open the App Clip on iOS and mobile web on Android.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Configuration</h2>
          
          {/* Service Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={config.service}
              onChange={(e) => setConfig({ ...config, service: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {services.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.emoji} {service.label}
                </option>
              ))}
            </select>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size (pixels)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[128, 256, 512, 1024].map((size) => (
                <button
                  key={size}
                  onClick={() => setConfig({ ...config, size })}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    config.size === size
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.fgColor}
                  onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={config.bgColor}
                  onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Logo Option */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.includeImage}
                onChange={(e) => setConfig({ ...config, includeImage: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Include Leila logo in center
              </span>
            </label>
          </div>

          {/* URL Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 mb-1">Target URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm text-gray-700 font-mono break-all">
                {getQRValue()}
              </code>
              <button
                onClick={copyURL}
                className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Preview</h2>
          
          <div className="flex flex-col items-center">
            {/* QR Code Preview */}
            <div 
              ref={qrRef}
              className="mb-6 p-4 bg-gray-50 rounded-lg"
              style={{ backgroundColor: config.bgColor }}
            >
              <QRCodeCanvas
                value={getQRValue()}
                size={Math.min(config.size, 300)}
                bgColor={config.bgColor}
                fgColor={config.fgColor}
                level="H"
                includeMargin={true}
                imageSettings={config.includeImage ? {
                  src: '/icon-192x192.png',
                  height: 48,
                  width: 48,
                  excavate: true,
                } : undefined}
              />
            </div>

            {/* Service Info */}
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-gray-900 mb-1">
                {services.find(s => s.value === config.service)?.emoji} Quick Book{' '}
                {services.find(s => s.value === config.service)?.label}
              </p>
              <p className="text-sm text-gray-600">
                Scan to instantly book service
              </p>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQR}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Usage Instructions</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>iOS Users:</strong> Scanning will open the App Clip for instant booking</p>
          <p>• <strong>Android Users:</strong> Scanning will open the mobile-optimized web experience</p>
          <p>• <strong>Billboard Size:</strong> Use 1024px for large format printing</p>
          <p>• <strong>Flyer Size:</strong> 256px or 512px works well for printed materials</p>
          <p>• <strong>Best Practice:</strong> Test the QR code with both iOS and Android devices before printing</p>
        </div>
      </div>
    </div>
  );
}