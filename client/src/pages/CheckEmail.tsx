import { Box, Button, Typography } from '@mui/material';
import MaccabimLogo from '@/components/MaccabimLogo';

export default function CheckEmail() {
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Box component="header" sx={{ p: 4 }}>
                <MaccabimLogo />
            </Box>

            <Box component="main" sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', px: 2 }}>
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="white" strokeWidth="2" style={{ marginBottom: 32 }}>
                        <rect x="4" y="12" width="56" height="40" />
                        <polyline points="4,12 32,36 60,12" />
                    </svg>

                    <Typography variant="h1" sx={{ color: '#FFFFFF', fontSize: '2.5rem', fontWeight: 700, mb: 2 }}>
                        Check Your Email
                    </Typography>

                    <Box sx={{ width: 64, height: '2px', backgroundColor: 'rgba(255,255,255,0.3)', mb: 3 }} />

                    <Typography sx={{ color: '#8899BB', fontSize: '0.875rem', maxWidth: 480, mb: 4 }}>
                        We've sent a verification link to your email address. Click the link in the email to activate your account.
                    </Typography>

                    <Typography sx={{ color: '#6677AA', fontSize: '0.875rem' }}>
                        Didn't receive an email?{' '}
                        <Button
                            variant="text"
                            sx={{
                                color: '#FFFFFF',
                                textDecoration: 'underline',
                                p: 0,
                                minWidth: 'auto',
                                fontSize: '0.875rem',
                                fontWeight: 400,
                                background: 'none',
                                border: 'none',
                                borderBottom: 'none',
                                '&:hover': { background: 'none', textDecoration: 'underline' },
                            }}
                        >
                            Resend
                        </Button>
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