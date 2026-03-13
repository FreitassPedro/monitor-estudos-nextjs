import { prisma } from "@/lib/prisma";

async function main() {

    const user = await prisma.user.create({
        data: {
            name: 'Test User',
            email: 'teste@teste.com'
        },
    });

    const subject = await prisma.subject.create({
        data: {
            name: 'Matemática',
            color: '#FF0000',
            userId: user.id,
        },
    });

    const subject2 = await prisma.subject.create({
        data: {
            name: 'Física',
            color: '#00FF00',
            userId: user.id,
        },
    });

    const topic1 = await prisma.topic.create({
        data: {
            name: 'Álgebra',
            subjectId: subject.id,
        },
    });

    const topic2 = await prisma.topic.create({
        data: {
            name: 'Geometria',
            subjectId: subject.id,
        },
    });

    const topic3 = await prisma.topic.create({
        data: {
            name: 'Mecânica',
            subjectId: subject2.id,
        },
    });
    const topic4 = await prisma.topic.create({
        data: {
            name: 'Leis de Newton',
            subjectId: subject2.id,
            parentId: topic3.id,
        },
    });

    await prisma.studyLogs.create({
        data: {
            topicId: topic1.id,
            study_date: new Date(),
            start_time: new Date(),
            end_time: new Date(Date.now() + 60 * 60 * 1000), // +1 hora
            duration_minutes: 60,
            notes: 'Estudo de álgebra',
        },
    });

    console.log('✅ Test database seeded successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });