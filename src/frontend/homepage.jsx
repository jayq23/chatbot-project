import { useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import '../styles/homepage.css'
import logo from '../assets/robot.png'

function Homepage() {
  const navigate = useNavigate()
  const textRef = useRef(null)
  const boltLeftRef = useRef(null)
  const boltRightRef = useRef(null)

  const handleSignIn = () => {
    navigate('/login')
  }
  const handleSignUp = () => {
    navigate('/register')
  }

  useEffect(() => {
    const txt = textRef.current
    const b1 = boltLeftRef.current
    const b2 = boltRightRef.current

    function strike() {
      txt.style.textShadow = '0 0 8px #fff, 0 0 20px #6be8ff, 0 0 45px #2fa8ff, 0 0 90px #2fa8ff'
      txt.style.color = '#eafcff'
      b1.style.opacity = '1'
      setTimeout(() => {
        txt.style.color = '#fff'
        txt.style.textShadow = 'none'
        b1.style.opacity = '0'
      }, 70)
      setTimeout(() => {
        txt.style.textShadow = '0 0 6px #fff, 0 0 16px #6be8ff, 0 0 35px #2fa8ff'
        txt.style.color = '#eafcff'
        b2.style.opacity = '1'
      }, 140)
      setTimeout(() => {
        txt.style.color = '#fff'
        txt.style.textShadow = 'none'
        b2.style.opacity = '0'
      }, 210)
    }

    strike()
    const interval = setInterval(strike, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="home-wrapper">
      <img className='logo' src={logo} alt="TalkToJay Logo" />
      <h1>Welcome to <br />
        <span className="brand-name-wrap">
          <svg ref={boltLeftRef} className="bolt bolt-left" viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <filter id="jag">
                <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" result="n" />
                <feDisplacementMap in="SourceGraphic" in2="n" scale="6" />
              </filter>
            </defs>
            <polygon points="38,0 8,90 26,90 14,200 55,70 32,70" fill="#c9f3ff" filter="url(#jag)" />
          </svg>
          <span ref={textRef} className="brand-name">TalkToJay</span>
          <svg ref={boltRightRef} className="bolt bolt-right" viewBox="0 0 60 200" xmlns="http://www.w3.org/2000/svg">
            <polygon points="38,0 8,90 26,90 14,200 55,70 32,70" fill="#c9f3ff" filter="url(#jag)" />
          </svg>
        </span>
      </h1>
      <div className="buttons">
        <button className="signinbtn" onClick={handleSignIn}>Sign In</button>
        <button className="signupbtn" onClick={handleSignUp}>Sign Up</button>
      </div>
      <footer>
        <p>© 2026 TalkToJay. Powered by AI, fueled by your humor.</p>
      </footer>
    </div>
  );
}

export default Homepage;