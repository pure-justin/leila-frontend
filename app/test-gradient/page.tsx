export default function TestGradient() {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-6xl font-bold mb-8">
        Testing <span className="gradient-text">Gradient Theme</span>
      </h1>
      
      <div className="space-y-4">
        <button className="gradient-button">
          Gradient Button
        </button>
        
        <div className="gradient-card p-8">
          <h2 className="text-2xl font-bold text-white">Gradient Card</h2>
          <p className="text-white/80">This should have animated gradient background</p>
        </div>
        
        <div className="border-gradient p-1">
          <div className="bg-white p-8 rounded-lg">
            <h3 className="text-xl font-bold">Border Gradient</h3>
            <p>This should have an animated gradient border</p>
          </div>
        </div>
        
        <div className="glass p-8 rounded-lg">
          <h3 className="text-xl font-bold">Glass Effect</h3>
          <p>This should have a glassmorphism effect</p>
        </div>
        
        <div className="animate-float w-32 h-32 gradient-primary rounded-full flex items-center justify-center text-white font-bold">
          Float
        </div>
      </div>
      
      <div className="mt-12 p-8 bg-gray-100 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Troubleshooting Info:</h3>
        <p>Time: {new Date().toISOString()}</p>
        <p>If you see gradients above, the theme is working!</p>
        <p>If not, try:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Hard refresh: Cmd + Shift + R</li>
          <li>Open DevTools Network tab and check "Disable cache"</li>
          <li>Try incognito mode</li>
        </ul>
      </div>
    </div>
  );
}