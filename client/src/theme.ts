import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0D1B3E',
            paper: '#152550',
        },
        primary: {
            main: '#FFFFFF',
        },
        error: {
            main: '#FF6B6B',
        },
        success: {
            main: '#6BFF9E',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#8899BB',
        },
    },
    shape: {
        borderRadius: 0,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#FFFFFF',
                    color: '#0D1B3E',
                    borderBottom: '4px solid #B8860B',
                    borderRadius: 0,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                        backgroundColor: '#F0F0F0',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 0,
                        backgroundColor: '#152550',
                        '& fieldset': {
                            borderColor: 'rgba(255,255,255,0.2)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(255,255,255,0.4)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#FFFFFF',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#8899BB',
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.1em',
                    },
                    '& .MuiInputBase-input': {
                        color: '#FFFFFF',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    backgroundColor: '#152550',
                },
            },
        },
    },
});

export default theme;