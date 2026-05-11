import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
    LayoutDashboard, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Plus, 
    LogOut,
    CheckSquare,
    List,
    Tag,
    Briefcase,
    Home,
    GraduationCap,
    X
} from 'lucide-react';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            padding: '16px 24px',
            borderRadius: '12px',
            background: type === 'success' ? 'var(--success)' : 'var(--danger)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            animation: 'slideIn 0.3s ease-out'
        }}>
            {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontWeight: '500' }}>{message}</span>
            <button onClick={onClose} style={{ background: 'transparent', color: 'white', padding: '0', display: 'flex' }}>
                <X size={18} />
            </button>
        </div>
    );
};

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({ total: 0, completedToday: 0, overdue: 0, pending: 0 });
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [toast, setToast] = useState(null);
    const [filter, setFilter] = useState({ type: 'all', value: null }); // all, category, status

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, tasksRes] = await Promise.all([
                axios.get('http://localhost:5000/api/tasks/stats'),
                axios.get('http://localhost:5000/api/tasks')
            ]);
            setStats(statsRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
            showToast('Erro ao carregar dados. Verifique a conexão.', 'error');
        }
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleAddTask = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask || taskData.id) {
                const id = editingTask?.id || taskData.id;
                await axios.put(`http://localhost:5000/api/tasks/${id}`, taskData);
                showToast('Tarefa atualizada com sucesso!');
            } else {
                await axios.post('http://localhost:5000/api/tasks', taskData);
                showToast('Tarefa criada com sucesso!');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error saving task', err);
            showToast('Erro ao salvar tarefa.', 'error');
        }
    };

    const handleDeleteTask = async (id) => {
        if (window.confirm('Deseja excluir esta tarefa permanentemente?')) {
            try {
                await axios.delete(`http://localhost:5000/api/tasks/${id}`);
                showToast('Tarefa excluída com sucesso!');
                fetchData();
            } catch (err) {
                console.error('Error deleting task', err);
                showToast('Erro ao excluir tarefa.', 'error');
            }
        }
    };

    const filteredTasks = tasks.filter(task => {
        if (filter.type === 'all') return true;
        if (filter.type === 'category') return task.category === filter.value;
        if (filter.type === 'status') return task.status === filter.value;
        if (filter.type === 'overdue') {
            const today = new Date().toISOString().split('T')[0];
            return task.status !== 'done' && task.due_date < today;
        }
        if (filter.type === 'completedToday') {
            const today = new Date().toISOString().split('T')[0];
            return task.status === 'done' && task.due_date === today;
        }
        return true;
    });

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            {/* Sidebar */}
            <aside className="glass-card" style={{ width: '280px', margin: '16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                <div style={{ padding: '32px 24px', borderBottom: '1px solid var(--border)', marginBottom: '20px', textAlign: 'center' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="/logo.png" alt="ZenTask Logo" style={{ width: '60px', height: '60px', marginBottom: '12px' }} />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ZenTask
                        </h2>
                    </Link>
                </div>

                <nav style={{ flex: 1, padding: '0 16px' }}>
                    <ul style={{ listStyle: 'none' }}>
                        <li 
                            onClick={() => setFilter({ type: 'all', value: null })}
                            style={{ 
                                padding: '14px 16px', 
                                borderRadius: '12px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                background: filter.type === 'all' ? 'var(--primary)' : 'transparent', 
                                color: filter.type === 'all' ? 'white' : 'var(--text-muted)', 
                                cursor: 'pointer', 
                                marginBottom: '8px',
                                boxShadow: filter.type === 'all' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                                transition: 'all 0.2s'
                            }}
                        >
                            <LayoutDashboard size={20} />
                            <span style={{ fontWeight: filter.type === 'all' ? '600' : '400' }}>Dashboard</span>
                        </li>
                        <li 
                            className="nav-item-hover" 
                            onClick={() => setFilter({ type: 'all', value: null })}
                            style={{ padding: '14px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '8px' }}
                        >
                            <List size={20} />
                            <span>Minhas Tarefas</span>
                        </li>
                        <li className="nav-item-hover" style={{ padding: '14px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '8px' }}>
                            <Tag size={20} />
                            <span>Tags</span>
                        </li>
                    </ul>

                    <div style={{ padding: '24px 16px 8px' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Categorias</p>
                        <ul style={{ listStyle: 'none' }}>
                            <li className="nav-item-hover" onClick={() => setFilter({ type: 'category', value: 'Trabalho' })} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: filter.value === 'Trabalho' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter.value === 'Trabalho' ? '700' : '400' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div> Trabalho
                            </li>
                            <li className="nav-item-hover" onClick={() => setFilter({ type: 'category', value: 'Casa' })} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: filter.value === 'Casa' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter.value === 'Casa' ? '700' : '400' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Casa
                            </li>
                            <li className="nav-item-hover" onClick={() => setFilter({ type: 'category', value: 'Estudos' })} style={{ padding: '10px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', color: filter.value === 'Estudos' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter.value === 'Estudos' ? '700' : '400' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div> Estudos
                            </li>
                        </ul>
                    </div>
                </nav>

                <div style={{ padding: '24px', borderTop: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0 0 24px 24px' }}>
                    <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--primary)', padding: '2px' }}>
                            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <p style={{ fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Premium User ✨</p>
                        </div>
                    </Link>
                    <button onClick={logout} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s' }}>
                        <LogOut size={18} /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '32px 32px 32px 16px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>Olá, {user?.username}! 👋</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '4px' }}>Mantenha o foco e conquiste seus objetivos hoje.</p>
                    </div>
                    <button onClick={handleAddTask} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 24px', borderRadius: '16px', fontSize: '1rem' }}>
                        <Plus size={22} strokeWidth={2.5} /> <span style={{ fontWeight: '700' }}>Nova Tarefa</span>
                    </button>
                </header>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="glass-card stat-card" onClick={() => setFilter({ type: 'all', value: null })} style={{ borderLeft: '5px solid var(--primary)', transition: 'all 0.2s', cursor: 'pointer', transform: filter.type === 'all' ? 'scale(1.02)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Total de Tarefas</p>
                                <h3 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '8px' }}>{stats.total}</h3>
                            </div>
                            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px', borderRadius: '14px' }}>
                                <LayoutDashboard size={28} color="var(--primary)" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card stat-card" onClick={() => setFilter({ type: 'completedToday', value: null })} style={{ borderLeft: '5px solid var(--success)', transition: 'all 0.2s', cursor: 'pointer', transform: filter.type === 'completedToday' ? 'scale(1.02)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Concluídas Hoje</p>
                                <h3 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '8px' }}>{stats.completedToday}</h3>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '14px' }}>
                                <CheckCircle size={28} color="var(--success)" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card stat-card" onClick={() => setFilter({ type: 'status', value: 'doing' })} style={{ borderLeft: '5px solid var(--warning)', transition: 'all 0.2s', cursor: 'pointer', transform: filter.value === 'doing' ? 'scale(1.02)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Em Progresso</p>
                                <h3 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '8px' }}>{stats.pending}</h3>
                            </div>
                            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '14px' }}>
                                <Clock size={28} color="var(--warning)" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card stat-card" onClick={() => setFilter({ type: 'overdue', value: null })} style={{ borderLeft: '5px solid var(--danger)', transition: 'all 0.2s', cursor: 'pointer', transform: filter.type === 'overdue' ? 'scale(1.02)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>Atrasadas</p>
                                <h3 style={{ fontSize: '2.2rem', fontWeight: '800', marginTop: '8px' }}>{stats.overdue}</h3>
                            </div>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '14px' }}>
                                <AlertCircle size={28} color="var(--danger)" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kanban Board */}
                <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <CheckSquare size={24} color="var(--primary)" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Fluxo de Trabalho</h2>
                    </div>
                    <KanbanBoard tasks={filteredTasks} onEdit={handleEditTask} onDelete={handleDeleteTask} onStatusChange={handleSaveTask} />
                </div>
            </main>

            {isModalOpen && (
                <TaskModal 
                    task={editingTask} 
                    onClose={() => setIsModalOpen(false)} 
                    onSave={handleSaveTask} 
                />
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .nav-item-hover:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--text) !important;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;

