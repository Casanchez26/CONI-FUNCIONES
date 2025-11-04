import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../img/ESLOGAN CONI.png";
import "./estilos.css";

function ModificarUsuario() {
  const [cedula, setCedula] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();
  // Verifica si el usuario está logueado
  useEffect(() => {
    const usuario = localStorage.getItem("usuarioLogueado");
    if (!usuario) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8080/CONI/LogoutServlet", {
        method: "GET",
        credentials: "include"
      });

      if (response.ok) {
        localStorage.removeItem("usuarioLogueado");
        localStorage.removeItem("rol");
        sessionStorage.clear();
        localStorage.setItem("logoutMessage", "Sesión cerrada exitosamente");
        navigate("/");
      } else {
        console.error("Error al cerrar sesión, status:", response.status);
      }
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleBuscar = () => {
    fetch(`http://localhost:8080/CONI/api/usuarios/cedula?cedula=${cedula}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Usuario no encontrado");
        }
        return response.json();
      })
      .then(data => {
        setUsuario(data);
        setMensaje("");
      })
      .catch(error => {
        setMensaje("Usuario no encontrado");
        setUsuario(null);
      });
  };

  const handleModificar = () => {
    if (!usuario) return;
    fetch(`http://localhost:8080/CONI/api/usuarios/modificar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(usuario)
    })
      .then(response => response.json())
      .then(data => setMensaje(data.mensaje || data.error));
  };

  const handleEliminar = () => {
    if (!usuario) return;
    if (window.confirm("¿Seguro que deseas eliminar este usuario?")) {
      fetch(`http://localhost:8080/CONI/api/usuarios/eliminar?id=${usuario.id}`, {
        method: "DELETE",
        credentials: "include",
      })
        .then(async response => {
          const data = await response.json();
          setMensaje(data.mensaje || data.error);
          if (response.ok) {
            setMensaje(data.mensaje);
            setUsuario(null);
            setCedula("");
          } else {
            setMensaje(data.error || "Error al eliminar el usuario");
          }
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });
  };

  return (
    <div>
      <section className="encabezado">
        <img
          src={logo}
          alt="Eslogan de CONI - Gestión de inventario"
          className="imagen-encabezado"
        />
        <div className="barra-superior">
          <nav>
            <ul>
              <li><a href="gestionUsuario">Gestionar usuario</a></li>
              <li><button onClick={handleLogout}>Cerrar sesión</button></li>
            </ul>
          </nav>
        </div>
      </section>

<main className="gestion-usuario-modificar-main">

                <h2 className="titulo modificar-usuario">Modificar Usuario</h2>

                <div className="search-and-modify-card"> {/* Tarjeta principal */}

                    <div className="search-section"> {/* Sección de búsqueda */}
                        <label className="instrucciones">Ingrese la cédula del usuario que desea modificar o eliminar:</label>
                        <input
                            className="input-cedula"
                            type="text"
                            placeholder="Ingrese N° cédula"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            required
                        />
                        <button onClick={handleBuscar}>Buscar</button>
                    </div>

                    {mensaje && <p className="message-display">{mensaje}</p>} {/* Mensaje */}

                    {usuario && (
                        <div className="modify-user-form-container"> {/* Contenedor del formulario de modificación */}
                            <label htmlFor="nombre">Nombre y apellidos:</label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                placeholder="ingrese el nombre y apellidos"
                                value={usuario.nombre}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="cedula">Cédula:</label>
                            <input
                                type="text"
                                id="cedula"
                                name="cedula"
                                placeholder="ingrese la cédula"
                                value={usuario.cedula}
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="rol">Rol a desempeñar:</label>
                            <select
                                name="rol"
                                id="rol"
                                placeholder="Seleccione un rol"
                                onChange={handleChange}
                                value={usuario.rol}
                                required
                            >
                                <option value="admin">Administrador</option>
                                <option value="usuario">Usuario</option>
                            </select>

                            <input type="hidden" name="username" value={usuario.username} />

                            <label htmlFor="email">Correo electrónico:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={usuario.email}
                                placeholder="ingrese el e-mail"
                                onChange={handleChange}
                                required
                            />

                            <label htmlFor="password">Contraseña:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={usuario.password}
                                placeholder="ingrese una contraseña"
                                onChange={handleChange}
                                required
                            />

                            <button onClick={handleModificar}>
                                Modificar usuario
                            </button>
                            <button onClick={handleEliminar}>
                                Eliminar
                            </button>
                        </div>
                    )}
                </div> {/* Cierre de search-and-modify-card */}
            </main>
        </div>
    );
}

export default ModificarUsuario;