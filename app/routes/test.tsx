import { defaultConfigWithRandomUsername, type FilePayload } from "~/services/websocket";
import { useChat } from "../services/websocket/hooks/useChat";
import { useEffect, useState } from "react";

export default function Test() {
    const config = defaultConfigWithRandomUsername;
    const { sendFastMessage, isConnected, messages, on, off } = useChat(config);
    const [file, setFile] = useState<FilePayload>();

    useEffect(() => {
        const handleFinish = (message: FilePayload) => {
            console.log(message);
            setFile(message);
        };

        on("finish", handleFinish);
        return () => {
            off("finish", handleFinish);
        };
    }, [on, off]);

    const handleSendMessage = () => {
        sendFastMessage("Hello, world!");
    };

    return (
        <div>
            {isConnected ? "Connected" : "Disconnected"}
            {file && file.file_type.includes("video") && <video src={file.file_path} className="w-1/2 h-1/2" controls autoPlay/>}
            {file && file.file_type.includes("image") && <img src={file.file_path} className="w-1/2 h-1/2" />}
            {file && file.file_type.includes("audio") && <audio src={file.file_path} className="w-1/2 h-1/2" controls />}
            <div>
                {messages.map((message, index) => (
                    <div key={index}>{message.content}</div>
                ))}
            </div>
            <button onClick={handleSendMessage}>Send Message</button>
        </div>
    );
}
