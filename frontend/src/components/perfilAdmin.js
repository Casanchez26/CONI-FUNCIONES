import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import empleadosGif from '../img/empleados.gif';
import gestionarUsuarioGif from '../img/gestionar usuario.gif';
import generarInformeGif from '../img/generar informe.gif';
import './estilos.css'; // Asegúrate que el CSS esté importado

const PerfilAdmin = () => {
  const navigate = useNavigate();
  // Estado para guardar los datos del usuario.
  const [usuarioLogueadoData, setUsuarioLogueadoData] = useState(null);

  useEffect(() => {
    try {
      // 1. Intentamos obtener el objeto de usuario completo del localStorage.
      const storedUserJSON = localStorage.getItem("usuarioLogueado");

      if (storedUserJSON) {
        // Convertimos el texto JSON a objeto de JavaScript.
        const parsedUser = JSON.parse(storedUserJSON);
        setUsuarioLogueadoData(parsedUser);

        // 2. Verificamos el rol. Si el rol es INCORRECTO, redirigimos.
        //    Si el rol es "admin", simplemente continuamos.
        if (parsedUser?.rolAutenticacion !== "admin") {
          console.log("perfilAdmin: Rol incorrecto, redirigiendo a login.");
          navigate("/login");
        }
        // *** CORRECCIÓN APLICADA AQUÍ ***
        // El bloque `else` anterior ha sido eliminado para que el 'admin' continúe.

      } else {
        // 3. Si NO hay datos en localStorage, el usuario no está logueado.
        console.log("perfilAdmin: No hay datos de sesión, redirigiendo a login.");
        navigate("/login");
      }
    } catch (e) {
      console.error("Error al leer datos del usuario de localStorage", e);
      // En caso de error, redirigimos para evitar que la página se rompa.
      navigate("/login");
    }
  }, [navigate]); // Dependencia del hook

  const handleLogout = () => {
    // Limpiamos el localStorage para simular el cierre de sesión.
    localStorage.removeItem("usuarioLogueado");
    localStorage.setItem("logoutMessage", "Sesión cerrada exitosamente");
    // Redirigir a la página de inicio de sesión
    navigate("/login");
  };

  // Mostrar "Cargando" mientras se obtienen los datos.
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