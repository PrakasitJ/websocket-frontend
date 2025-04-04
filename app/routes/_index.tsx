import { defaultConfigWithRandomUsername, useChat, type SocketConfig } from "~/services/websocket";
import type { Route } from "./+types/_index";
import { useState, useCallback, useEffect, useRef } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Chat Application" },
    { name: "description", content: "Real-time chat application" },
  ];
}

export default function Index() {
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const config = defaultConfigWithRandomUsername;

  const { joinRoom, leaveRoom, sendMessage, sendFastMessage, sendFile, messages, currentRoom, isConnected, on, off } = useChat(config);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle message input changes
  const handleMessageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  }, []);

  // Handle form submission
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if ((messageInput.trim() || selectedFile) && currentRoom) {
      if (selectedFile) {
        // Here you would typically upload the file to your server
        // and then send the file URL in the message
        handleSendFile(selectedFile);
      } else {
        sendMessage(messageInput);
      }
      setMessageInput("");
      setSelectedFile(null);
      setFilePreview(null);
    }
  }, [messageInput, selectedFile, currentRoom, sendMessage]);

  // Handle fast message
  const handleFastMessage = useCallback(() => {
    sendFastMessage("Hello, world!");
  }, [sendFastMessage]);

  // Handle room joining
  const handleJoinRoom = useCallback((roomId: string) => {
    joinRoom(roomId);
  }, [joinRoom]);

  // Handle room leaving
  const handleLeaveRoom = useCallback((roomId: string) => {
    leaveRoom(roomId);
  }, [leaveRoom]);

  const handleSendFile = useCallback((file: File) => {
    sendFile(file);
  }, [sendFile]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Chat Application</h1>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Room Selection Sidebar */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold mb-4">Rooms</h2>
            <div className="space-y-2">
              <button
                onClick={() => handleJoinRoom("1")}
                className={`w-full p-2 rounded-md text-left transition-colors ${
                  currentRoom === "1"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Room 1
              </button>
              <button
                onClick={() => handleJoinRoom("2")}
                className={`w-full p-2 rounded-md text-left transition-colors ${
                  currentRoom === "2"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Room 2
              </button>
              {currentRoom && (
                <button
                  onClick={() => handleLeaveRoom(currentRoom)}
                  className="w-full p-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Leave Room
                </button>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-3 bg-white rounded-lg shadow-md p-4">
            <div className="h-[500px] overflow-y-auto mb-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex flex-col space-y-1 ${
                    message.sender === config.username ? 'items-end' : 'items-start'
                  }`}
                >
                  <div className={`flex items-start space-x-2 max-w-[70%] ${
                    message.sender === config.username ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      {message.sender?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`flex flex-col space-y-1 ${
                      message.sender === config.username ? 'items-end' : 'items-start'
                    }`}>
                      <span className="text-xs text-gray-500">{message.sender}</span>
                      <div className={`p-3 rounded-lg ${
                        message.sender === config.username
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      } ${message.type === "file" ? '' : ''}
                        ${message.type === "image" ? 'bg-transparent' : ''}`}>
                        {message.type === "image" && (
                          <img src={message.content} alt="Image" className="max-w-full rounded-lg" />
                        )}
                        {message.type === "file" && (
                          <div className="flex items-center space-x-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{message.content}</span>
                          </div>
                        )}
                        {message.type === "text" && (
                          <p>{message.content}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {!currentRoom && (
                <div className="text-center text-gray-500 py-8">
                  Select a room to start chatting
                </div>
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              {filePreview && (
                <div className="relative p-2 bg-gray-50 rounded-lg">
                  <img src={filePreview} alt="Preview" className="max-h-32 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={handleMessageInputChange}
                  placeholder="Type your message..."
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!currentRoom}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  disabled={!currentRoom}
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                <button
                  type="submit"
                  disabled={!currentRoom || (!messageInput.trim() && !selectedFile)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Send
                </button>
              </div>
            </form>

            {/* Fast Message Button */}
            <button
              onClick={handleFastMessage}
              className="mt-4 w-full p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Send Fast Message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
