import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import api from '@/api/axios';
import MaccabimLogo from '@/components/MaccabimLogo';

export default function Registration() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/auth/register', { name, email, password, phone });
            navigate('/check-email');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box component="header" sx={{ p: 4 }}>
                <MaccabimLogo />
            </Box>

            <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 380 }}>
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h1" sx={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 700 }}>
                            Create Account
                        </Typography>
                        <Box sx={{ width: 64, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', mt: 2, mb: 2 }} />
                        <Typography sx={{ color: '#8899BB', fontSize: '0.8rem' }}>
                            Join Maccabim Bank today
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Name"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Phone Number"
                            type="tel"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Create a password"
                            required
                            fullWidth
                        />
                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            sx={{ py: 1.5, mt: 1 }}
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </Box>

                    <Typography sx={{ textAlign: 'center', mt: 5, color: '#6677AA', fontSize: '0.875rem' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#FFFFFF' }}>
                            Sign In
                        </Link>
                    </Typography>
                </Box>
            </Box>

            <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
                <Typography sx={{ color: '#334466', fontSize: '0.75rem' }}>
                    © 2026 Maccabim Bank. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
}