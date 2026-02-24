import { prisma } from "@/lib/prisma";

async function main() {
    // Limpar dados existentes
    await prisma.studyLogs.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.user.deleteMany();

    // Criar usuários
    const user1 = await prisma.user.create({
        data: {
            email: 'joao@example.com',
            name: 'João Silva',
        },
    });

    const user2 = await prisma.user.create({
        data: {
            email: 'maria@example.com',
            name: 'Maria Santos',
        },
    });

    // Criar disciplinas - user1
    const math = await prisma.subject.create({
        data: {
            name: 'Matemática',
            color: '#FF6B6B',
            userId: user1.id,
        },
    });

    const physics = await prisma.subject.create({
        data: {
            name: 'Física',
            color: '#4ECDC4',
            userId: user1.id,
        },
    });

    const programming = await prisma.subject.create({
        data: {
            name: 'Programação',
            color: '#45B7D1',
            userId: user1.id,
        },
    });

    // Criar disciplina - user2
    const history = await prisma.subject.create({
        data: {
            name: 'História',
            color: '#F7DC6F',
            userId: user2.id,
        },
    });

    // Criar tópicos
    const algebra = await prisma.topic.create({
        data: {
            name: 'Álgebra Linear',
            subjectId: math.id,
        },
    });

    const geometry = await prisma.topic.create({
        data: {
            name: 'Geometria',
            subjectId: math.id,
        },
    });

    const mechanics = await prisma.topic.create({
        data: {
            name: 'Mecânica',
            subjectId: physics.id,
        },
    });

    const typescript = await prisma.topic.create({
        data: {
            name: 'TypeScript',
            subjectId: programming.id,
        },
    });

    const react = await prisma.topic.create({
        data: {
            name: 'React',
            subjectId: programming.id,
        },
    });

    // Tópico - user2
    const brazilHistory = await prisma.topic.create({
        data: {
            name: 'História do Brasil',
            subjectId: history.id,
        },
    });

    // Criar registros de estudo
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.studyLogs.create({
        data: {
            study_date: yesterday,
            start_time: new Date(yesterday.setHours(9, 0, 0, 0)),
            end_time: new Date(yesterday.setHours(10, 30, 0, 0)),
            duration_minutes: 90,
            notes: 'Revisei os conceitos fundamentais de álgebra linear',
            topicId: algebra.id,
        },
    });

    await prisma.studyLogs.create({
        data: {
            study_date: yesterday,
            start_time: new Date(yesterday.setHours(11, 0, 0, 0)),
            end_time: new Date(yesterday.setHours(12, 15, 0, 0)),
            duration_minutes: 75,
            notes: 'Pratiquei exercícios de geometria analítica',
            topicId: geometry.id,
        },
    });

    await prisma.studyLogs.create({
        data: {
            study_date: today,
            start_time: new Date(today.setHours(13, 0, 0, 0)),
            end_time: new Date(today.setHours(14, 30, 0, 0)),
            duration_minutes: 90,
            notes: 'Estudei as leis de Newton e seus aplicativos',
            topicId: mechanics.id,
        },
    });


    await prisma.studyLogs.create({
        data: {
            study_date: today,
            start_time: new Date(today.setHours(14, 0, 0, 0)),
            end_time: new Date(today.setHours(15, 45, 0, 0)),
            duration_minutes: 105,
            notes: 'Estudei sobre tipos genéricos em TypeScript',
            topicId: typescript.id,
        },
    });

    await prisma.studyLogs.create({
        data: {
            study_date: today,
            start_time: new Date(today.setHours(16, 0, 0, 0)),
            end_time: new Date(today.setHours(17, 30, 0, 0)),
            duration_minutes: 90,
            notes: 'Praticava hooks em React',
            topicId: react.id,
        },
    });

    // StudyLog - user2
    await prisma.studyLogs.create({
        data: {
            study_date: today,
            start_time: new Date(today.setHours(9, 0, 0, 0)),
            end_time: new Date(today.setHours(10, 0, 0, 0)),
            duration_minutes: 60,
            notes: 'Linhas gerais do período colonial',
            topicId: brazilHistory.id,
        },
    });

    console.log('✅ Database seeded successfully!');
    console.log(`
  Created:
  - 2 Users (João - user1, Maria - user2)
  - 4 Subjects (Matemática, Física, Programação → user1 | História → user2)
  - 6 Topics
  - 6 Study Logs
  `);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
