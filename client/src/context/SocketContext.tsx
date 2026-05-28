import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

type SocketContextType = { socket: Socket | null }

const SocketContext = createContext<SocketContextType>({ socket: null })

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
    const [socket, setSocket] = useState<Socket | null>(null)

    useEffect(() => {
        if (user && socket === null) {
            const newSocket = io(import.meta.env.VITE_SOCKET_URL, { withCredentials: true })
            setSocket(newSocket)
            newSocket.emit('join', user.id)
        } else if (!user && socket !== null) {
            socket.disconnect()
            setSocket(null)
        }
    }, [user?.id])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}

export function useSocket() {
    return useContext(SocketContext)
}
