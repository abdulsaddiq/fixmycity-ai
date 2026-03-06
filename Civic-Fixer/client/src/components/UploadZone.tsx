import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onImageSelect: (base64: string) => void;
  isAnalyzing: boolean;
}

export function UploadZone({ onImageSelect, isAnalyzing }: UploadZoneProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onImageSelect(base64);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: isAnalyzing
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect("");
  };

  return (
    <div className="glass-panel rounded-2xl p-1 overflow-hidden transition-all duration-300 relative group">
      {/* Animated gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-secondary/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl blur-sm -z-10" />
      
      <div 
        {...getRootProps()} 
        className={`relative bg-card rounded-xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center justify-center min-h-[280px] text-center cursor-pointer z-10
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-primary/50 hover:bg-white/5'}
          ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <AnimatePresence mode="wait">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full rounded-lg overflow-hidden flex items-center justify-center"
            >
              <img src={preview} alt="Upload preview" className="max-h-[220px] object-contain rounded-lg shadow-lg" />
              {!isAnalyzing && (
                <button
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`p-4 rounded-full transition-colors duration-300 ${isDragActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted-foreground'}`}>
                {isDragActive ? <UploadCloud className="w-8 h-8" /> : <ImageIcon className="w-8 h-8" />}
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">
                  {isDragActive ? "Drop image here" : "Drag & drop an image"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your device
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-20">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-primary font-medium animate-pulse">AI analyzing city issue...</p>
          </div>
        )}
      </div>
    </div>
  );
}
