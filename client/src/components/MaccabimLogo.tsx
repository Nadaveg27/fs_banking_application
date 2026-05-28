import { Box, Typography } from '@mui/material';

export default function MaccabimLogo() {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: '2px', height: 36, backgroundColor: 'rgba(255,255,255,0.4)' }} />
            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Maccabim Bank
            </Typography>
        </Box>
    );
}