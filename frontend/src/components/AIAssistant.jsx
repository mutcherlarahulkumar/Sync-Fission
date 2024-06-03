import React, { useState } from 'react';
import "../App"
import axios from 'axios';
import { useRef, useEffect } from 'react';
import teacherimage from '../assets/tutor.png'

function AIAssistant() {
  const [isChatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

    const sendMessage = async () => {
      setIsLoading(true);
      await setMessages(prevMessages => [...prevMessages, prompt]);
        try {
          const response = await axios.post('http://localhost:3000/api/v1/chat/send', {
            userInput: prompt
          });
          const botMessage = response.data.response;
          await setMessages(prevMessages => [...prevMessages, botMessage]);
          console.log(messages);
        } catch (error) {
          console.error('Error:', error);
        }

        setIsLoading(false);
    };


  return (
    <div>
      <button className='ai-assistant' onClick={() => setChatOpen(!isChatOpen)}>
      <img src={teacherimage} alt="AI Assistant" style={{borderRadius: '50%', width: '50px', height: '50px'}} />
      </button>

      {isChatOpen && (
        <div className='chat-interface'>
        {isChatOpen && (
  <div className="chat-interface fixed bottom-12 right-12 w-1/2 h-100 bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="flex items-center justify-between p-3 border-b-2 border-gray-200">
      <h5 className="font-bold text-lg">AI Teaching Assistant</h5>
      <button onClick={() => setChatOpen(!isChatOpen)}>Close</button>
    </div>
    <div className="p-3 overflow-y-auto h-72">
  {/* Messages go here */}
    {messages.map((message, index) => (
      <div key={index} className={`flex items-start ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <div className="flex flex-col space-y-2 text-xs max-w-xs mx-2 items-start">
          <div>
            <span className={`px-4 py-2 rounded-lg inline-block ${index % 2 === 0 ? 'rounded-br-none bg-blue-600 text-white' : 'rounded-bl-none bg-green-600 text-white'}`}> 
              {message}
            </span>
          </div>
        </div>
      </div>
    ))}
    <div ref={messagesEndRef} />
  </div>
    <div className="border-t-2 border-gray-200 px-4 pt-3 pb-4 bg-gray-50">

    {isLoading?<p>Loading ... TA is spending time on your query</p>:<div className="relative flex">
        <input type="text" className="w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-12 bg-gray-200 rounded-full py-3" placeholder="Type your message..." onChange={(e)=>{
          setPrompt(e.target.value)
        }}/>
        <div className="absolute right-0 items-end top-0 bottom-0 mr-4 my-auto">
          <button className="font-semibold text-center text-white transition duration-500 ease-in-out bg-blue-600 py-2 px-6 rounded-full" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>}
    </div>
  </div>
)}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;