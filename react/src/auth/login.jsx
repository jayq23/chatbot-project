import '../styles/login.css'
import { useNavigate } from 'react-router-dom'
function Login() {
  const navigate = useNavigate();
  
  // Example account
  const exampleAccount = {
    username: 'user',
    password: 'user123'
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const form = e.target;
    const username = form[0].value;
    const password = form[1].value;

    if(username === '' || password === '') {
      alert('Please fill in all fields');
      return;
    }
    if(password.length < 6) {
      alert('Password must be at least 6 characters');
      form[1].value = '';
      return;
    }
    if(username.length < 3) {
      alert('Username must be at least 3 characters');
      form[0].value = '';
      return;
    }
    if(username.length > 15) {
      alert('Username must be less than 15 characters');
      form[0].value = '';
      return;
    }

    // Check stored user credentials first
    const storedUser = localStorage.getItem('user_' + username);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.password === password) {
        localStorage.setItem('currentUser', username);
        navigate('/chatbot');
        return;
      } else {
        alert('Invalid credentials');
        form[0].value = '';
        form[1].value = '';
        return;
      }
    }
    
    // Fall back to example account
    if (username === exampleAccount.username && password === exampleAccount.password) {
      localStorage.setItem('currentUser', username);
      navigate('/chatbot');
    } else {
      alert('Invalid credentials');
      form[0].value = '';
      form[1].value = '';
    }
  }
  const handleshowpassword = () => {
    const passwordInput = document.getElementById('passwordInput');
    if(passwordInput.type === "password"){
      passwordInput.type = "text";
    } else {
      passwordInput.type = "password";
    }
  }
  
  return (
    <div className="loginForm">
      <button className='backbtn' onClick={() => navigate(-1)}>back</button>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="text" placeholder="Username" required />
        <input type="password" placeholder="Password" required id="passwordInput" />
        <div className='checkboxline'>
        <input type="checkbox" className='showPass' name="showPassword" id="showPassword" onChange={handleshowpassword} />
        <label htmlFor="showPassword" className='show'>Show Password</label>
        </div>
        <button className='loginbtn' type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login;