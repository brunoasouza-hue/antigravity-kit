import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TaskModal = ({ task, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        due_date: '',
        priority: 'medium',
        category: 'Trabalho',
        status: 'todo',
        tags: []
    });
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                due_date: task.due_date ? task.due_date.split('T')[0] : '',
                priority: task.priority || 'medium',
                category: task.category || 'Trabalho',
                status: task.status || 'todo',
                tags: task.tags || []
            });
        }
    }, [task]);

    const handleAddTag = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            setError('O título da tarefa é obrigatório!');
            return;
        }
        setError('');
        onSave(formData);
    };

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
                    <X size={24} style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Título</label>
                        <input 
                            type="text" 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            placeholder="O que precisa ser feito?" 
                            required 
                            style={{ borderColor: error ? 'var(--danger)' : 'var(--border)' }}
                        />
                        {error && <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '4px' }}>{error}</p>}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Descrição</label>
                        <textarea 
                            rows="3"
                            value={formData.description} 
                            onChange={(e) => setFormData({...formData, description: e.target.value})} 
                            placeholder="Adicione mais detalhes..." 
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Prioridade</label>
                        <select 
                            value={formData.priority} 
                            onChange={(e) => setFormData({...formData, priority: e.target.value})}
                        >
                            <option value="low">Baixa</option>
                            <option value="medium">Média</option>
                            <option value="high">Alta</option>
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Data Limite</label>
                            <input 
                                type="date" 
                                value={formData.due_date} 
                                onChange={(e) => setFormData({...formData, due_date: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Categoria</label>
                            <select 
                                value={formData.category} 
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option value="Trabalho">Trabalho</option>
                                <option value="Pessoal">Pessoal</option>
                                <option value="Estudos">Estudos</option>
                                <option value="Casa">Casa</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Status</label>
                            <select 
                                value={formData.status} 
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="todo">A Fazer</option>
                                <option value="doing">Fazendo</option>
                                <option value="done">Concluído</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Tags (Pressione Enter)</label>
                        <input 
                            type="text" 
                            value={tagInput} 
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            placeholder="Adicionar tag..." 
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {formData.tags.map(tag => (
                                <span key={tag} style={{ 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    padding: '4px 10px', 
                                    borderRadius: '20px', 
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    {tag}
                                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeTag(tag)} />
                                </span>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} style={{ flex: 1, background: 'var(--border)', color: 'white' }}>Cancelar</button>
                        <button type="submit" className="btn-primary" style={{ flex: 2 }}>Salvar Tarefa</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
