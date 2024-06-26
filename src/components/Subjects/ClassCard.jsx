const ClassCard = ({ subject, teacher, availability, price }) => {
  return (
    <div className="card m-3" style={{ width: "18rem" }}>
      <div className="card-body">
        <h5 className="card-title">{subject}</h5>
        <h6 className="card-subtitle mb-2 text-muted">{teacher}</h6>
        <p className="card-text">Disponibilidad: {availability}</p>
        <p className="card-text">Precio: ${price}</p>
        <button className="btn btn-primary">Reservar</button>
      </div>
    </div>
  );
};

export default ClassCard;
