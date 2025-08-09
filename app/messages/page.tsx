'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageCircle, 
  Send, 
  Search,
  Phone,
  Video,
  MoreVertical
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { getInitials, formatDateTime } from '@/lib/utils'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import Link from 'next/link'

interface Conversation {
  id: string
  otherUser: {
    id: string
    name: string
    profilePic?: string
    role: string
  }
  lastMessage: {
    content: string
    timestamp: string
    isRead: boolean
  }
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  content: string
  timestamp: string
  isRead: boolean
}

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      // For demo purposes, using sample data
      setConversations(getSampleConversations())
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations(getSampleConversations())
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      } else {
        setMessages(getSampleMessages(userId))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      setMessages(getSampleMessages(userId))
    }
  }

  const getSampleConversations = (): Conversation[] => [
    {
      id: '1',
      otherUser: {
        id: '1',
        name: user?.role === 'WORKER' ? 'Priya Sharma' : 'Rajesh Kumar',
        profilePic: user?.role === 'WORKER' 
          ? 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        role: user?.role === 'WORKER' ? 'CUSTOMER' : 'WORKER'
      },
      lastMessage: {
        content: 'Thank you for the excellent work! The kitchen looks amazing.',
        timestamp: '2024-01-20T15:30:00Z',
        isRead: true
      },
      unreadCount: 0
    },
    {
      id: '2',
      otherUser: {
        id: '2',
        name: user?.role === 'WORKER' ? 'Amit Patel' : 'Suresh Patel',
        profilePic: user?.role === 'WORKER'
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        role: user?.role === 'WORKER' ? 'CUSTOMER' : 'WORKER'
      },
      lastMessage: {
        content: 'Can you start the work tomorrow at 10 AM?',
        timestamp: '2024-01-21T09:15:00Z',
        isRead: false
      },
      unreadCount: 2
    },
    {
      id: '3',
      otherUser: {
        id: '3',
        name: user?.role === 'WORKER' ? 'Sunita Reddy' : 'Mohan Sharma',
        profilePic: user?.role === 'WORKER'
          ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
          : 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
        role: user?.role === 'WORKER' ? 'CUSTOMER' : 'WORKER'
      },
      lastMessage: {
        content: 'I have sent you the project details. Please review and let me know.',
        timestamp: '2024-01-19T14:20:00Z',
        isRead: true
      },
      unreadCount: 0
    }
  ]

  const getSampleMessages = (userId: string): Message[] => [
    {
      id: '1',
      senderId: userId,
      content: 'Hi! I saw your profile and I\'m interested in hiring you for a carpentry project.',
      timestamp: '2024-01-20T10:00:00Z',
      isRead: true
    },
    {
      id: '2',
      senderId: user?.id || 'current-user',
      content: 'Hello! Thank you for reaching out. I\'d be happy to help with your project. Can you tell me more about what you need?',
      timestamp: '2024-01-20T10:15:00Z',
      isRead: true
    },
    {
      id: '3',
      senderId: userId,
      content: 'I need to repair some kitchen cabinets and also do some painting work. When would you be available?',
      timestamp: '2024-01-20T10:30:00Z',
      isRead: true
    },
    {
      id: '4',
      senderId: user?.id || 'current-user',
      content: 'I can start this weekend. My rate is ₹800 per day for this type of work. Would that work for you?',
      timestamp: '2024-01-20T11:00:00Z',
      isRead: true
    },
    {
      id: '5',
      senderId: userId,
      content: 'That sounds perfect! Let\'s schedule it for Saturday morning.',
      timestamp: '2024-01-20T15:30:00Z',
      isRead: true
    }
  ]

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSendingMessage(true)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConversation,
          content: newMessage.trim()
        })
      })

      if (response.ok) {
        // Add message to local state
        const newMsg: Message = {
          id: Date.now().toString(),
          senderId: user?.id || 'current-user',
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          isRead: false
        }
        setMessages(prev => [...prev, newMsg])
        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation)

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view messages.</p>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Communicate with your clients and workers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Conversations</span>
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search conversations..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No conversations yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation.id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                          selectedConversation === conversation.id ? 'bg-orange-50 border-orange-200' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={conversation.otherUser.profilePic} alt={conversation.otherUser.name} />
                              <AvatarFallback>{getInitials(conversation.otherUser.name)}</AvatarFallback>
                            </Avatar>
                            {conversation.unreadCount > 0 && (
                              <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium text-gray-900 truncate">{conversation.otherUser.name}</h3>
                              <span className="text-xs text-gray-500">
                                {formatDateTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                            <p className={`text-sm truncate ${
                              conversation.lastMessage.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'
                            }`}>
                              {conversation.lastMessage.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversationData ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedConversationData.otherUser.profilePic} alt={selectedConversationData.otherUser.name} />
                        <AvatarFallback>{getInitials(selectedConversationData.otherUser.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedConversationData.otherUser.name}</h3>
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedConversationData.otherUser.role.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="p-0">
                  <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.senderId === user?.id
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-orange-100' : 'text-gray-500'
                            }`}>
                              {formatDateTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled={sendingMessage}
                      />
                      <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                        {sendingMessage ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}