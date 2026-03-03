import { prisma } from "@/lib/prisma";
import { IMPORT_SUBJECT, IMPORT_TOPICS } from "./migrations/importDta";

const USER_ID = "440d0b38-58e0-4a56-9f37-96932cfbe3e1"; // ID fixo para o usuário padrão
async function main() {
    // Limpar dados existentes
    await prisma.studyLogs.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuário padrão
    const userProd = await prisma.user.create({
        data: {
            email: 'usuario@example.com',
            name: 'Usuário Padrão',
        },
    });

    const userTeste = await prisma.user.create({
        data: {
            email: 'teste@teste.com',
            name: 'Usuário Teste',
        },
    });


    const subjectsCreated = [];
    // Importar disciplinas
    for (const subject of IMPORT_SUBJECT) {
        const createdSubject = await prisma.subject.create({
            data: {
                id: subject.id,
                name: subject.name,
                color: subject.color,
                userId: userProd.id,
            },
        });
        subjectsCreated.push(createdSubject);
    }

    // Importar tópicos
    for (const topic of IMPORT_TOPICS) {
        await prisma.topic.create({
            data: {
                id: topic.id,
                name: topic.name,
                subjectId: topic.subjectId || topic.subject_id!, // Usar subjectId do tópico ou tentar encontrar pelo nome
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