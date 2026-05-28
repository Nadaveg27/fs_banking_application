import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';
import api from '@/api/axios';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const { setUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setError('Verification link is missing a token.');
            return;
        }

        api.get(`/auth/verify?token=${token}`)
            .then(res => {
                setUser(res.data.user);
                navigate('/dashboard');
            })
            .catch(err => {
                setError(err.response?.data?.message || 'Verification failed.');
            });
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
            {error ? (
                <Typography sx={{ color: '#FF6B6B', fontSize: '1rem' }}>
                    {error}
                </Typography>
            ) : (
                <>
                    <CircularProgress sx={{ color: '#FFFFFF' }} />
                    <Typography sx={{ color: '#8899BB', fontSize: '0.875rem' }}>
                        Verifying your account...
                    </Typography>
                </>
            )}
        </Box>
    );
}