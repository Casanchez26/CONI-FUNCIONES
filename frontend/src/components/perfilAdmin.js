// src/components/PerfilAdmin.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import empleadosGif from '../img/empleados.gif';
import gestionarUsuarioGif from '../img/gestionar usuario.gif';
import generarInformeGif from '../img/generar informe.gif';
import './estilos.css'; // Asegúrate que el CSS esté aquí

const PerfilAdmin = () => {
  const navigate = useNavigate();
  // Estado para guardar los datos del usuario.
  const [usuarioLogueadoData, setUsuarioLogueadoData] = useState(null);

  useEffect(() => {
    try {
      // Intentamos obtener el objeto de usuario completo del localStorage.
      const storedUserJSON = localStorage.getItem("usuarioLogueado");
      if (storedUserJSON) {
        // EXPLICACIÓN: JSON.parse()
        // Convertimos el texto JSON (JavaScript Object Notation) en un objeto de JavaScript.
        // Esto es necesario porque localStorage solo almacena texto.
        const parsedUser = JSON.parse(storedUserJSON);
        setUsuarioLogueadoData(parsedUser);

        // Verificamos el rol directamente desde el objeto que acabamos de leer
        if (parsedUser?.rolAutenticacion !== "admin") {
          console.log("perfilAdmin: Rol incorrecto, redirigiendo a login.");
          navigate("/login");
        }
        else {
          // si no hay datos en localStorage, el usuario no está logueado.
          console.log("perfilAdmin: No hay datos de usuario, redirigiendo a login.");
          navigate("/login");
        }
      }
    } catch (e) {
      console.error("Error al leer datos del usuario de localStorage", e);
      // En caso de error, redirigimos para evitar que la página se rompa.
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    // Ya no necesitamos la llamada al backend para cerrar sesión,
    // simplemente limpiamos el localStorage para simular el cierre.
    localStorage.removeItem("usuarioLogueado");
    localStorage.setItem("logoutMessage", "Sesión cerrada exitosamente");
    // Redirigir a la página de inicio de sesión
    navigate("/login");
  };

  if (!usuarioLogueadoData) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div>
      <header className="encabezado">
        <img src={logo} alt="Eslogan de CONI - Gestión de inventario" className="imagen-encabezado" />
        <div className="barra-superior">
          <nav>
            <ul>
              <li><a href="/cambiar-password">Cambiar contraseña</a></li>
              <li><button onClick={handleLogout}>Cerrar sesión</button></li>
            </ul>
          </nav>
        </div>
      </header>

      <h2 className="titulo perfil-administrador">¿Qué deseas gestionar hoy?</h2>

      <div className="contenidoPerfilAdmin">
        <div className="container gestion-administrador">

          <div className="gestion-usuario">
            <a href="/gestionUsuario">
              <img src={gestionarUsuarioGif} alt="Gestionar Usuario" />
            </a>
            <div className="container text-usuarios">
              <button><a href="/gestionUsuario">Usuarios</a></button>
              <p>Administra y controla los perfiles de acceso al sistema</p>
            </div>
          </div>

          <div className="gestion-empleados">
            <a href="/EmpleadoForm"><img src={empleadosGif} alt="gestion_empleados" /></a>
            <div className="container text-empleados">
              <button><a href="/EmpleadoForm">Empleados</a></button>
              <p>Acceso a la gestión de información sobre los empleados</p>
            </div>
          </div>

          <div className="informe">
            <a href="/InformeModulo">
              <img src={generarInformeGif} alt="Generar Informe" />
            </a>
            <div className="container text-informe">
              <button><a href="/InformeModulo">Generar informe</a></button>
              <p>Obtener informes detallados sobre el estado del inventario</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PerfilAdmin;
