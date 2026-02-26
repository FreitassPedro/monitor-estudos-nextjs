import { Suspense } from "react";

import { Loader2 } from "lucide-react";
import { HistoryContent } from "./HistoryContent";



export default function History() {

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Histórico de Estudos</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Acompanhe sua evolução e analise seu desempenho
        </p>
      </div>

      <Suspense fallback={<div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" /> Carregando opções de data...</div>}>
        <HistoryContent />
      </Suspense>
    </div>
  );
};