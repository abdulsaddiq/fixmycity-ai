import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { UploadZone } from "@/components/UploadZone";
import { ResultsPanel } from "@/components/ResultsPanel";
import { MapPanel } from "@/components/MapPanel";
import { CommunityFeed } from "@/components/CommunityFeed";
import { useAnalyzeImage, useCreateReport } from "@/hooks/use-reports";
import { Activity, Sparkles, MapPin, CheckCircle } from "lucide-react";
import type { AnalyzeImageResponse } from "@shared/routes";

export default function Home() {
  const [base64Image, setBase64Image] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalyzeImageResponse | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Map Pin, 3: Success

  const analyzeMutation = useAnalyzeImage();
  const createMutation = useCreateReport();

  const handleImageSelect = async (base64: string) => {
    setBase64Image(base64);
    if (base64) {
      setStep(1);
      try {
        const result = await analyzeMutation.mutateAsync(base64);
        setAnalysis(result);
      } catch (err) {
        console.error(err);
      }
    } else {
      setAnalysis(null);
    }
  };

  const handleProceedToMap = () => {
    setStep(2);
    // Smooth scroll to map on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!base64Image || !analysis) return;
    
    try {
      await createMutation.mutateAsync({
        imageUrl: base64Image,
        latitude: location?.lat.toString(),
        longitude: location?.lng.toString(),
      });
      setStep(3);
      
      // Reset after success
      setTimeout(() => {
        setBase64Image("");
        setAnalysis(null);
        setLocation(null);
        setStep(1);
      }, 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-x-hidden">
      {/* Background glow effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 lg:py-12 z-10">
        
        {/* Hero Section */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" /> AI-Powered Civic OS
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-white mb-4 leading-tight">
            See a city problem? <br/>
            <span className="text-gradient">Let AI analyze it instantly.</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload a photo of a pothole, broken light, or graffiti. Our AI generates a comprehensive report for city officials.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left Column: Action Flow */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            {step === 1 && (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
                  <h2 className="text-xl font-display text-white">Upload Evidence</h2>
                </div>
                <UploadZone 
                  onImageSelect={handleImageSelect} 
                  isAnalyzing={analyzeMutation.isPending} 
                />
                
                {analysis && (
                  <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ResultsPanel data={analysis} />
                    <button 
                      onClick={handleProceedToMap}
                      className="w-full mt-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-orange-400 text-white glow-orange hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-5 h-5" /> Add Location to Submit
                    </button>
                  </div>
                )}
              </>
            )}

            {step === 2 && analysis && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">2</div>
                  <h2 className="text-xl font-display text-white">Drop a Pin</h2>
                </div>
                
                <div className="glass-panel p-6 rounded-2xl border-primary/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5"></div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" /> Ready to Submit
                    </h3>
                    <p className="text-sm text-slate-300 mb-6">
                      Click the map on the right to set the exact location of the issue. Then submit the report.
                    </p>
                    
                    <button 
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || !location}
                      className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-primary to-orange-400 text-white glow-orange hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:scale-100 disabled:hover:scale-100 flex items-center justify-center gap-2"
                    >
                      {createMutation.isPending ? "Submitting..." : "Submit Civic Report"}
                    </button>
                    
                    {!location && (
                      <p className="text-xs text-center text-primary mt-3 font-medium animate-pulse">
                        * Please drop a pin on the map first
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 border-green-500/30">
                <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">Report Submitted!</h3>
                <p className="text-muted-foreground">
                  Thank you for keeping your city safe. The relevant authorities have been notified.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Context & Community */}
          <div className="xl:col-span-8 flex flex-col gap-8">
            <MapPanel 
              reports={[]} // We will fetch these from a hook
              selectedLocation={location}
              onLocationSelect={setLocation}
              isSelecting={step === 2}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display text-white">Community Feed</h2>
                <span className="text-sm font-medium text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10">Live Updates</span>
              </div>
              <CommunityFeed />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
