import { AlertTriangle, Clock, Building, CheckCircle, Share2, Copy, Download } from "lucide-react";
import { motion } from "framer-motion";
import type { AnalyzeImageResponse } from "@shared/routes";

interface ResultsPanelProps {
  data: AnalyzeImageResponse | null;
}

export function ResultsPanel({ data }: ResultsPanelProps) {
  if (!data) return null;

  const severityColor = 
    data.severity === "High" ? "text-red-500 bg-red-500/10 border-red-500/20" :
    data.severity === "Medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
    "text-green-500 bg-green-500/10 border-green-500/20";

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Civic Issue: ${data.problemType}`,
          text: data.description,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden"
    >
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-display text-white">{data.problemType}</h2>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${severityColor}`}>
              {data.severity} Severity
            </span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            <Building className="w-3.5 h-3.5" /> Authority
          </span>
          <span className="text-white font-medium">{data.authority}</span>
        </div>
        <div className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            <Clock className="w-3.5 h-3.5" /> Est. Fix Time
          </span>
          <span className="text-white font-medium">{data.estimatedFixTime}</span>
        </div>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3 uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 text-primary" /> Community Impact
        </h3>
        <p className="text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
          {data.communityImpact}
        </p>
      </div>

      <div>
        <h3 className="flex items-center gap-2 text-sm font-medium text-white mb-3 uppercase tracking-wider">
          <CheckCircle className="w-4 h-4 text-secondary" /> Recommended Actions
        </h3>
        <ul className="space-y-2">
          {data.actions.map((action, idx) => (
            <li key={idx} className="flex gap-3 text-sm text-slate-300">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-tight pt-0.5">{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-4 border-t border-white/10">
        <button onClick={handleShare} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 border border-white/5">
          <Share2 className="w-4 h-4" /> Share Report
        </button>
        <button onClick={handleCopy} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5" title="Copy to clipboard">
          <Copy className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5" title="Download PDF">
          <Download className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
