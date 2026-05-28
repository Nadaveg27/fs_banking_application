import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Registration from './pages/Registration';
import CheckEmail from './pages/CheckEmail';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <SocketProvider>
                <NotificationProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Registration />} />
                        <Route path="/check-email" element={<CheckEmail />} />
                        <Route path="/verify" element={<VerifyEmail />} />
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/transfer" element={
                            <ProtectedRoute>
                                <Transfer />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </BrowserRouter>
                </NotificationProvider>
                </SocketProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}