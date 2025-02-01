import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import './App.css';
// npm run build
// npm run dev
// cd..
// npm start

function App() {
  const [userMsgList, setUserMsgList] = useState([]);
  const [aiMsgList, setAiMsgList] = useState([]);
  const [aiMsgTimeList, setAiMsgTimeList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [voiceText, setVoiceText] = useState("Off");
  const [jarvisText, setJarvisText] = useState("Off");
  const [voiceBool, setVoiceBool] = useState(false);
  const [recordBool, setRecordBool] = useState(false);
  const [jarvisBool, setJarvisBool] = useState(false);
  const [newCSS, setNewCSS] = useState('');

  // New states for example chat messages
  const [exampleUserMsgList, setExampleUserMsgList] = useState([]);
  const [exampleAiMsgList, setExampleAiMsgList] = useState([]);

  useEffect(() => {
    firstUpdated();

    // Dynamically add the link to index.css from the public folder
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/index.css'; // Path to your CSS file in the public folder
    document.head.appendChild(link);

    // Clean up on component unmount
    return () => {
      document.head.removeChild(link);
    };

  }, []);

  const firstUpdated = () => {
    clearChat();
  };

  const exampleChat = (bool) => {
    if (bool) {
      setExampleUserMsgList(["Hey there!, How are you?", "Can you change the background to blue?"]);
      setExampleAiMsgList([
        "I am doing swell! Pleasure to meet you. How can I assist you?",
        "Of course! Done!",
      ]);

      setTimeout(() => {
        document.querySelectorAll('.user-message').forEach((element) => {
          element.classList.add('example');
        });
        document.querySelectorAll('.ai-message').forEach((element) => {
          element.classList.add('example');
        });
        document.querySelectorAll('.ai-msg-container').forEach((element) => {
          element.classList.add('example');
        });
      }, 0);
    } else {
      setExampleUserMsgList([]);
      setExampleAiMsgList([]);

      document.querySelectorAll('.user-message').forEach((element) => {
        element.classList.remove('example');
      });
      document.querySelectorAll('.ai-message').forEach((element) => {
        element.classList.remove('example');
      });
      document.querySelectorAll('.ai-msg-container').forEach((element) => {
        element.classList.remove('example');
      });
    }
  };

  // Scrolls the overflow automatically down
  const msgContainerRef = useRef(null);
  useEffect(() => {
    if (msgContainerRef.current) {
      msgContainerRef.current.scrollTop = msgContainerRef.current.scrollHeight;
    }
  }, [userMsgList, aiMsgList]);

  const inputChange = (e) => {
    setInputValue(e.target.value);
  };

  const trashInput = () => {
    setInputValue('');
    exampleChat(false);
  };

  const clearChat = () => {
    setAiMsgTimeList([]);
    setUserMsgList([]);
    setAiMsgList([]);
    exampleChat(true);
  };

  const toggleVoice = () => {
    setVoiceBool(!voiceBool);
    if (!voiceBool) {
      setVoiceText("On");
    } else {
      setVoiceText("Off");
    }
  };

  const toggleJarvis = () => {
    setJarvisBool(!jarvisBool);
    if (!jarvisBool) {
      setJarvisText("On");
    } else {
      setJarvisText("Off");
    }
  }

  const copyText = async (index) => {
    try {
      await navigator.clipboard.writeText(aiMsgList[index]);
    } catch (error) {
      console.log('failed: ' + error);
    }
  };

  const recordMessage = () => {
    window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    let recognition = new SpeechRecognition();
    recognition.interimResults = true;
    recognition.continuous = true;

    if (recordBool) {
      setRecordBool(false);
      document.getElementById('recordBtn').classList.remove('active');
      recognition.start();
      recognition.stop();
    } else {
      recognition.addEventListener('result', (e) => {
        const transcript = Array.from(e.results)
          .map(result => result[0])
          .map(result => result.transcript)
  
        setInputValue(transcript);
      });

      recognition.start();
      setRecordBool(true);
      document.getElementById('recordBtn').classList.add('active');
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: true,
      hour: "numeric",
      minute: "numeric",
    });
  };

  const addMessageTime = () => {
    const currentTime = getCurrentTime();
    setAiMsgTimeList((prevList) => [...prevList, currentTime]);
  };

  const addUserMessage = (msg) => {
    if (msg) {
      setUserMsgList((prevList) => [...prevList, msg]);
    }
  };

  const fetchAIResponse = async (newMessageIndex, msg) => {
    try {

      // Fetch the CSS content from the public folder
      const cssResponse = await fetch('/index.css');
      let cssContent = await cssResponse.text();

      if (newCSS != '') {
        cssContent = newCSS;
      }

      const { data } = await axios.post(`http://localhost:3000/chat`, {
        userMsg: msg,
        userMsgList: userMsgList,
        aiMsgList: aiMsgList,
        cssContent: cssContent,
        jarvisBool: jarvisBool
      });

      if (jarvisBool) {
        typeWriterEffect(newMessageIndex, data.summary);
  
        // Handle AI response and updated CSS
        if (data.updatedCSS && data.updatedCSS.trim().length > 0) {
          // Remove existing style tag if it exists
          let existingStyleTag = document.getElementById('dynamic-styles');
          if (existingStyleTag) {
            existingStyleTag.remove();
          }
        
          // Create a new style tag
          let styleTag = document.createElement('style');
          styleTag.id = 'dynamic-styles';
          styleTag.innerHTML = data.updatedCSS;
        
          // Append the new style tag to the head
          document.head.appendChild(styleTag);

          setNewCSS(data.updatedCSS);
        }
        return data.summary;

      } else {

        typeWriterEffect(newMessageIndex, data);
        return data;
      }

    } catch (error) {
      console.error("Error fetching response from server:", error);
      return null;
    }
  };

  const handleSpeechSynthesis = (data, voiceBool) => {
    if (voiceBool && data) {
      let speech = new SpeechSynthesisUtterance();
      speech.text = data;
      let voices = window.speechSynthesis.getVoices();
      let usMaleVoice = voices.find(voice => voice.name === 'Google US English' || voice.lang === 'en-US');

      if (usMaleVoice) {
        speech.voice = usMaleVoice;
      } else {
        console.log('US male voice not found, using default voice');
      }

      window.speechSynthesis.speak(speech);
    }
  };

  const sendMessage = async () => {
    const msg = inputValue;

    exampleChat(false);
    trashInput();        
    addMessageTime();

    if (msg) {
      addUserMessage(msg);

      const newMessageIndex = aiMsgList.length;
      const data = await fetchAIResponse(newMessageIndex, msg);
      handleSpeechSynthesis(data, voiceBool);
    }
  };

  const typeWriterEffect = async (index, text) => {
  
    let i = 0;
    const speed = 25;
    const currentText = [];
  
    const typeNextCharacter = () => {
      if (i < text.length) {
        currentText.push(text.charAt(i));
        setAiMsgList((prevList) => {
          let newList = prevList ? [...prevList] : [];
          newList[index] = currentText.join('');
          return newList;
        });
        i++;
        setTimeout(typeNextCharacter, speed);
      }
    };
    typeNextCharacter();
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => window.speechSynthesis.getVoices());
  }

  return (
    <div>
      <nav className="navbar navbar-expand-lg">
        <div className="container-fluid">
          <a className="navbar-brand">Jarvis Chatbot</a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item">
                <button id="jarvisBtn" onClick={toggleJarvis}>Toggle Jarvis: <span>{jarvisText}</span></button>
              </li>
              <li className="nav-item">
                <button id="voiceBtn" onClick={toggleVoice}>Toggle Voice: <span>{voiceText}</span></button>
              </li>
              <li className="nav-item">
                <button id="clearBtn" onClick={clearChat}>Clear Chat</button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <div className="d-flex flex-column" id="wrapper">
        <div className="align-content-center" id="botbg">
          <div id="msgContainer" ref={msgContainerRef} style={{ height: '80vh', overflowY: 'auto' }}>
            {/* Example Chat Messages */}
            {exampleUserMsgList.map((userMsg, index) => (
              <div key={index} className="chat-group d-flex flex-column">
                <li className="user-message example" id="userMessage">{userMsg}</li>
                <div className="ai-msg-container example">
                  <li className="ai-message">{exampleAiMsgList[index]}</li>
                  <div className="extras-container d-flex">
                    <div className="message-time"></div>
                  </div>
                </div>
              </div>
            ))}

            {/* Actual Chat Messages */}
            {userMsgList.map((userMsg, index) => (
              <div key={index} className="chat-group d-flex flex-column">
                <li className="user-message" id="userMessage">{userMsg}</li>
                <div className="ai-msg-container">
                  <li className="ai-message">
                    {aiMsgList[index] ? aiMsgList[index] : (
                      <div className="loading-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    )}
                  </li>
                  <div className="extras-container d-flex">
                    <div className="message-time">
                      {aiMsgTimeList[index] ? aiMsgTimeList[index] : "Time"}
                    </div>
                    <button className="message-copy bi bi-copy" onClick={() => copyText(index)}></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div id="bottomWrapper">
          <div className="mb-2" id="inputContainer">
            <textarea
              className="p-2"
              id="textInput"
              placeholder="Ask me something!"
              value={inputValue}
              onChange={inputChange}
              rows="2"
            />
            <button id="trashBtn" onClick={() => trashInput()}>
              <i className="bi bi-trash"></i>
            </button>
            <button id="recordBtn" onClick={() => recordMessage()}>
              <i className="bi bi-mic"></i>
            </button>
            <button id="sendBtn" onClick={() => sendMessage()}>
              <i className="bi bi-arrow-up"></i>
            </button>
          </div>
          <footer className="text-center p-3">© Jarvis Chatbot</footer>
        </div>
      </div>
    </div>
  );
}

export default App;
