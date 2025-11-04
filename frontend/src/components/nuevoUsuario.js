import React, { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../img/ESLOGAN CONI.png";
import "./estilos.css";

const NuevoUsuario = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { nombre, cedula, email } = location.state || {};

  const [usuarioData, setUsuarioData] = useState({
    nombre: nombre || '',
    cedula: cedula || '',
    rol: 'estandar',
    email: email || '',
    username: cedula || '',
    password: cedula || ''
  });

  useEffect(() => {
    setUsuarioData(prev => ({
      ...prev,
      nombre: nombre || '',
      cedula: cedula || '',
      email: email || '',
      username: cedula || prev.nombreUsuario
    }));
  }, [nombre, cedula, email]);

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

  const handleChange = (e) => {
    const {name, value} = e.target;
    if(name === "cedula"){
    setUsuarioData(prev => ({ 
      ...prev, 
      cedula: value, 
      username: value })); // Auto-rellenar el campo de usuario con la cédula.
      } else{
        setUsuarioData(prev => ({...prev, [name]: value}) );
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Datos a enviar para crear usuario:", usuarioData);

    try {
      const response = await fetch("http://localhost:8080/CONI/CrearUsuarioServlet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(usuarioData),
        credentials: "include"
      });

      const responseText = await response.text();
      let data = {};
      try {
        const parsedJson = JSON.parse(responseText);
          if (parsedJson && typeof parsedJson.message === 'string') {
              data = parsedJson;
          } else {
              // Si es JSON pero no tiene 'message', o el mensaje es vacío
              data.message = responseText; 
          }
      } catch (jsonError) {
          // Si no se puede parsear como JSON, usa el texto crudo como mensaje
          console.error("Error al parsear la respuesta del servidor como JSON:", jsonError);
          console.error("Respuesta del servidor (texto crudo que causó el error de parseo):", responseText);
          data.message = responseText;
      }
      
      // *** ESTE console.log ES CLAVE PARA LA DEPURACIÓN ***
      console.log("Respuesta del servidor (procesada):", data); 

      if (response.ok){
        alert("Usuario creado exitosamente: " + data.message);
        navigate('/EmpleadoForm'); 
      } else {
        alert(`Error al crear usuario: ${data.message}`);
        console.error("Error al crear el usuario. Estado:", response.status, "Mensaje:", data.message);

        // --- LÓGICA DE REDIRECCIÓN CLAVE AQUÍ ---
        // Se espera un status 404 (SC_NOT_FOUND) del backend para el caso de empleado inexistente
        if (response.status === 404) { 
            console.log("Mensaje de empleado inexistente detectado por status 404. Redirigiendo...");
                navigate('/EmpleadoForm');
        } else {
            console.log("Error no relacionado con empleado inexistente. No redirigiendo.");
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de red al crear el usuario");
    }
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
              <li><a href="/gestionUsuario">Gestion de usuarios</a></li>
              <li><button onClick={handleLogout}>Cerrar sesión</button></li>
            </ul>
          </nav>
        </div>
      </section>

      <main>
        <div className="container gestion-empleado">
          <div className="nuevo-empleado">
            <h2>Crear usuario</h2>
            <form onSubmit={handleSubmit}>
              <label htmlFor="Nombre">Nombre y apellidos:</label>
              <input type="text" name="nombre" value={usuarioData.nombre} onChange={handleChange} required />

              <label htmlFor="Cedula">Cédula:</label>
              <input type="number" name="cedula" value={usuarioData.cedula} onChange={handleChange} required />

              <label htmlFor="rol">Rol a desempeñar:</label>
              <select name="rol" value={usuarioData.rol} onChange={handleChange} required>
                <option value="">-- Selecciona un rol --</option>
                <option value="admin">Administrador</option>
                <option value="usuario">Usuario</option>
              </select>

              <label htmlFor="username">Usuario:</label>
              <input type="text" name="username" value={usuarioData.username} onChange={handleChange} required />

              <label htmlFor="email">Correo electrónico:</label>
              <input type="email" name="email" value={usuarioData.email} onChange={handleChange} required />

              <label htmlFor="password">Contraseña:</label>
              <input type="password" name="password" value={usuarioData.password} onChange={handleChange} required />

              <button type="submit">Crear usuario</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NuevoUsuario;
