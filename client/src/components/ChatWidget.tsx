import { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, IconButton } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import Tooltip from '@mui/material/Tooltip';
import api from '@/api/axios';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

export default function ChatWidget() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
    const threadId = useRef(crypto.randomUUID());
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, open]);

    const send = async (message: string) => {
        setMessages(prev => [...prev, { role: 'user', text: message }]);
        setInput('');
        setLoading(true);
        try {
            const res = await api.post('/assistant/chat', { message, threadId: threadId.current });
            setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
            setAwaitingConfirmation(res.data.awaitingConfirmation ?? false);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', text: 'Something went wrong. Please try again.' }]);
            setAwaitingConfirmation(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || loading) return;
        send(trimmed);
    };

    return (
        <>
            {!open && (
                <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1300 }}>
                    <Button
                        onClick={() => setOpen(true)}
                        startIcon={<ChatBubbleOutlineIcon />}
                        sx={{
                            backgroundColor: '#FFFFFF',
                            color: '#0D1B3E',
                            borderRadius: 0,
                            borderBottom: '4px solid #B8860B',
                            fontWeight: 700,
                            px: 2.5,
                            py: 1,
                            '&:hover': {
                                backgroundColor: '#F5F5F5',
                                borderBottom: '4px solid #E8B824',
                            },
                        }}
                    >
                        AI Assistant
                    </Button>
                </Box>
            )}

            {open && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        width: 360,
                        height: 520,
                        backgroundColor: '#0D1B3E',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 1300,
                        boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.5,
                            backgroundColor: '#152550',
                            borderBottom: '4px solid #B8860B',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ChatBubbleOutlineIcon sx={{ color: '#B8860B', fontSize: '1rem' }} />
                            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.875rem' }}>
                                Maccabim AI Assistant
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Clear chat" placement="bottom">
                                <IconButton
                                    onClick={() => {
                                        setMessages([]);
                                        setAwaitingConfirmation(false);
                                        threadId.current = crypto.randomUUID();
                                    }}
                                    size="small"
                                    sx={{
                                        color: '#8899BB',
                                        '&:hover': { color: '#FFFFFF' },
                                    }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                onClick={() => setOpen(false)}
                                sx={{ color: '#8899BB', p: 0.5, borderRadius: 0 }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages */}
                    <Box
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            px: 2,
                            py: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                        }}
                    >
                        {messages.length === 0 && (
                            <Typography sx={{ color: '#8899BB', fontSize: '0.8rem', textAlign: 'center', mt: 4 }}>
                                Ask me about your balance, transactions, or to make a transfer.
                            </Typography>
                        )}
                        {messages.map((msg, i) => (
                            <Box
                                key={i}
                                sx={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
                            >
                                <Box
                                    sx={{
                                        maxWidth: '78%',
                                        px: 2,
                                        py: 1,
                                        backgroundColor: msg.role === 'user' ? '#152550' : '#0D1B3E',
                                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                    }}
                                >
                                    <Typography sx={{ color: '#FFFFFF', fontSize: '0.8rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                                        {msg.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                        {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', pl: 1 }}>
                                <CircularProgress size={18} sx={{ color: '#8899BB' }} />
                            </Box>
                        )}
                        <div ref={bottomRef} />
                    </Box>

                    {/* Input area */}
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            backgroundColor: '#152550',
                        }}
                    >
                        {awaitingConfirmation ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    onClick={() => send('yes')}
                                    sx={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        color: '#6BFF9E',
                                        borderRadius: 0,
                                        fontWeight: 600,
                                        border: '1px solid #6BFF9E',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(107,255,158,0.15)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(107,255,158,0.3)',
                                        },
                                    }}
                                >
                                    Yes
                                </Button>
                                <Button
                                    onClick={() => send('no')}
                                    sx={{
                                        flex: 1,
                                        backgroundColor: 'transparent',
                                        color: '#FF6B6B',
                                        borderRadius: 0,
                                        fontWeight: 600,
                                        border: '1px solid #FF6B6B',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255,107,107,0.15)',
                                            transform: 'translateY(-2px)',
                                            boxShadow: '0 4px 12px rgba(255,107,107,0.3)',
                                        },
                                    }}
                                >
                                    No
                                </Button>
                            </Box>
                        ) : (
                            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Type a message..."
                                    disabled={loading}
                                    autoComplete="off"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 0,
                                            backgroundColor: '#0D1B3E',
                                            color: '#FFFFFF',
                                            fontSize: '0.8rem',
                                            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                                            '&.Mui-focused fieldset': { borderColor: '#B8860B' },
                                        },
                                        '& .MuiInputBase-input::placeholder': { color: '#8899BB', opacity: 1 },
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    sx={{
                                        px: 2,
                                        backgroundColor: '#FFFFFF',
                                        color: '#0D1B3E',
                                        borderRadius: 0,
                                        borderBottom: '4px solid #B8860B',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        minWidth: 48,
                                        '&:hover': {
                                            backgroundColor: '#F5F5F5',
                                            borderBottom: '4px solid #E8B824',
                                        },
                                        '&.Mui-disabled': {
                                            opacity: 0.4,
                                            backgroundColor: '#FFFFFF',
                                            color: '#0D1B3E',
                                        },
                                    }}
                                >
                                    Send
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Box>
            )}
        </>
    );
}
