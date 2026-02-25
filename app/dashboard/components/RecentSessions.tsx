import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getTodayStudyLogsAction } from '@/server/actions/studyLogs.action';
import { BookOpen, Clock, FileText, Trash2 } from 'lucide-react';

export const StudyLogItemResume = ({
    log,
}: {
    log: {
        id: string;
        start_time: string | Date;
        end_time: Date | string;
        notes?: string | null;
        duration_minutes: number;
        topic: {
            id: string;
            name: string;
            subject: {
                id: string;
                name: string;
                color: string;
            };
        };
    };
}) => {

    const subject = log.topic.subject;
    const topic = log.topic;

    return (
        <div className="group flex items-start gap-4 p-4 bg-card border border-border/40 hover:border-border rounded-lg transition-all hover:shadow-sm">
            {/* Indicador de Cor do Assunto */}
            <div
                className="w-1.5 h-full min-h-[3rem] rounded-full shrink-0"
                style={{ backgroundColor: subject?.color || '#ccc' }}
            />

            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-foreground truncate">
                        {subject?.name}
                        <span className="mx-2 text-muted-foreground font-normal" aria-hidden="true">—</span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground font-normal">
                            <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            {topic?.name}
                        </span>
                    </h4>
                    <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded">
                        {new Date(log.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(log.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>


                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    <span className="font-medium">Notas:</span> {log?.notes ?? "Sem anotações para esta sessão."}
                </p>

                <div className="flex items-center gap-3 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-normal bg-secondary/50 px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {log.duration_minutes} min
                    </span>
                </div>
            </div>

            {/* Ações (Só aparecem no hover em desktop, ou sempre visíveis em mobile) */}
            <div className="flex gap-1 opacity-100  sm:opacity-30 sm:group-hover:opacity-100 transition-opacity">
                {log?.notes && (
                    <Button size="icon" variant="ghost" title="Ver anotações">
                        <FileText className="w-4 h-4 text-blue-500" />
                    </Button>
                )}
                <Button size="icon" variant="ghost" title="Excluir">
                    <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
            </div>
        </div>
    );
};
const userId = "8e4fba66-4d2e-4bb6-8200-c45db7a92f8e"

export async function RecentSessions() {

    const todayLogs = await getTodayStudyLogsAction(userId);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Sessões de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
                {todayLogs.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4 text-center">
                        Nenhuma sessão registrada hoje
                    </p>
                ) : (
                    <div className="space-y-3">
                        {todayLogs.slice(0, 4).map((log) => (
                            <StudyLogItemResume key={log.id} log={log} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
