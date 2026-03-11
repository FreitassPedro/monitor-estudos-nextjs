"use client";
import React, { useState, useEffect } from 'react';
import { mockJsonDashboardStats, mockJsonTopicTree, mockStudyLogs } from './mock';

// --- Componentes de Apresentação ---

const TopicNode = ({ topic, onSelectTopic }) => {
    const logs = mockStudyLogs.filter(log => log.topicId === topic.id);

    return (
        <div style={{ marginLeft: '20px', borderLeft: '1px solid #ccc', paddingLeft: '10px' }}>
            <span
                style={{ cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => onSelectTopic(topic.id)}
            >
                📁 {topic.name}
            </span>
            {topic.children.map(child => (
                <TopicNode key={child.id} topic={child} onSelectTopic={onSelectTopic} />
            ))}
        </div>
    );
};

const StatsPanel = ({ stats }) => {

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h2>Estatísticas Gerais</h2>
            <p>Tempo Total: <strong>{stats.totalStudyMinutes} min</strong></p>

            <h3>Top Subjects</h3>
            <ul>
                {stats.topSubjects.map(subject => (
                    <li key={subject.topicId}>
                        {subject.topicName}: {subject.totalMinutes} min
                    </li>
                ))}
            </ul>

            <h3>Logs Recentes</h3>
            <table border="1" width="100%">
                <thead>
                    <tr><th>Data</th><th>Tópico Exato</th><th>Duração (min)</th></tr>
                </thead>
                <tbody>
                    {stats.recentLogs.map(log => (
                        <tr key={log.id}>
                            <td>{log.date}</td>
                            <td>{log.topicName}</td>
                            <td>{log.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const PainelLogs = ({ logs }) => {
    if (logs.length === 0) return <p>Nenhum log encontrado para este tópico.</p>;
    return (
        <div style={{ marginTop: '20px' }}>
            <h2>Logs de Estudo</h2>
            <table border="1" width="100%">
                <thead>
                    <tr><th>Data</th><th>Tópico ID</th><th>Duração (min)</th></tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log.id}>
                            <td>{log.date}</td>
                            <td>{log.topicId}</td>
                            <td>{log.durationMinutes}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Página Principal (Container) ---

export default function StudyMonitorPage() {
    const [folderTree, setFolderTree] = useState([]);
    const [topicTree, setTopicTree] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [selectedTopicId, setSelectedTopicId] = useState(null);

    useEffect(() => {
        // Simula a chamada à API (Spring Boot/Node)
        setTopicTree(mockJsonTopicTree.flatMap(subject => subject.topics));
        setFolderTree(mockJsonTopicTree);

        // Na vida real, a API recebe o selectedTopicId para filtrar
        // Ex: fetch(`/api/stats?topicId=${selectedTopicId || 'all'}`)
        setDashboardStats(mockJsonDashboardStats);
    }, [selectedTopicId]);

    if (!dashboardStats) return <div>Carregando...</div>;

    return (
        <div style={{ display: 'flex', gap: '20px', fontFamily: 'sans-serif' }}>
            {/* Sidebar: Navegação da Árvore */}
            <div style={{ width: '30%', padding: '20px', borderRight: '1px solid #eee' }}>
                <h3>Meus Tópicos</h3>
                <button onClick={() => setSelectedTopicId(null)}>Limpar Filtro</button>
                <div style={{ marginTop: '15px' }}>
                    {folderTree.map(subject => (
                        <div key={subject.subject}>
                            <h4>{subject.subject}</h4>
                            {subject.topics.map(rootTopic => (
                                <TopicNode
                                    key={rootTopic.id}
                                    topic={rootTopic}
                                    onSelectTopic={setSelectedTopicId}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content: Dashboard */}
            <div style={{ width: '70%', padding: '20px' }}>
                <h1>Painel de Estudos</h1>
                {selectedTopicId && <p>Filtrando pelo Tópico ID: {selectedTopicId}</p>}
                <StatsPanel stats={dashboardStats} />
                <PainelLogs logs={mockStudyLogs.filter(log => log.id === selectedTopicId)} />
            </div>
        </div>
    );
}