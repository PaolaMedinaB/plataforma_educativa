import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SimpleHeader from '../General/SimpleHeader';
import Footer from '../General/Footer';

function Signup() {
  const navigate = useNavigate(); // Use useNavigate hook from react-router-dom

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    rol: '', // Initialize rol as an empty string or another appropriate initial value
  });

  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value, // Keep the value unchanged for other fields
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!formData.nombre || !formData.correo || !formData.contrasena || !formData.rol) {
      console.error('All fields are required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('User created:', data);
        setAlertMessage('¡Usuario creado correctamente!');
        navigate('/Login'); // Redirect to the login page
      } else {
        console.error('Error creating user:', response.statusText);
        setAlertMessage('Error al crear usuario. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setAlertMessage('Error al crear usuario. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <>
      <div className="d-flex flex-column min-vh-100">
        <SimpleHeader />
        <div className="container flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3">
          <h2 className="mb-4">¡Regístrate!</h2>
          {alertMessage && (
            <div className="alert alert-success" role="alert">
              {alertMessage}
            </div>
          )}
          <form className="w-100 " style={{ maxWidth: '400px' }} onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre Completo:
              </label>
              <input type="text" id="nombre" name="nombre" className="form-control" required onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="correo" className="form-label">
                Correo electrónico:
              </label>
              <input type="email" id="correo" name="correo" className="form-control" required onChange={handleChange} />
            </div>
            <div className="mb-3">
              <label htmlFor="contrasena" className="form-label">
                Contraseña:
              </label>
              <input
                type="password"
                id="contrasena"
                name="contrasena"
                className="form-control"
                required
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="rol" className="form-label">
                Rol:
              </label>
              <select id="rol" name="rol" className="form-select" required onChange={handleChange}>
                <option value="">Selecciona rol</option>
                <option value="estudiante">Estudiante</option>
                <option value="profesor">Profesor</option>
              </select>
            </div>

            <input type="submit" value="Registrarse" className="btn btn-success bg-custom-primary w-100" />
            <div className="mt-3">
              <span>¿Ya tienes una cuenta?</span>{' '}
              <Link to="/Login" className="text-decoration-none text-primary">
                Inicia sesión
              </Link>
            </div>
          </form>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Signup;
