import SimpleHeader from "../General/SimpleHeader";
import { useState, useEffect } from "react";
import axios from "axios";

function CreateSubject() {
  const [materia, setMateria] = useState("");
  const [availability, setAvailability] = useState("");
  const [precio, setPrecio] = useState("");
  const [location, setLocation] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch subjects from the backend
    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/subjects');
        setSubjects(response.data); // Update state with subjects data
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchSubjects();
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    // Retrieve userId from local storage
    const userId = localStorage.getItem('userId');

    if (!userId) {
      alert('User not logged in');
      return;
    }

    // Prepare data for submission
    const formData = {
      userId, // Include userId in formData
      materia,
      availabilityDate: availability.split("T")[0], // Extract date from ISO string
      availabilityTime: availability.split("T")[1], // Extract time from ISO string
      precio: parseFloat(precio), // Convert to float
      location,
    };

    try {
      const response = await axios.post('http://localhost:3001/api/createsubject', formData);

      // Display success message using alert
      alert(response.data.message);

      // Redirect to TeacherHome after successful creation
      if (response.status === 201) {
        setTimeout(() => {
          window.location.href = '/TeacherHome';
        }, 1000); // Redirect after 1 second
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to create subject. Please try again.');
    }
  };

  return (
    <>
      <SimpleHeader />
      <div className="container my-4">
        <h2>Crear nueva materia</h2>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-3">
            <label htmlFor="subject" className="form-label">
              Materia:
            </label>
            <select
              id="subject"
              name="subject"
              className="form-select"
              value={materia}
              onChange={(e) => setMateria(e.target.value)}
              required
            >
              <option value="">Seleccionar materia</option>
              {subjects.map((subject) => (
                <option key={subject.subject_id} value={subject.name}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="availability" className="form-label">
              Disponibilidad:
            </label>
            <input
              type="datetime-local"
              id="availability"
              name="availability"
              className="form-control"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">
              Precio:
            </label>
            <input
              type="number"
              id="price"
              name="price"
              className="form-control"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="location" className="form-label">
              Localización:
            </label>
            <select
              id="location"
              name="location"
              className="form-select"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            >
              <option value="">Seleccionar localización</option>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success bg-custom-primary">
            Crear materia
          </button>
        </form>
      </div>
    </>
  );
}

export default CreateSubject;
