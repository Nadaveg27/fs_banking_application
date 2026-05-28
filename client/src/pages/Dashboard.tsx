import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, CircularProgress, TextField, Select, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList'; // sort icon
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'; // filter icon
import api from '@/api/axios';
import Navbar from '@/components/Navbar';
import ChatWidget from '@/components/ChatWidget';
import { useAuth } from '@/context/AuthContext';

interface Transaction {
    _id: string;
    counterpartyEmail: string;
    amount: number;
    reason?: string;
    date: string;
}

export default function Dashboard() {
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [counterparty, setCounterparty] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [appliedFilters, setAppliedFilters] = useState<{
        counterparty: string;
        startDate: string;
        endDate: string;
    }>({ counterparty: '', startDate: '', endDate: '' });

    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        api.get('/accounts/me')
            .then(res => setBalance(res.data.balance))
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, []);

    const fetchTransactions = useCallback((
        filters: typeof appliedFilters,
        pageNum: number,
        sb: string,
        so: string,
    ) => {
        setTransactionsLoading(true);
        const params: Record<string, string | number> = { page: pageNum, limit: 10, sortBy: sb, sortOrder: so };
        if (filters.counterparty) params.counterparty = filters.counterparty;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        api.get('/transactions', { params })
            .then(res => {
                setTransactions(res.data.transactions);
                setTotalPages(res.data.pagination.totalPages || 1);
            })
            .catch(() => {})
            .finally(() => setTransactionsLoading(false));
    }, []);

    useEffect(() => {
        fetchTransactions(appliedFilters, page, sortBy, sortOrder);
    }, [page]);

    const handleSearch = () => {
        const filters = { counterparty, startDate, endDate };
        setAppliedFilters(filters);
        setPage(1);
        fetchTransactions(filters, 1, sortBy, sortOrder);
    };

    const handleClear = () => {
        setCounterparty('');
        setStartDate('');
        setEndDate('');
        const filters = { counterparty: '', startDate: '', endDate: '' };
        setAppliedFilters(filters);
        setPage(1);
        fetchTransactions(filters, 1, sortBy, sortOrder);
    };

    const handleSortChange = (value: string) => {
        const [newSortBy, newSortOrder] = value.split('-');
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        setPage(1);
        fetchTransactions(appliedFilters, 1, newSortBy, newSortOrder);
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress sx={{ color: '#FFFFFF' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />

            <Box component="main" sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Typography sx={{ fontSize: '1.5rem' }}>
                    <span style={{ color: '#8899BB' }}>Welcome, </span>
                    <span style={{ color: '#FFFFFF', fontWeight: 700 }}>{user?.name}</span>
                </Typography>

                <Box sx={{ display: 'flex', gap: 4 }}>
                    <Box sx={{ backgroundColor: '#152550', p: 4, minWidth: 320 }}>
                        <Typography sx={{ color: '#8899BB', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                            Account Balance
                        </Typography>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '3rem', mb: 0.5 }}>
                            ${balance?.toFixed(2)}
                        </Typography>
                        <Typography sx={{ color: '#8899BB', fontSize: '0.875rem', mb: 3 }}>
                            Available funds
                        </Typography>
                        <Box sx={{ width: '100%', height: '1px', backgroundColor: '#B8860B', mb: 3 }} />
                        <Button
                            fullWidth
                            onClick={() => navigate('/transfer')}
                            sx={{
                                py: 1.5,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#F5F5F5',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 6px 20px rgba(184,134,11,0.4)',
                                    borderBottom: '4px solid #E8B824',
                                },
                            }}
                        >
                            Make a Transfer
                        </Button>
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.25rem', mb: 1 }}>
                            Recent Transactions
                        </Typography>
                        <Box sx={{ width: 64, height: '1px', backgroundColor: 'rgba(255,255,255,0.3)', mb: 3 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Button
                                    onClick={() => setShowFilters(v => !v)}
                                    startIcon={<FilterAltOutlinedIcon />}
                                    sx={{
                                        py: 0.75, px: 2,
                                        backgroundColor: 'transparent',
                                        color: showFilters ? '#B8860B' : '#8899BB',
                                        borderRadius: 0,
                                        border: `1px solid ${showFilters ? '#B8860B' : 'rgba(255,255,255,0.2)'}`,
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            backgroundColor: 'rgba(184,134,11,0.1)',
                                            color: '#B8860B',
                                            borderColor: '#B8860B',
                                        },
                                    }}
                                >
                                    Filters
                                </Button>

                                <Select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={e => handleSortChange(e.target.value)}
                                    size="small"
                                    renderValue={(value) => (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <FilterListIcon sx={{ fontSize: '1rem', color: '#8899BB' }} />    
                                            <Typography sx={{ color: '#8899BB', fontSize: '0.95rem' }}>
                                                Sort by
                                            </Typography>
                                            {value !== 'date-desc' && (
                                                <Typography sx={{ color: '#B8860B', fontSize: '0.8rem' }}>
                                                    · {value === 'date-asc' ? 'Oldest first' : value === 'amount-desc' ? 'Highest amount' : 'Lowest amount'}
                                                </Typography>
                                            )}
                                        </Box>
                                    )}
                                    sx={{
                                        backgroundColor: 'transparent',
                                        color: '#8899BB',
                                        borderRadius: 0,
                                        fontSize: '0.875rem',
                                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                        '& .MuiSvgIcon-root': { color: '#8899BB' },
                                    }}
                                    MenuProps={{
                                        sx: {
                                            '& .MuiPaper-root': {
                                                backgroundColor: '#152550',
                                                borderRadius: 0,
                                            },
                                            '& .MuiMenuItem-root': {
                                                color: '#FFFFFF',
                                                fontSize: '0.875rem',
                                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.08)' },
                                                '&.Mui-selected': { backgroundColor: 'rgba(184,134,11,0.2)' },
                                                '&.Mui-selected:hover': { backgroundColor: 'rgba(184,134,11,0.3)' },
                                            },
                                        },
                                    }}
                                >
                                    <MenuItem value="date-desc">Newest first</MenuItem>
                                    <MenuItem value="date-asc">Oldest first</MenuItem>
                                    <MenuItem value="amount-desc">Highest amount</MenuItem>
                                    <MenuItem value="amount-asc">Lowest amount</MenuItem>
                                </Select>
                            </Box>

                            {showFilters && (
                                <>
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <TextField
                                            label="Filter by email"
                                            type="text"
                                            value={counterparty}
                                            onChange={e => setCounterparty(e.target.value)}
                                            size="small"
                                            sx={{ flex: '1 1 180px' }}
                                        />
                                        <TextField
                                            label="From"
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            size="small"
                                            sx={{
                                                flex: '0 1 160px',
                                                '& .MuiInputLabel-root': {
                                                    transform: 'translate(14px, -9px) scale(0.75)',
                                                }
                                            }}
                                        />
                                        <TextField
                                            label="To"
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            size="small"
                                            sx={{
                                                flex: '0 1 160px',
                                                '& .MuiInputLabel-root': {
                                                    transform: 'translate(14px, -9px) scale(0.75)',
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            onClick={handleSearch}
                                            sx={{
                                                py: 0.75, px: 3,
                                                backgroundColor: 'transparent',
                                                color: '#B8860B',
                                                borderRadius: 0,
                                                fontWeight: 600,
                                                border: '1px solid #B8860B',
                                                borderBottom: '2px solid #B8860B',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(184,134,11,0.25)',
                                                    color: '#E8B824',
                                                    borderColor: '#E8B824',
                                                    transform: 'translateY(-1px)',
                                                },
                                            }}
                                        >
                                            Search
                                        </Button>
                                        <Button
                                            onClick={handleClear}
                                            sx={{
                                                py: 0.75, px: 3,
                                                backgroundColor: 'transparent',
                                                color: '#8899BB',
                                                borderRadius: 0,
                                                border: '1px solid rgba(136,153,187,0.4)',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(136,153,187,0.15)',
                                                    color: '#FFFFFF',
                                                    borderColor: 'rgba(136,153,187,0.8)',
                                                    transform: 'translateY(-1px)',
                                                },
                                            }}
                                        >
                                            Clear
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>

                        {transactionsLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                                <CircularProgress sx={{ color: '#FFFFFF' }} size={28} />
                            </Box>
                        ) : transactions.length === 0 ? (
                            <Typography sx={{ color: '#8899BB', fontSize: '0.875rem' }}>
                                No transactions found.
                            </Typography>
                        ) : (
                            <>
                                {transactions.map((tx, index) => (
                                    <Box key={tx._id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2 }}>
                                            <Box>
                                                <Typography sx={{ color: '#FFFFFF', fontSize: '0.875rem' }}>
                                                    {tx.counterpartyEmail}
                                                </Typography>
                                                {tx.reason && (
                                                    <Typography sx={{ color: '#8899BB', fontSize: '0.75rem', mt: 0.25 }}>
                                                        {tx.reason}
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Typography sx={{ color: tx.amount < 0 ? '#FF6B6B' : '#6BFF9E', fontWeight: 600, fontSize: '0.875rem' }}>
                                                {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                                            </Typography>
                                            <Typography sx={{ color: '#8899BB', fontSize: '0.75rem' }}>
                                                {new Date(tx.date).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        {index < transactions.length - 1 && (
                                            <Box sx={{ width: '100%', height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                        )}
                                    </Box>
                                ))}

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mt: 3 }}>
                                    <Button
                                        onClick={() => setPage(p => p - 1)}
                                        disabled={page === 1}
                                        sx={{
                                            py: 0.5, px: 2,
                                            backgroundColor: 'transparent',
                                            color: '#FFFFFF',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderBottom: '2px solid #B8860B',
                                            borderRadius: 0,
                                            fontSize: '0.875rem',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                                            '&.Mui-disabled': {
                                                color: '#334466',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderBottom: '2px solid #334466',
                                            },
                                        }}
                                    >
                                        Previous
                                    </Button>
                                    <Typography sx={{ color: '#8899BB', fontSize: '0.875rem' }}>
                                        Page {page} of {totalPages}
                                    </Typography>
                                    <Button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page === totalPages}
                                        sx={{
                                            py: 0.5, px: 2,
                                            backgroundColor: 'transparent',
                                            color: '#FFFFFF',
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderBottom: '2px solid #B8860B',
                                            borderRadius: 0,
                                            fontSize: '0.875rem',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                                            '&.Mui-disabled': {
                                                color: '#334466',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                borderBottom: '2px solid #334466',
                                            },
                                        }}
                                    >
                                        Next
                                    </Button>
                                </Box>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            <Box component="footer" sx={{ py: 3, textAlign: 'center' }}>
                <Typography sx={{ color: '#334466', fontSize: '0.75rem' }}>
                    © 2026 Maccabim Bank. All rights reserved.
                </Typography>
            </Box>
            <ChatWidget />
        </Box>
    );
}
