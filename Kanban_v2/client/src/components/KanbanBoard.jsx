import React from 'react';
import { Clock, Tag, MoreVertical, Edit2, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const KanbanBoard = ({ tasks, onEdit, onDelete, onStatusChange }) => {
    const columns = [
        { id: 'todo', title: 'A Fazer', color: 'var(--primary)' },
        { id: 'doing', title: 'Em Progresso', color: 'var(--warning)' },
        { id: 'done', title: 'Concluído', color: 'var(--success)' }
    ];

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'var(--danger)';
            case 'medium': return 'var(--warning)';
            default: return 'var(--success)';
        }
    };

    const handleMove = (task, newStatus) => {
        onStatusChange({ ...task, status: newStatus });
    };
    return (
        <>
            <div className="kanban-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' }}>
                {columns.map(column => (
                    <div key={column.id} className="glass-card" style={{ padding: '16px', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: column.color }}></div>
                                {column.title}
                            </h3>
                            <span style={{ fontSize: '0.8rem', background: 'var(--border)', padding: '2px 8px', borderRadius: '10px' }}>
                                {tasks.filter(t => t.status === column.id).length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {tasks.filter(t => t.status === column.id).map(task => (
                                <div 
                                    key={task.id} 
                                    className="glass-card" 
                                    style={{ 
                                        padding: '16px', 
                                        background: 'var(--card-bg)', 
                                        borderRadius: '12px', 
                                        cursor: 'default',
                                        transition: 'transform 0.2s',
                                        borderLeft: `4px solid ${getPriorityColor(task.priority)}`
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: '700', color: getPriorityColor(task.priority) }}>
                                            {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </span>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Edit2 size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => onEdit(task)} />
                                            <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--danger)' }} onClick={() => onDelete(task.id)} />
                                        </div>
                                    </div>
                                    
                                    <h4 style={{ fontSize: '1rem', marginBottom: '8px', fontWeight: '600' }}>{task.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {task.description}
                                    </p>

                                    {task.tags && task.tags.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                                            {task.tags.map(tag => (
                                                <span key={tag} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: '600' }}>
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            <Clock size={14} />
                                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sem data'}
                                        </div>
                                        
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {column.id !== 'todo' && (
                                                <button 
                                                    onClick={() => handleMove(task, column.id === 'done' ? 'doing' : 'todo')}
                                                    style={{ background: 'var(--border)', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: 'white', transition: 'all 0.2s' }}
                                                    title="Mover para trás"
                                                    className="move-btn"
                                                >
                                                    <ArrowLeft size={14} />
                                                </button>
                                            )}
                                            {column.id !== 'done' && (
                                                <button 
                                                    onClick={() => handleMove(task, column.id === 'todo' ? 'doing' : 'done')}
                                                    style={{ background: 'var(--primary)', padding: '4px', borderRadius: '6px', display: 'flex', alignItems: 'center', color: 'white', transition: 'all 0.2s' }}
                                                    title="Mover para frente"
                                                    className="move-btn"
                                                >
                                                    <ArrowRight size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {task.category && (
                                        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Tag size={12} color="var(--primary)" />
                                            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>{task.category}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <style>{`
                .move-btn:hover {
                    transform: scale(1.1);
                    filter: brightness(1.2);
                }
            `}</style>
        </>
    );
};

export default KanbanBoard;
