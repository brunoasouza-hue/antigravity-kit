import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/login');
        } catch (err) {
            setError('Erro ao criar conta. Tente outro e-mail.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <img src="/logo.png" alt="ZenTask Logo" style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', display: 'block' }} />
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg, var(--primary), #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                        ZenTask
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Comece sua jornada hoje</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Nome de usuário</label>
                        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu nome" required />
                    </div>
                    <div style={{ marginBottom: '1.2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplo@email.com" required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                    </div>
                    {error && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }}>Criar conta</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Já tem uma conta? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Fazer login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
