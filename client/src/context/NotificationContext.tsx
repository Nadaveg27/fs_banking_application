import { createContext, useContext, useEffect, useState } from 'react'
import { useSocket } from '@/context/SocketContext'

type Notification = {
    from: string
    amount: number
    reason: string | null
    date: string
}

type NotificationContextType = {
    notifications: Notification[]
    unreadCount: number
    clearUnread: () => void
    removeNotification: (index: number) => void
    clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0,
    clearUnread: () => {},
    removeNotification: () => {},
    clearAll: () => {}
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { socket } = useSocket()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (socket === null) return

        const handler = (notification: Notification) => {
            setNotifications(prev => [notification, ...prev])
            setUnreadCount(prev => prev + 1)
        }

        socket.on('transfer_received', handler)
        return () => { socket.off('transfer_received', handler) }
    }, [socket])

    const clearUnread = () => setUnreadCount(0)
    const removeNotification = (index: number) => setNotifications(prev => prev.filter((_, i) => i !== index))
    const clearAll = () => { setNotifications([]); setUnreadCount(0) }

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, clearUnread, removeNotification, clearAll }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    return useContext(NotificationContext)
}
