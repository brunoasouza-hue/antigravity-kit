import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
    User, 
    Mail, 
    Camera, 
    ArrowLeft, 
    LogOut, 
    CheckCircle,
    Calendar,
    Settings,
    Shield
} from 'lucide-react';

const Profile = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', minHeight: '100vh' }}>
            <Link to="/dashboard" style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--text-muted)', 
                textDecoration: 'none', 
                marginBottom: '32px',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'var(--transition)'
            }} className="hover-link">
                <ArrowLeft size={18} /> Voltar ao Painel
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px', alignItems: 'start' }}>
                {/* Profile Card */}
                <div className="glass-card animate-fade-in" style={{ padding: '40px', textAlign: 'center', position: 'sticky', top: '40px' }}>
                    <div style={{ position: 'relative', width: '150px', height: '150px', margin: '0 auto 24px' }}>
                        <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '30px', 
                            overflow: 'hidden', 
                            border: '4px solid var(--primary)', 
                            background: 'var(--bg)',
                            boxShadow: '0 12px 24px rgba(99, 102, 241, 0.2)'
                        }}>
                            <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <button style={{ 
                            position: 'absolute', 
                            bottom: '-10px', 
                            right: '-10px', 
                            background: 'var(--primary)', 
                            padding: '10px', 
                            borderRadius: '12px', 
                            border: '4px solid var(--bg)',
                            color: 'white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                        }}>
                            <Camera size={18} />
                        </button>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>{user?.username}</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{user?.email}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <Settings size={18} /> Editar Perfil
                        </button>
                        <button onClick={handleLogout} style={{ 
                            width: '100%', 
                            background: 'rgba(244, 63, 94, 0.1)', 
                            color: 'var(--danger)', 
                            border: '1px solid rgba(244, 63, 94, 0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px' 
                        }}>
                            <LogOut size={18} /> Sair da Conta
                        </button>
                    </div>
                </div>

                {/* Info & Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div className="glass-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <User size={20} color="var(--primary)" /> Informações Pessoais
                        </h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <InfoRow label="Nome de Usuário" value={user?.username} />
                            <InfoRow label="E-mail Principal" value={user?.email} />
                            <InfoRow label="Tipo de Conta" value="Usuário Premium" />
                        </div>
                    </div>

                    <div className="glass-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Shield size={20} color="var(--success)" /> Segurança & Privacidade
                        </h2>
                        <div style={{ display: 'grid', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <CheckCircle size={18} color="var(--success)" />
                                    <span>Verificação em Duas Etapas</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: '600' }}>ATIVO</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Calendar size={18} color="var(--text-muted)" />
                                    <span>Último Acesso</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoje, 14:30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</p>
        <p style={{ fontWeight: '500', fontSize: '1rem' }}>{value}</p>
    </div>
);

export default Profile;
