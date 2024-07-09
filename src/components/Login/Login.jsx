import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SimpleHeader from "../General/SimpleHeader.jsx";
import Footer from "../General/Footer.jsx";
import axios from 'axios';

function Login() {
  const navigate = useNavigate(); 
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { correo, contrasena });
      setMessage(response.data.message);
      // Handle successful login, e.g., redirect to dashboard or store user data
      if (response.data.success) {
        setMessage(response.data.message);
        // Guarda el token en el almacenamiento local
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userName', response.data.name);
        // Redirige al usuario a su perfil
        if (response.data.role === 'profesor') {
          navigate('/TeacherHome');
        } else  {
          navigate('/StudentHome');
        }
      }
    } catch (error) {
      setMessage(error.response.data.message);
    }
  };

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <SimpleHeader />
        <div className="container flex-grow-1 d-flex flex-column justify-content-center align-items-center">
          <h2 className="mb-4">Bienvenid@</h2>
          <form className="w-100" style={{ maxWidth: "400px" }} onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">Correo:</label>
              <input
                type="text"
                id="correo"
                name="correo"
                className="form-control"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="contrasena" className="form-label">Contraseña:</label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                className="form-control"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
            <input type="submit" value="Ingresar" className="btn btn-success bg-custom-primary w-100" />
          </form>
          {message && <div className="mt-3 alert alert-info">{message}</div>}
          <div className="mt-3">
            <Link to="/Signup" className="text-decoration-none text-primary">
              <span>¿No tienes una cuenta?</span>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Login;
