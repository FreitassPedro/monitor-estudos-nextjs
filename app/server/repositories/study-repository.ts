export async function getSubjects() {

    // Simula banco
    return [
        {
            id: "s1",
            name: "Math",
            topics: [
                {
                    id: "t1",
                    name: "Algebra",
                    topicLogs: [
                        { id: "l1", duration: 30 },
                        { id: "l2", duration: 50 }
                    ]
                }
            ]
        }
    ];
}