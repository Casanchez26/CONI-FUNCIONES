import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import './estilos.css';

function Home() {
  const [mensajeLogout, setMensajeLogout] = useState(null);

  useEffect(() => {
    const mensaje = localStorage.getItem("logoutMessage");
    if (mensaje) {
      setMensajeLogout(mensaje);
      localStorage.removeItem("logoutMessage");

      setTimeout(() => {
        setMensajeLogout(null);
      }, 3000);
    }
  }, []);

  return (
    <div>
      <header className="encabezado">
        <img src={logo} alt="Eslogan de CONI" className="imagen-encabezado" />
        <div className="barra-superior">
          <nav>
            <ul>
              <li><Link to="/login">Ingresa</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {mensajeLogout && (
        <div className="mensaje-logout" style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "10px",
          margin: "10px auto",
          borderRadius: "5px",
          width: "fit-content",
          textAlign: "center"
        }}>
          {mensajeLogout}
        </div>
      )}

      <h1 className='textoIndex'>Optimiza tu inventario, maximiza tu negocio.</h1>
    </div>
  );
}

export default Home;