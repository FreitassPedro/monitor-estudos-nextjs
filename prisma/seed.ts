import { prisma } from "@/lib/prisma";
import { IMPORT_STUDYLOGS } from "./migrations/importDta";
import { parseDateAsLocal } from "@/lib/utils";

async function main() {
    await prisma.studyLogs.deleteMany(); // Limpa os dados existentes para evitar duplicatas
  
    for (const studylog of IMPORT_STUDYLOGS) {
        if (!studylog.topic_id) {
            continue;
        }

        await prisma.studyLogs.create({
            data: {
                id: studylog.id,
                topicId: studylog.topic_id,
                study_date: parseDateAsLocal(studylog.study_date),
                start_time: new Date(studylog.start_time),
                end_time: new Date(studylog.end_time),
                duration_minutes: studylog.duration_minutes,
                notes: studylog.notes ?? null,
                created_at: new Date(studylog.created_at),
                updated_at: new Date(studylog.updated_at),
            },
        });
    }

    console.log('✅ Database seeded successfully with imported data!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });