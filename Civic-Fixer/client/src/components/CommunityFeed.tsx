import { motion } from "framer-motion";
import { ThumbsUp, MapPin, MessageSquare, AlertTriangle } from "lucide-react";
import { useReports, useUpvoteReport } from "@/hooks/use-reports";
import { formatDistanceToNow } from "date-fns";

export function CommunityFeed() {
  const { data: reports, isLoading } = useReports();
  const upvoteMutation = useUpvoteReport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-panel p-5 rounded-2xl animate-pulse flex gap-4">
            <div className="w-24 h-24 bg-white/5 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-white/5 rounded w-1/2"></div>
              <div className="h-4 bg-white/5 rounded w-full"></div>
              <div className="h-4 bg-white/5 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
        <h3 className="text-lg font-medium text-white mb-2">No reports yet</h3>
        <p className="text-sm text-muted-foreground">Be the first to report a civic issue in your city.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {reports.map((report, idx) => {
        const severityColor = 
          report.severity === "High" ? "text-red-500 bg-red-500/10 border-red-500/20" :
          report.severity === "Medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
          "text-green-500 bg-green-500/10 border-green-500/20";

        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={report.id}
            className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-4 hover:bg-card/80 transition-colors border border-white/5"
          >
            <div className="sm:w-32 h-32 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 relative group">
              {report.imageUrl.startsWith('data:') || report.imageUrl.startsWith('http') ? (
                <img src={report.imageUrl} alt={report.problemType} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white text-lg leading-tight">{report.problemType}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${severityColor}`}>
                    {report.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2 mb-2">{report.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {report.authority}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                </div>
                
                <button 
                  onClick={() => upvoteMutation.mutate(report.id)}
                  disabled={upvoteMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm transition-colors disabled:opacity-50"
                >
                  <ThumbsUp className={`w-4 h-4 ${upvoteMutation.isPending ? 'animate-bounce text-primary' : ''}`} />
                  <span className="font-bold">{report.upvotes}</span>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
