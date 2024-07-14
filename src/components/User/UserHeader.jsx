import { Link, useNavigate } from "react-router-dom";

const UserHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any authentication data if stored (e.g., token, userId)
    localStorage.removeItem('userId'); // Adjust as per your authentication mechanism
    // Redirect to login page
    navigate('/login');
  };

  return (
    <>
      <header className="bg-custom-primary">
        <div className="container d-flex justify-content-between align-items-center">
          <p className="h1 text-white">EduConecta</p>

          <div className="dropdown">
            <button
              className="btn btn-outline-success bg-custom-white dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-fill me-2"></i> Tu Perfil
            </button>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
              <li>
                <Link className="dropdown-item" to="/EditProfile">
                  Editar perfil
                </Link>
              </li>
              <li>
                <button className="dropdown-item" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>
    </>
  );
};

export default UserHeader;
