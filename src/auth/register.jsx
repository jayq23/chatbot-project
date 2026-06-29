import '../styles/register.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { auth, db } from '../../firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if(username === '' || email === '' || password === '' || confirmPassword === '') {
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
      setConfirmPassword('');
      return;
    }
    if(password !== confirmPassword) {
      alert('Passwords do not match');
      setPassword('');
      setConfirmPassword('');
      return;
    }

    try {
      setLoading(true);

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Save username to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        createdAt: new Date()
      })

      alert('Registration successful! Please log in.')
      navigate('/login')

    } catch (error) {
      if(error.code === 'auth/email-already-in-use') {
        alert('Email is already registered!')
      } else {
        alert('Registration failed: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="registerForm">
      <button className="regbackbtn" onClick={() => navigate(-1)}>back</button>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        <button className='regbtn' type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  )
}

export default Register;