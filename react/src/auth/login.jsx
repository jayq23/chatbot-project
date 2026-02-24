import '../styles/login.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { auth, db } from '../../firebase'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'
import facebook from '../assets/facebook.png'
import google from '../assets/google.png'

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if(username === '' || password === '') {
      alert('Please fill in all fields');
      return;
    }
    if(username.length < 3) {
      alert('Username must be at least 3 characters');
      setUsername('');
      return;
    }
    if(username.length > 15) {
      alert('Username must be less than 15 characters');
      setUsername('');
      return;
    }
    if(password.length < 6) {
      alert('Password must be at least 6 characters');
      setPassword('');
      return;
    }

    try {
      setLoading(true);

      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('username', '==', username))
      const querySnapshot = await getDocs(q)

      if(querySnapshot.empty) {
        alert('Username not found!')
        setUsername('');
        setPassword('');
        return;
      }

      const userDoc = querySnapshot.docs[0].data()
      const email = userDoc.email

      await signInWithEmailAndPassword(auth, email, password)
      navigate('/chatbot')

    } catch (error) {
      if(error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        alert('Invalid credentials!')
      } else {
        alert('Login failed: ' + error.message)
      }
      setPassword('');
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', user.email))
      const querySnapshot = await getDocs(q)

      if(querySnapshot.empty) {
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName,
          email: user.email,
          createdAt: new Date()
        })
      }

      navigate('/mainpage')
    } catch (error) {
      alert('Google login failed: ' + error.message)
    }
  }

  const handleFacebookLogin = async () => {
    try {
      const provider = new FacebookAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('email', '==', user.email))
      const querySnapshot = await getDocs(q)

      if(querySnapshot.empty) {
        await setDoc(doc(db, 'users', user.uid), {
          username: user.displayName,
          email: user.email,
          createdAt: new Date()
        })
      }

      navigate('/mainpage')
    } catch (error) {
      alert('Facebook login failed: ' + error.message)
    }
  }

  return (
    <div className="loginForm">
      <button className='backbtn' onClick={() => navigate(-1)}>back</button>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input 
          className='userUsername' 
          type="text" 
          placeholder="Username" 
          required 
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          className='userPass' 
          type={showPassword ? 'text' : 'password'}
          placeholder="Password" 
          required 
          id="passwordInput"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className='checkboxline'>
          <input 
            type="checkbox" 
            className='showPass' 
            name="showPassword" 
            id="showPassword" 
            onChange={() => setShowPassword(!showPassword)} 
          />
          <label htmlFor="showPassword" className='show'>Show Password</label>
        </div>
        <button className='loginbtn' type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className='socialLogin'>
        <button className="googlebtn" onClick={handleGoogleLogin}>
          <img src={google} alt="Google" /> Login with Google
        </button>
        <button className="facebookbtn" onClick={handleFacebookLogin}>
          <img src={facebook} alt="Facebook" /> Login with Facebook
        </button>
      </div>
    </div>
  )
}

export default Login;