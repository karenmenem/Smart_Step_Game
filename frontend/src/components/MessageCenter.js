import React, { useState, useEffect } from 'react';
import '../styles/MessageCenter.css';

function MessageCenter({ userType, onClose, onMessageRead }) {
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        loadConversations();
        // Poll for new messages every 10 seconds
        const interval = setInterval(loadConversations, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (activeConversation) {
            loadMessages(activeConversation.partner_id, activeConversation.partner_type);
        }
    }, [activeConversation]);

    const getHeaders = () => ({
        'Authorization': `Bearer ${localStorage.getItem(userType === 'admin' ? 'adminToken' : 'teacherToken')}`,
        'Content-Type': 'application/json'
    });

    const loadConversations = async () => {
        try {
            console.log('Loading conversations as:', userType);
            const token = localStorage.getItem(userType === 'admin' ? 'adminToken' : 'teacherToken');
            console.log('Token exists:', !!token);
            console.log('Token preview:', token?.substring(0, 20) + '...');
            
            const headers = getHeaders();
            console.log('Request headers:', headers);
            
            const response = await fetch('http://localhost:5001/api/messages/conversations', {
                headers: headers
            });
            
            console.log('Conversations response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('Conversations data received:', data);
                setConversations(data.data || []);
            } else {
                const errorData = await response.json();
                console.error('Failed to load conversations:', response.status, errorData);
                alert(`Failed to load conversations: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            alert('Error loading conversations. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (partnerId, partnerType) => {
        try {
            const response = await fetch(
                `http://localhost:5001/api/messages/conversation/${partnerType}/${partnerId}`,
                { headers: getHeaders() }
            );
            if (response.ok) {
                const data = await response.json();
                setMessages(data.data || []);
                // Notify parent that messages were read
                if (onMessageRead) {
                    onMessageRead();
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation) {
            console.log('Cannot send: missing message or conversation');
            return;
        }

        console.log('Sending message:', {
            recipientId: activeConversation.partner_id,
            recipientType: activeConversation.partner_type,
            message: newMessage
        });

        setSending(true);
        try {
            const response = await fetch('http://localhost:5001/api/messages/send', {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    recipientId: activeConversation.partner_id,
                    recipientType: activeConversation.partner_type,
                    message: newMessage
                })
            });

            const data = await response.json();
            console.log('Send response:', data);

            if (response.ok) {
                setNewMessage('');
                loadMessages(activeConversation.partner_id, activeConversation.partner_type);
                loadConversations(); // Update last message
            } else {
                console.error('Failed to send message:', data);
                alert('Failed to send message: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const startNewConversation = () => {
        // For teachers: start conversation with admin
        // For admins: they can only reply to teacher messages
        if (userType === 'teacher') {
            setActiveConversation({
                partner_id: 1, // Admin ID (you might need to fetch this)
                partner_type: 'admin',
                partner_name: 'Admin'
            });
            setMessages([]);
        }
    };

    return (
        <div className="message-center-overlay" onClick={onClose}>
            <div className="message-center" onClick={(e) => e.stopPropagation()}>
                <div className="message-center-header">
                    <h2>💬 Messages</h2>
                    <button onClick={onClose} className="close-btn">✕</button>
                </div>

                <div className="message-center-body">
                    {/* Conversations List */}
                    <div className="conversations-list">
                        <div className="conversations-header">
                            <h3>Conversations</h3>
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <button 
                                    onClick={() => {
                                        setLoading(true);
                                        loadConversations();
                                    }} 
                                    className="new-msg-btn"
                                    title="Refresh conversations"
                                >
                                    🔄
                                </button>
                                {userType === 'teacher' && (
                                    <button onClick={startNewConversation} className="new-msg-btn">
                                        ✉️ New
                                    </button>
                                )}
                            </div>
                        </div>
                        
                        {loading ? (
                            <p className="loading-text">Loading...</p>
                        ) : conversations.length === 0 ? (
                            <div className="no-conversations">
                                <p>No messages yet</p>
                                {userType === 'teacher' && (
                                    <button onClick={startNewConversation} className="start-conversation-btn">
                                        Send message to Admin
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ overflowY: 'auto' }}>
                                {conversations.map((conv) => (
                                    <div
                                        key={`${conv.partner_type}-${conv.partner_id}`}
                                        className={`conversation-item ${activeConversation?.partner_id === conv.partner_id ? 'active' : ''}`}
                                        onClick={() => setActiveConversation(conv)}
                                    >
                                        <div className="conversation-info">
                                            <strong>{conv.partner_name}</strong>
                                            <p className="last-message">{conv.last_message?.substring(0, 50)}...</p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="unread-badge">{conv.unread_count}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Messages Area */}
                    <div className="messages-area">
                        {activeConversation ? (
                            <>
                                <div className="messages-header">
                                    <h3>{activeConversation.partner_name}</h3>
                                </div>
                                
                                <div className="messages-list">
                                    {messages.length === 0 ? (
                                        <p className="no-messages">No messages yet. Start the conversation!</p>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`message-bubble ${msg.sender_type === userType ? 'sent' : 'received'}`}
                                            >
                                                <p>{msg.message}</p>
                                                <span className="message-time">
                                                    {new Date(msg.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="message-input-area">
                                    <textarea
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        rows="3"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                    />
                                    <button 
                                        onClick={sendMessage} 
                                        disabled={!newMessage.trim() || sending}
                                        className="send-btn"
                                    >
                                        {sending ? 'Sending...' : '📤 Send'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="no-conversation-selected">
                                <p>Select a conversation or start a new one</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MessageCenter;
