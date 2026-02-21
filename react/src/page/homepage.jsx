import { useNavigate } from 'react-router-dom'
import '../styles/homepage.css'
import logo from '../assets/robot.png'

function Homepage() {
  const navigate = useNavigate()
  
  const handleSignIn = () => {
    navigate('/login')
  }
  
  const handleSignUp = () => {
    navigate('/register')
  }
  
  return (
    <div className="home-wrapper">
      <img className='logo' src={logo} alt="renz Chatbot Logo" />
      <h1>Welcome to Renz Chatbot!</h1>
      <div className="buttons">
        <button className="signinbtn" onClick={handleSignIn}>sign in</button>
        <button className="signupbtn" onClick={handleSignUp}>Sign Up</button>
      </div>
      <footer>
        <p>© 2024 renz Chatbot. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Homepage;