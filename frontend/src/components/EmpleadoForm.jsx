import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import './estilos.css';
import logo from '../img/ESLOGAN CONI.png';

const EmpleadoForm = () => {
    const navigate = useNavigate();

    // Estado para almacenar los datos del empleado
    const [vista, setVista] = useState("lista");

    // Cargos predefinidos para el select
    const cargosDisponibles = [
        "Auxiliar de Logistica",
        "Aprendiz",
        "Ejecutivo(a) de Ventas",
        "Gerente de Distribuciones",
        "Tesorero",
        "Otro" // Opcional: para cargos no listados específicamente
    ];

    const cargoNulo = [
        "Seleccione un cargo"
    ];

    const [empleadoActual, setEmpleadoActual] = useState({
        id_empleado: null,
        nombre: "",
        cedula: "",
        email: "",
        cargo: "",
    });

    const [empleados, setEmpleados] = useState([]);
    const [filtro, setFiltro] = useState("");
    const [orden, setOrden] = useState("nombre");
    const [rolUsuario, setRolUsuario] = useState("");

    // --- EFECTOS (CARGA DE DATOS) ---

    useEffect(() => {
        const usuario = localStorage.getItem("usuarioLogueado");
        if (!usuario) {
            navigate("/login");
            return;
        }
        setRolUsuario(localStorage.getItem("rol"));
        // Cargar la lista de empleados solo si estamos en la vista de lista
        fetchEmpleados();
    }, [navigate, vista]); // Se vuelve a ejecutar si la vista cambia, para recargar la lista

    //--- LÓGICA DE DATOS ---

    const fetchEmpleados = async () => {
        try {
            const response = await fetch("http://localhost:8080/CONI/EmpleadoServlet", {
                method: "GET",
                credentials: "include"
            });
            if (response.ok) {
                const data = await response.json();
                setEmpleados(data);
            } else {
                console.error("Error al obtener lista de empleados", response.status);
                const errorText = await response.text(); // Obtener el texto de error del servidor
                console.error("Mensaje de error del servidor:", errorText);
                setEmpleados([]); // Limpiar la lista si hay error
                alert(`Error al cargar los empleados: ${errorText}`);
            }
        } catch (error) {
            console.error("Error en la peticion fetch(GET Empleados):", error);
            alert("Hubo un error al cargar los empleados. Por favor, inténtalo de nuevo más tarde.");
        }
    };

    // Usamos useMemo para que la lista no se recalcule en cada render, solo si cambian los datos
    const empleadosMostrados = useMemo(() => {
        let empleadosFiltrados = empleados.filter(emp =>
            emp.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
            emp.cedula.toLowerCase().includes(filtro.toLowerCase()) ||
            (emp.id_empleado && emp.id_empleado.toLowerCase().includes(filtro.toLowerCase()))
        );

        empleadosFiltrados.sort((a, b) => {
            if (a[orden] < b[orden]) return -1;
            if (a[orden] > b[orden]) return 1;
            return 0;
        });

        return empleadosFiltrados;
    }, [empleados, filtro, orden]);

    // --- MANEJO DE EVENTOS ---

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
        setEmpleadoActual({
            ...empleadoActual, [e.target.name]: e.target.value
        });
    };

    const handleCancelar = () => {
        // Limpiar el formulario y volver a la vista de lista
        setEmpleadoActual({ id_empleado: null, nombre: "", cedula: "", email: "", cargo: cargosDisponibles[0] });
        setVista("lista");
        fetchEmpleados(); // Recargar la lista de empleados después de cancelar (por si se hizo una edición parcial)
    };

    const handleIniciarEdicion = (empleado) => {
        // Cargar los datos del empleado seleccionado en el formulario
        setEmpleadoActual(empleado);
        setVista("editar");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = "http://localhost:8080/CONI/EmpleadoServlet";
        const method = (vista === "editar") ? "PUT" : "POST";

        try {
            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(empleadoActual),
                credentials: "include"
            });

            const data = await response.text();
            alert(data); // mostrar el mensaje del servidor (éxito o error)

            if (response.ok) {
                // Si la operación fue exitosa, recargar la lista de empleados
                handleCancelar();
            }
        } catch (error) {
            alert(`Error al ${vista === "editar" ? "actualizar" : "registrar"} el empleado:  ${error.message}`);
            console.error("Error en handleSubmit:", error);
        }
    };

    const handleEliminar = async (empleado) => {
        // Asegurarse de que la cedula del empleado logueado no sea la que se quiere eliminar
        const cedulaUsuarioLogueado = localStorage.getItem("cedulaUsuario"); // Asegúrate de guardar la cédula en localStorage al iniciar sesión

        if (empleado.cedula === cedulaUsuarioLogueado) {
            alert("No puedes eliminar tu propio usuario.");
            return;
        }

        if (!window.confirm(`¿Estás seguro de eliminar al empleado ${empleado.nombre}?`)) {
            return;
        }
        try {
            const response = await fetch(`http://localhost:8080/CONI/EmpleadoServlet?cedula=${empleado.cedula}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await response.text();
            alert(data);
            if (response.ok) {
                // Si la eliminación fue exitosa, recargar la lista de empleados
                setEmpleados(prevEmpleados => prevEmpleados.filter(e => e.cedula !== empleado.cedula));
            }
        } catch (error) {
            alert("Error al eliminar el empleado: " + error.message);
            console.error("Error en handleEliminar:", error);
        }
    };

    const handleAsignarEquipo = (empleado) => {
        // Redirigir a la página de asignación de equipo con el empleado seleccionado
        navigate("/ActaForm", { state: { cedula: empleado.cedula, nombre: empleado.nombre } });
    };

    const handleGenerarUsuario = (empleado) => {
        // Redirigir a la página de creación de usuario con los datos del empleado seleccionado
        navigate("/nuevoUsuario", { state: { nombre: empleado.nombre, cedula: empleado.cedula, email: empleado.email } });
    };

    // --- RENDERIZADO ---

    return (
        <div>
            <div className="encabezado">
                <img src={logo} className="imagen-encabezado" alt="Logo CONI" />
                <div className="barra-superior">
                    <nav>
                        <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                    </nav>
                </div>
            </div>


            {vista === "lista" ? (
                // Vista de lista de empleados
                <div className='listado-container'>
                    <h2>Listado de Empleados</h2>
                    <div className='filtros'>
                        
                            <button onClick={() => setVista("crear")}>Registrar Nuevo Empleado</button>

                        <input
                            type="text"
                            placeholder="Buscar por nombre, cédula o ID"
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                            <option value="nombre">Ordenar por Nombre</option>
                            <option value="id_empleado">Ordenar por ID</option>
                            <option value="cargo">Ordenar por Cargo</option>
                        </select>
                    </div>

                    <table className='tabla-empleados'>
                        <thead>
                            <tr>
                                <th>ID Empleado</th>
                                <th>Nombre</th>
                                <th>Cédula</th>
                                <th>Email</th>
                                <th>Cargo</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleadosMostrados.length > 0 ? (
                                empleadosMostrados.map((emp) => (
                                    <tr key={emp.cedula}>
                                        <td>{emp.id_empleado}</td>
                                        <td>{emp.nombre}</td>
                                        <td>{emp.cedula}</td>
                                        <td>{emp.email}</td>
                                        <td>{emp.cargo}</td>
                                        <td className='acciones'>
                                            <>
                                                <button onClick={() => handleIniciarEdicion(emp)}>Editar</button>
                                                <button onClick={() => handleEliminar(emp)}>Eliminar</button>
                                                <button onClick={() => handleAsignarEquipo(emp)}>Asignar Equipo</button>
                                            </>
                                            {/* El boton de asignar generar un usuario desde la lista*/}
                                            {rolUsuario === "admin" && (
                                                <button onClick={() => handleGenerarUsuario(emp)}>Crear Usuario</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6"></td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Vista de formulario para crear/editar empleado
                <div className='formulario-empleado'>
                    <h2>{vista === "editar" ? "Editar Empleado" : "Registro de Empleado"}</h2>
                    <form onSubmit={handleSubmit} >
                        <input
                            type="text"
                            name="nombre"
                            placeholder="Nombre"
                            value={empleadoActual.nombre}
                            onChange={handleChange}
                            required
                        />


                        <input
                            type="text"
                            name="cedula"
                            placeholder="Cédula"
                            value={empleadoActual.cedula}
                            onChange={handleChange}
                            required
                            readOnly={vista === "editar"} // la cédula no se puede editar al modificar un empleado
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={empleadoActual.email}
                            onChange={handleChange}
                            required
                        />

                        <select
                            name="cargo"
                            value={empleadoActual.cargo}
                            onChange={handleChange}
                            required
                        >
                            { cargoNulo.map((cargo, index) => (
                                <option value=""> --- Seleccione un Cargo --- </option>
                            ))}
                            {cargosDisponibles.map((cargo, index) => (
                                <option key={index} value={cargo}>{cargo}</option>
                            ))}
                        </select>

                        <button type="submit">
                            {vista === "editar" ? "Actualizar Empleado" : "Registrar Empleado"}
                        </button>
                        <button type="button" onClick={handleCancelar}>
                            Cancelar
                        </button>
                    </form>
                </div>
            )}
        </div>
    );

};

export default EmpleadoForm;