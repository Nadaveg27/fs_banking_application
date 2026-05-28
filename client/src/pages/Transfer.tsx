import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import api from '@/api/axios';
import { useAuth } from '@/context/AuthContext';

export default function Transfer() {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [transferred, setTransferred] = useState<{ amount: number; recipientEmail: string; newBalance: number } | null>(null);
    const { user, setUser } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid amount.');
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/transactions', {
                recipientEmail,
                amount: parsedAmount,
                reason: reason || undefined,
            });
            setTransferred({
                amount: parsedAmount,
                recipientEmail,
                newBalance: res.data.newBalance,
            });
            if (user) {
                setUser({ ...user, balance: res.data.newBalance });
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Transfer failed');
        } finally {
            setLoading(false);
        }
    };

    if (transferred) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Box component="header" sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: '2px', height: 32, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            Maccabim Bank
                        </Typography>
                    </Box>
                </Box>

                <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                    <Box sx={{ width: '100%', maxWidth: 448, textAlign: 'center' }}>
                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(107,255,158,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                            <CheckCircleOutlineIcon sx={{ color: '#6BFF9E', fontSize: '2.5rem' }} />
                        </Box>

                        <Typography variant="h1" sx={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 700, mb: 1.5 }}>
                            Transfer Complete
                        </Typography>
                        <Box sx={{ width: 64, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', mb: 3, mx: 'auto' }} />

                        <Box sx={{ backgroundColor: '#152550', p: 4, mb: 4, textAlign: 'left' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography sx={{ color: '#8899BB', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Amount Sent</Typography>
                                <Typography sx={{ color: '#FF6B6B', fontWeight: 700 }}>-${transferred.amount.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography sx={{ color: '#8899BB', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recipient</Typography>
                                <Typography sx={{ color: '#FFFFFF', fontSize: '0.875rem' }}>{transferred.recipientEmail}</Typography>
                            </Box>
                            <Box sx={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography sx={{ color: '#8899BB', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>New Balance</Typography>
                                <Typography sx={{ color: '#FFFFFF', fontWeight: 700 }}>${transferred.newBalance.toFixed(2)}</Typography>
                            </Box>
                        </Box>

                        <Button fullWidth onClick={() => navigate('/dashboard')} sx={{ py: 1.5 }}>
                            Back to Dashboard
                        </Button>
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

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box component="header" sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: '2px', height: 32, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                    <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.125rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Maccabim Bank
                    </Typography>
                </Box>
            </Box>

            <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
                <Box sx={{ width: '100%', maxWidth: 448 }}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h1" sx={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 700, mb: 1.5 }}>
                            Make a Transfer
                        </Typography>
                        <Box sx={{ width: 64, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', mb: 1.5 }} />
                        <Typography sx={{ color: '#8899BB', fontSize: '0.8rem' }}>
                            Transfer funds to another Maccabim Bank account
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 0 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            label="Recipient Email"
                            type="email"
                            value={recipientEmail}
                            onChange={e => setRecipientEmail(e.target.value)}
                            placeholder="Enter recipient's email address"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Amount"
                            type="text"
                            value={amount}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                    setAmount(val);
                                }
                            }}
                            placeholder="Enter amount"
                            required
                            fullWidth
                        />
                        <TextField
                            label="Reason (Optional)"
                            type="text"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="What's this transfer for?"
                            fullWidth
                        />
                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            sx={{ py: 1.5 }}
                        >
                            {loading ? 'Sending...' : 'Submit Transfer'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="text"
                                onClick={() => navigate('/dashboard')}
                                sx={{
                                    color: '#6677AA',
                                    textDecoration: 'underline',
                                    fontSize: '0.875rem',
                                    background: 'none',
                                    border: 'none',
                                    borderBottom: 'none',
                                    '&:hover': { background: 'none', textDecoration: 'underline' },
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
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