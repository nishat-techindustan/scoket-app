import { useState, useEffect, useMemo, useRef } from 'react'
import socketio from 'socket.io-client'

const useChat = () => {
  const [messages, setMessages] = useState([])
  const socketRef = useRef()
  const [socketInfo, setsocketInfo] = useState({})
  const [typingState, setTypingState] = useState(false)

  useEffect(() => {
    socketRef.current = socketio(
      "http://localhost:4000"
    )
    socketRef.current.on('getClientId', id => {
      setsocketInfo(id)
    })
    socketRef.current.on('typingStateServer', state => {
      setTypingState(state)
    })
    socketRef.current.on(
      "messagefromserver",
      (message) => {
        setMessages(messages => [...messages, message])
      }
    )

    return () => {
      socketRef.current.disconnect()
    }
  }, [])

  const sendMessage = (message) => {
    socketRef.current.emit("messagefromclient", message)
  }

  const sendTypingState = (state) => {
    socketRef.current.emit("typingStateclient", state)
  }

  return { socketInfo, messages, typingState, sendTypingState, sendMessage }
}

export default function Home() {
  const { typingState, socketInfo, messages, sendMessage, sendTypingState } = useChat()
  const [active, setActive] = useState(false)
  const [focused, setFocused] = useState(false)
  const [value, setValue] = useState('')
  function onChangeText(event) {
    setValue(event.target.value)
  }

  function onSendText() {
    sendMessage(value)
  }

  function checkClassForSocketId(id) {
    return id === socketInfo ? 'local-user' : 'foreign-user'
  }

  const onFocus = () => {
    setFocused(true)
  }

  const onBlur = () => {
    setFocused(false)
  }

  useEffect(() => {
    sendTypingState(focused)
  }, [focused])
  return (
    <div className="card">
      <div className="text-card">
        <div>{`user ${socketInfo}`}</div>
        <div className={typingState.connected && 'online-status'}></div>
        <ul>
          {messages.map((msg, key) => {
            return (
              <li className={checkClassForSocketId(msg.id)} key={key}>
                <div>{msg.data}</div>
              </li>
            )
          })}
        </ul>
      </div>
      {typingState.state && <div>typing...</div>}
      <div className="w-full flex flex-col relative">
        <input
          className="border rounded-3xl outline-none w-11/12 focus:border-green-700 p-4"
          value={value}
          onChange={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          className="my-3 bg-green-400 rounded-sm outline-none focus:outline-none py-2 px-4 send-btn"
          onClick={onSendText}
        >
          &#x27A2;
      </button>
      </div>
    </div>
  )
}
