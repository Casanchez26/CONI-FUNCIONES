import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import './estilos.css';
import actaGif from '../img/acta.gif';
import comprasGif from '../img/compras.gif';
import empleadosGif from '../img/empleados.gif';
import computadoraGif from '../img/computadora.gif';
import genearInformeGif from '../img/generar informe.gif';


const PerfilUsuario = () => {
  const navigate = useNavigate();
  const [usuarioLogueadoData, setUsuarioLogueadoData] = useState(null);

    useEffect(() => {
      try {
        const storedUserJSON = localStorage.getItem("usuarioLogueado");
        if (storedUserJSON) {
          const parsedUser = JSON.parse(storedUserJSON);
          setUsuarioLogueadoData(parsedUser);

          if (parsedUser?.rolAutenticacion !== "usuario") {
            console.log("perfilUsuario: Rol incorrecto, redirigiendo a login.");
            navigate("/login");
          }
        } else {
          console.log("PerfilUsuario: No hay datos de sesión, redirigiendo a login.");
          navigate("/login");
        }
      } catch (e) {
        console.error("Error al leer datos del usuario de localStorage", e);
        navigate("/login");
      }
    }, [navigate]);

    const handleLogout = () => {
      localStorage.removeItem("usuarioLogueado");
      localStorage.setItem("logoutMessage", "Sesión cerrada exitosamente");
      navigate("/login");
    };

    if (!usuarioLogueadoData) {
      return <div>Cargando perfil...</div>;
    }

  return(
    <div>
    <section className="encabezado">
        <img src={logo} alt="Eslogan de CONI - Gestión de inventario" className="imagen-encabezado"/>
        <div className="barra-superior">
            <nav>
                <ul>
                    <li><button className='cerrarSesion' onClick={handleLogout}>Cerrar sesión</button></li>
                </ul>
            </nav>
        </div>
    </section>

    <main>
        <h2 className="titulo perfil-usuario">¿Que deseas gestionar hoy?</h2>
        <div className="contenido">
            <div className="gestion-equi-perif">
                <a href="/equipo"><img src={computadoraGif} alt="gestionar_equipos"/></a>
                <div className="container text-equipos">
                    <button><a href="/equipo">Equipos/Perifericos</a></button>
                </div>
            </div>
            <div className="gestion-compras">
                <a href="/ComprasForm"><img src={comprasGif} alt="compras"/></a>
                <div className="container text-compras">
                    <button><a href="/ComprasForm">Compras</a></button>
                </div>
            </div>
            <div className="gestion-actas">
                <a href="/ActaForm"><img src={actaGif} alt="acta"/></a>
                <div className="container text-actas">
                    <button><a href="/ActaForm">Actas</a></button>
                </div>
            </div>
            <div className="gestion-empleados">
                <a href="/EmpleadoForm"><img src={empleadosGif} alt="gestion_empleados"/></a>
                <div className="container text-empleados">
                    <button><a href="/EmpleadoForm">Empleados</a></button>
                </div>
            </div>
                   </div>
    </main>

</div>
  );
};

export default PerfilUsuario;