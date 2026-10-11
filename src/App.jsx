import { useEffect, useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Login from './auth/login.jsx'
import Register from './auth/register.jsx'
import Homepage from "./frontend/homepage.jsx";
import Chatbot from "./frontend/mainpage.jsx";
import './styles/install-prompt.css'

function getInstallInstructions() {
  const userAgent = window.navigator.userAgent.toLowerCase()

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'Tap Share, then choose Add to Home Screen.'
  }

  if (/android/.test(userAgent)) {
    return 'Open your browser menu, then choose Install app or Add to Home screen.'
  }

  if (/firefox/.test(userAgent)) {
    return 'Open the browser menu and choose Install or Add to Home screen.'
  }

  if (/safari/.test(userAgent) && !/chrome/.test(userAgent)) {
    return 'Use the Share menu, then choose Add to Dock or Add to Home Screen.'
  }

  return 'Use your browser menu and choose Install app or Add to Home screen.'
}

function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [installInstructions, setInstallInstructions] = useState('')

  useEffect(() => {
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true

    if (isInstalled) return undefined

    setInstallInstructions(getInstallInstructions())
    setIsOpen(true)

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallEvent(event)
      setIsOpen(true)
    }

    const handleAppInstalled = () => {
      setInstallEvent(null)
      setIsOpen(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!installEvent) {
      setIsOpen(false)
      return
    }

    await installEvent.prompt()
    setInstallEvent(null)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="install-prompt-backdrop" role="presentation">
      <section className="install-prompt" role="dialog" aria-modal="true" aria-labelledby="install-title">
        <p className="install-prompt-label">TalkToJay app</p>
        <h2 id="install-title">Install TalkToJay?</h2>
        <p className="install-prompt-copy">
          {installEvent
            ? 'Get quick access to use the app to start chatting with Jay.'
            : installInstructions}
        </p>
        <div className="install-prompt-actions">
          <button className="install-prompt-install" type="button" onClick={handleInstall}>
            {installEvent ? 'Install app' : 'Got it'}
          </button>
          <button className="install-prompt-dismiss" type="button" onClick={() => setIsOpen(false)}>
            Continue in browser
          </button>
        </div>
      </section>
    </div>
  )
}

function App() {
  return (
    <>
      <InstallPrompt />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mainpage" element={<Chatbot />} />
      </Routes>
    </>
  )
}

export default App