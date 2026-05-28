import { useState } from 'react';
import { Box, Button, Typography, Badge, Menu, MenuItem, IconButton, Tooltip } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CloseIcon from '@mui/icons-material/Close';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import MaccabimLogo from '@/components/MaccabimLogo';

function timeAgo(dateString: string): string {
    const ms = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(ms / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, clearUnread, removeNotification, clearAll } = useNotifications();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
        clearUnread();
    };

    const handleClose = () => setAnchorEl(null);

    return (
        <Box component="nav" sx={{ height: 64, backgroundColor: '#152550', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, position: 'sticky', top: 0, zIndex: 100 }}>
            <MaccabimLogo />
            <Typography sx={{ color: '#8899BB', fontSize: '0.875rem' }}>
                {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton onClick={handleOpen}>
                    <Badge badgeContent={unreadCount} color="error">
                        <NotificationsIcon sx={{ color: '#FFFFFF' }} />
                    </Badge>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                    {notifications.length === 0 ? (
                        <MenuItem>No notifications</MenuItem>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 0.5 }}>
                                <Typography sx={{ color: '#8899BB', fontSize: 12 }}>Notifications</Typography>
                                <Tooltip title="Clear all notifications" placement="bottom">
                                    <IconButton size="small" onClick={clearAll} sx={{ color: '#8899BB' }}>
                                        <DeleteSweepIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            {notifications.map((n, i) => (
                                <MenuItem key={i} sx={{ position: 'relative', pr: 4 }}>
                                    <Box>
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 250 }}>
                                                <Typography sx={{ color: '#FFFFFF', fontSize: 13, fontWeight: 500 }}>{n.from}</Typography>
                                                <Typography sx={{ color: '#6BFF9E', fontWeight: 700, fontSize: 15 }}>+${n.amount}</Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                {n.reason && <Typography sx={{ color: '#8899BB', fontSize: 11, fontStyle: 'italic' }}>{n.reason}</Typography>}
                                                {n.reason && <Typography sx={{ color: '#8899BB', fontSize: 11 }}>·</Typography>}
                                                <Typography sx={{ color: '#8899BB', fontSize: 11 }}>{timeAgo(n.date)}</Typography>
                                            </Box>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => { e.stopPropagation(); removeNotification(i); }}
                                            sx={{ position: 'absolute', top: '50%', right: 4, transform: 'translateY(-50%)', color: '#8899BB' }}
                                        >
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                </MenuItem>
                            ))}
                        </>
                    )}
                </Menu>
                <Button onClick={handleLogout} sx={{ py: 1, px: 2, fontSize: '0.875rem' }}>
                    Sign Out
                </Button>
            </Box>
        </Box>
    );
}