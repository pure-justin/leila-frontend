import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { geminiAI, VisionAnalysis } from '@/services/geminiAI';
import { Camera, Upload, Loader2, AlertCircle, DollarSign, Clock } from 'lucide-react';

interface VisionAnalyzerProps {
  onAnalysisComplete: (analysis: VisionAnalysis, imageUrl: string) => void;
  onServiceSelect: (service: string) => void;
}

export const VisionAnalyzer: React.FC<VisionAnalyzerProps> = ({
  onAnalysisComplete,
  onServiceSelect
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<VisionAnalysis | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageCapture = useCallback(async (file: File | string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      let imageBase64: string;
      
      if (typeof file === 'string') {
        // Already base64
        imageBase64 = file;
        setImagePreview(file);
      } else {
        // Convert file to base64
        const reader = new FileReader();
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        setImagePreview(imageBase64);
      }

      // Analyze with Gemini Vision
      const result = await geminiAI.analyzeImage(imageBase64);
      setAnalysis(result);
      onAnalysisComplete(result, imageBase64);
      
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Vision analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onAnalysisComplete]);

  const captureFromCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      await new Promise(resolve => {
        video.onloadedmetadata = resolve;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      
      const imageData = canvas.toDataURL('image/jpeg');
      handleImageCapture(imageData);
      
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
    }
  }, [handleImageCapture]);

  const urgencyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">AI Damage Assessment</h2>
          <p className="text-blue-100">
            Take a photo of the issue for instant analysis and cost estimation
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {!imagePreview ? (
            // Capture Options
            <div className="space-y-4">
              <button
                onClick={captureFromCamera}
                className="w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Camera className="w-6 h-6 text-gray-600" />
                <span className="text-lg font-medium">Take Photo</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <label className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-gray-600" />
                <span className="text-lg font-medium">Upload Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageCapture(file);
                  }}
                />
              </label>
            </div>
          ) : (
            // Analysis Results
            <div className="space-y-6">
              {/* Image Preview */}
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={imagePreview} 
                  alt="Damage" 
                  className="w-full h-64 object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-2" />
                      <p className="text-lg">Analyzing damage...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Results */}
              <AnimatePresence>
                {analysis && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Urgency Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Urgency Level</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${urgencyColors[analysis.urgency]}`}>
                        {analysis.urgency.toUpperCase()}
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Assessment</h3>
                      <p className="text-gray-700">{analysis.description}</p>
                    </div>

                    {/* Issues Found */}
                    {analysis.issues.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-orange-500" />
                          Issues Detected
                        </h3>
                        <ul className="list-disc list-inside space-y-1">
                          {analysis.issues.map((issue, index) => (
                            <li key={index} className="text-gray-700">{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cost Estimate */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900 flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          Estimated Cost
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${analysis.estimatedCost.min} - ${analysis.estimatedCost.max}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        * Final cost depends on specific contractor and extent of work
                      </p>
                    </div>

                    {/* Suggested Services */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Recommended Services</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {analysis.suggestedServices.map((service, index) => (
                          <button
                            key={index}
                            onClick={() => onServiceSelect(service)}
                            className="p-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                          >
                            Book {service}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => {
                          setImagePreview(null);
                          setAnalysis(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Analyze Another
                      </button>
                      <button
                        onClick={() => onServiceSelect(analysis.suggestedServices[0])}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Book Service Now
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error State */}
              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                  <p className="font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};