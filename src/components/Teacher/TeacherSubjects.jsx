import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Component for rendering individual subject cards
const SubjectCard = ({ subject, availability, price,location }) => {
  return (
    <div className="card m-3" style={{ width: "18rem" }}>
      <div className="card-body">
        <h5 className="card-title">{subject}</h5>
        <p className="card-text">Disponibilidad: {availability}</p>
        <p className="card-text">Precio: ${price}</p>
        <p className="card-text">Modalidad: ${location}</p>
      </div>
    </div>
  );
};

// TeacherSubjects component
const TeacherSubjects = ({ userId }) => {
  const [subjects, setSubjects] = useState([]); // State to store fetched subjects
  const [error, setError] = useState(null);    // State to handle errors during fetching

  useEffect(() => {
    // Function to fetch subjects data from the server
    const fetchSubjects = async () => {
      try {
        // Fetch subjects data using userId via POST request
        const response = await fetch('http://localhost:3001/teacherSubjects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }), // Send userId in the request body
        });

        // Check if response is successful (status 200-299)
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        // Parse response data as JSON
        const data = await response.json();
        // Update subjects state with fetched data
        setSubjects(data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        // Set error state if there's an error during fetch
        setError(error.message);
      }
    };

    // Call fetchSubjects function when userId changes
    fetchSubjects();
  }, [userId]); // useEffect dependency on userId to re-fetch subjects when userId changes

  return (
    <div className="container d-flex flex-wrap justify-content-center">
      {/* Conditional rendering based on error state */}
      {error ? (
        <p>{error}</p>
      ) : (
        // Map through subjects state and render SubjectCard for each subject
        subjects.map((subject) => (
          <SubjectCard key={subject.teacher_id} subject={subject.subject_name} availability={subject.availability} price={subject.precio_clase} location={subject.location} />
        ))
      )}
      {/* Link to create new subject (replace with appropriate route) */}
      <Link to="/CreateSubject" className="card m-3" style={{ width: "18rem", textDecoration: "none" }}>
        <div className="card-body d-flex align-items-center justify-content-center">
          <h5 className="card-title">+</h5>
        </div>
      </Link>
    </div>
  );
};

export default TeacherSubjects;
