import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import './estilos.css'; // copia tu CSS de sesion.css aquí

function Login() {

  // --- EXPLICACIÓN: useState ---
  // useState es un "hook" de React. Los hooks nos permiten usar el estado
  // y otras características de React en componentes de función.
  // En este caso, creamos un estado 'formData' para guardar los datos del formulario.
  // NOTA: Hemos quitado el campo 'rol' de aquí, ya que no lo necesitamos más.

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // --- EXPLICACIÓN: useEffect ---
  // Este hook ejecuta un código cada vez que el componente se renderiza.
  // El array vacío `[]` al final le dice a React que solo ejecute este código una vez,
  // cuando el componente se "monta" (cuando aparece en la página por primera vez).
  // Lo usamos para limpiar el localStorage.

  useEffect(() => {

    // Limpiamos el localStorage de cualquier sesión anterior.
    // Esto asegura que la aplicación empiece siempre de forma limpia.
    localStorage.removeItem("usuarioLogueado");

    // También limpiamos los campos del formulario por si acaso.
    localStorage.removeItem("idUsuario");
    localStorage.removeItem("cargoEmpleado");

    const logoutMessage = localStorage.getItem("logoutMessage");
    if (logoutMessage) {
      setMensaje(logoutMessage);
      localStorage.removeItem("logoutMessage"); // Limpia el mensaje después de leerlo
    }
  }, []); // El array vacío `[]` es crucial para que solo se ejecute una vez.

  // --- EXPLICACIÓN: handleChange ---
  // Esta función es llamada cada vez que el usuario escribe en los campos del formulario.
  // Usa la sintaxis `...formData` para crear una copia de los datos actuales del formulario,
  // y luego actualiza solo el campo que ha cambiado ([e.target.name] con su e.target.value).
  // Ahora solo maneja 'username' y 'password'.
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // --- EXPLICACIÓN: handleSubmit ---
  // Esta función se activa cuando el usuario envía el formulario.
  // Envía los datos al servidor (backend) y maneja la respuesta.
  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje(''); // Limpiar mensaje previo

    //verificamos que los campos no estén vacíos
    if (!formData.username || !formData.password) {
      setMensaje('Por favor, ingrese su nombre de usuario y contraseña.');
      return;
    }

    try {
      // Usamos `fetch` para enviar una solicitud al servidor.
      // `async/await` nos permite trabajar con promesas (peticiones asíncronas)
      // de una manera más fácil de leer.
      const response = await fetch('http://localhost:8080/CONI/LoginServlet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        // --- CAMBIO CLAVE AQUÍ ---
        // Ahora solo enviamos el nombre de usuario y la contraseña.
        // El rol ya no está en el `formData` que se envía.
        body: JSON.stringify(formData)
      });

      // --- EXPLICACIÓN: JSON y Servlet ---
      // JSON (JavaScript Object Notation) es un formato ligero para el intercambio de datos.
      // Es como un idioma universal para que el frontend y el backend se comuniquen.
      // El `Servlet` es un programa en el servidor (backend) que procesa las peticiones web.
      // En este caso, tu `LoginServlet` recibe los datos del formulario.
      const data = await response.json();

      // Si la respuesta del servidor es exitosa...
      // Ajuste aquí: el servlet devuelve 'success' y el rol está dentro de 'data.user.rolAutenticacion'
      if (response.ok && data.success) {
        setMensaje(data.message);

        // Guardamos todo el objeto de usuario en localStorage.
        // El `rolAutenticacion` viene del servidor, no de la selección del usuario.
        localStorage.setItem("usuarioLogueado", JSON.stringify(data.user));
        localStorage.setItem("idUsuario", data.user.id); // Guardar idUsuario si es necesario
        localStorage.setItem("cargoEmpleado", data.user.cargoEmpleado); // Guardar cargoEmpleado si es necesario

        // Obtenemos el rol directamente del objeto de datos que nos dio el servidor
        const userRole = data.user.rolAutenticacion ? data.user.rolAutenticacion.toLowerCase() : '';

        // Redirigir según el rol
        if (userRole === "admin") {
          navigate("/perfilAdmin");
        } else if (userRole === "usuario") {
          navigate("/perfilUsuario");
        } else {
          setMensaje("El rol de usuario recibido no es válido para redirección.");
        }
      } else {
        // Mostrar mensaje de error del servlet
        setMensaje(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div>
      <header className="encabezado">
        <img src={logo} alt="Eslogan de CONI" className="imagen-encabezado" />
        <div className="barra-superior">
          <nav>
            <ul>
              <li><a href="/">Atrás</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className='login'>
        <div className="container textos-sesion">
          <h1>¡Inicia sesión!</h1>
        </div>
        <form className="inicio-sesion" onSubmit={handleSubmit} required>

          <h4>¿Cómo deseas iniciar sesión?</h4>
          <p>Ingresa tu nombre de usuario y contraseña para acceder a tu cuenta.</p>

          <h4>Usuario</h4>
          <input type="text" 
          name="username" 
          placeholder="Nombre de usuario" 
          required 
          onChange={handleChange} />

          <h4>Contraseña</h4>
          <input type="password" 
          name="password" 
          placeholder="Contraseña" 
          required 
          autoComplete="current-password" 
          onChange={handleChange} />

          <h5><a href="/recuperar">¿olvidaste tu contraseña?</a></h5>

          <button type="submit">Iniciar sesión</button>
        </form>
        {mensaje && <p className="mensaje-feedback">{mensaje}</p>}
      </main>
    </div>
  );
}

export default Login;