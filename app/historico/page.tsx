import { Suspense } from "react";

import { Loader2 } from "lucide-react";
import { HistoryContent } from "./HistoryContent";



export default function History() {

  return (
    <div className="space-y-6 pb-8">
      <Suspense fallback={<div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" /> Carregando opções de data...</div>}>
        <HistoryContent />
      </Suspense>
    </div>
  );
};