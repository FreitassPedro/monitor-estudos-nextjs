"use client";
import React, { useState, useEffect } from 'react';
import { mockJsonDashboardStats, mockJsonTopicTree, mockStudyLogs, TopicNode } from './mock';

const DetailPanel = ({ topicId, onClose }) => {
    const logs = mockStudyLogs.filter(log => log.topicId === topicId);

    return (
        <div className='fixed inset-0 z-40 flex justify-center items-center'>
            <div className="relative w-full max-w-2xl  bg-card rounded-xl px-4 border border-border shadow-2xl">
                <h3>Detalhes do Tópico</h3>
                <div><button onClick={onClose}>Fechar</button></div>
                <div>ID do Tópico: {topicId}</div>
                <p>Logs de Estudo:</p>
                <ul>
                    {logs.map(log => (
                        <li key={log.id}>{log.date}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

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



function NodeRow({ node, level = 0, onOpenDetail }: { node: TopicNode, level?: number, onOpenDetail?: (id: string) => void }) {
    const hasChildren = node.children && node.children.length > 0;
    const [isCollapsed, setIsCollapsed] = useState(false); // Para simplificar, não implementamos colapsar/expandir
    const randomNumber = Math.floor(Math.random() * 3); // Simula pendências aleatórias

    return (
        <>
            <tr className='group hover:bg-secondary'>
                <td>
                    {hasChildren && (
                        <button onClick={() => setIsCollapsed(!isCollapsed)} style={{ cursor: 'pointer' }}>
                            <span style={{ cursor: 'pointer' }}>{isCollapsed ? '🗃' : '📂'}</span>
                        </button>
                    )}
                </td>
                <td style={{ marginLeft: `${level * 10}px`, borderLeft: '1px solid #ccc', paddingLeft: `${level * 12}px` }}>
                    <div style={{ marginLeft: `${level * 10}px`, borderLeft: '1px solid #ccc', paddingLeft: `${level * 12}px` }}>
                        {node.name}
                    </div>
                </td>
                <td className="text-center" >{randomNumber}💭</td>
                <td>
                    <button onClick={() => onOpenDetail?.(node.id)}>
                        {randomNumber}📋
                    </button>
                </td>
            </tr >
            {!isCollapsed && node.children.map(child => (
                <NodeRow key={child.id} node={child} level={level + 1} onOpenDetail={onOpenDetail} />
            ))
            }
        </>
    );
}

// --- Página Principal (Container) ---

export default function StudyMonitorPage() {
    const [folderTree, setFolderTree] = useState<{ id: string; name: string; topics: TopicNode[] }[]>([]);
    const [topicTree, setTopicTree] = useState<TopicNode[]>([]);

    const [detailNode, setDetailNode] = useState<TopicNode | null>(null);


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
        <>
            <div className='min-h-screen mx-auto flex'>
                {/* Sidebar: Navegação da Árvore */}
                <div style={{ width: '30%', padding: '20px', borderRight: '1px solid #eee' }}>
                    <h3>Meus Tópicos</h3>
                    <button onClick={() => setSelectedTopicId(null)}>Limpar Filtro</button>
                    <div style={{ marginTop: '15px' }}>
                        {folderTree.map(subject => (
                            <div key={subject.name}>
                                <h4>{subject.name}</h4>
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
                    {/* Table */}
                    <div style={{ marginTop: '70px' }}>
                        <table border="1" width="100%">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Pendencias</th>
                                    <th>Logs</th>
                                </tr>
                            </thead>
                            <tbody>
                                {folderTree.map(subject => (
                                    <>
                                        <tr key={subject.id}>
                                            <td></td>
                                            <td className='text-lg font-semibold'>
                                                {subject.name}
                                            </td>
                                        </tr>
                                        {subject.topics.map(topic => (
                                            <NodeRow key={topic.id} node={topic} level={1} onOpenDetail={(id) => setDetailNode(topicTree.find(t => t.id === id))} />
                                        ))}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>
            {detailNode && (
                <DetailPanel topicId={detailNode.id} onClose={() => setDetailNode(null)}/>
            )}
        </>
    );
}