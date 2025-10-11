import React, { useState, useEffect, useCallback } from 'react';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png'; // Asegúrate de que la ruta a tu logo sea correcta

const ComprasForm = () => {
    const navigate = useNavigate();

    // --- ESTADOS PARA LA INFORMACIÓN DEL USUARIO AUTENTICADO ---
    const [currentUser, setCurrentUser] = useState(null);

    // --- ESTADOS PARA EL FORMULARIO DE COMPRAS ---
    const [descripcion, setDescripcion] = useState('');
    const [altaPrioridad, setAltaPrioridad] = useState(false);
    const [mensajeFormulario, setMensajeFormulario] = useState(''); // Mensajes para el formulario

    const [claseSeleccionada, setClaseSeleccionada] = useState('');
    const [tipoEquipoSeleccionado, setTipoEquipoSeleccionado] = useState('');
    const [almacenamientoSeleccionado, setAlmacenamientoSeleccionado] = useState('');
    const [ramSeleccionada, setRamSeleccionada] = useState('');
    const [procesadorSeleccionado, setProcesadorSeleccionado] = useState('');

    const [tipoPerifericoSeleccionado, setTipoPerifericoSeleccionado] = useState('');
    const [perifericoEspecificoSeleccionado, setPerifericoEspecificoSeleccionado] = useState('');

    // --- ESTADOS PARA EL LISTADO DE SOLICITUDES ---
    const [solicitudes, setSolicitudes] = useState([]);
    const [cargandoSolicitudes, setCargandoSolicitudes] = useState(true);
    const [errorListado, setErrorListado] = useState('');

    // --- ESTADOS PARA ORDENAMIENTO Y FILTRADO ---
    const [sortBy, setSortBy] = useState('fecha'); // Por defecto, ordenar por fecha
    const [sortOrder, setSortOrder] = useState('desc'); // Por defecto, descendente
    const [filterPriority, setFilterPriority] = useState('all'); // Por defecto, no filtrar por prioridad
    const [searchKeyword, setSearchKeyword] = useState(''); // Estado para la palabra clave de búsqueda

    // --- ESTADOS PARA LA EDICIÓN DE SOLICITUDES ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [solicitudToEdit, setSolicitudToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({
        tipoSolicitud: '',
        descripcion: '',
        altaPrioridad: false,
        estado: '' // Se añade el estado para que el rol "Otro" pueda editarlo
    });
    const [mensajeEdicion, setMensajeEdicion] = useState('');

    // --- DATOS DE OPCIONES PARA LOS SELECTS DINÁMICOS ---
    const opcionesAlmacenamiento = ["256GB SSD", "512GB SSD", "1TB SSD"];
    const opcionesRAM = ["4GB", "8GB", "16GB"];
    const opcionesProcesador = ["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 3", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "M1", "M1 Pro", "M1 Max", "M1 Ultra"];

    const opcionesPerifericosSalida = ["Diademas", "Parlantes", "Monitor 19in a 24in"];
    const opcionesPerifericosEntrada = ["Mouse", "Teclado", "Webcam", "Micrófono", "Cargador", "Cable Corriente Alterna"];
    const opcionesPerifericosAlmacenamiento = ["Disco Duro Portátil", "USB",]

    // --- EFECTO PARA OBTENER Y VERIFICAR EL USUARIO AUTENTICADO ---
    useEffect(() => {
        try {
            // Buscamos el objeto de sesión completo guardado en el login
            const storedUserJSON = localStorage.getItem("usuarioLogueado");

            if (!storedUserJSON) {
                console.warn("ComprasForm: Sesión no encontrada. Redirigiendo a inicio.");
                navigate("/");
                return;
            }

            const usuario = JSON.parse(storedUserJSON);
            
            // Usamos las propiedades del objeto JSON para verificar la sesión
            const id = usuario.idUsuario || usuario.id; 
            const rol = usuario.rolAutenticacion; 
            const cargo = usuario.cargoEmpleado;
            
            if (!id || !rol || !cargo) {
                console.warn("ComprasForm: Información de usuario incompleta. Redirigiendo a inicio.");
                navigate("/");
                return;
            }
            
            setCurrentUser({ id, rol, cargo });

            // Verificar el rol del usuario para acceso (Debe ser 'usuario' o 'admin')
            if (rol !== 'usuario' && rol !== 'admin') {
                console.warn(`ComprasForm: Rol (${rol}) sin permiso. Redirigiendo a login.`);
                navigate("/login");
            }
        } catch (e) {
            console.error("Error al obtener o parsear datos del usuario de localStorage:", e);
            navigate("/login");
        }
    }, [navigate]);

    // --- FUNCIÓN MEMORIZADA PARA CARGAR EL LISTADO DE SOLICITUDES ---
    const fetchSolicitudes = useCallback(async () => {
        setCargandoSolicitudes(true);
        setErrorListado('');

        // Solo intentar cargar solicitudes si tenemos un ID de usuario
        if (!currentUser?.id) {
            setErrorListado("No se pudo cargar el listado de solicitudes. Usuario no autenticado.");
            setCargandoSolicitudes(false);
            return;
        }

        try {
            // Construir los parámetros de consulta
            const queryParams = new URLSearchParams();
            if (sortBy) {
                queryParams.append('sortBy', sortBy);
            }
            if (sortOrder) {
                queryParams.append('order', sortOrder);
            }
            if (filterPriority !== 'all') { // Solo añadir si no es 'all'
                queryParams.append('filterPriority', filterPriority);
            }
            if (searchKeyword.trim() !== '') {
                queryParams.append('search', searchKeyword.trim());
            }

            const url = `http://localhost:8080/CONI1.0/api/solicitudes?${queryParams.toString()}`;

            const response = await fetch(url, {
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json(); // Intenta leer el mensaje de error del backend
                throw new Error(`HTTP error! status: ${response.status}, Mensaje: ${errorData.mensaje || 'Ocurrió un error desconocido.'}`);
            }

            const data = await response.json();
            setSolicitudes(data);
        } catch (err) {
            console.error('Error al obtener las solicitudes:', err);
            setErrorListado(`No se pudieron cargar las solicitudes: ${err.message}.`);
        } finally {
            setCargandoSolicitudes(false);
        }
    }, [sortBy, sortOrder, filterPriority, searchKeyword, currentUser?.id]); // Dependencias de useCallback

    // --- EFECTO PARA CARGAR LAS SOLICITUDES ---
    // Se ejecutará cuando 'fetchSolicitudes' cambie
    useEffect(() => {
        // Ejecutar fetchSolicitudes solo si el currentUser ya está disponible
        if (currentUser?.id) {
            fetchSolicitudes();
        }
    }, [fetchSolicitudes, currentUser]); // Añadimos currentUser como dependencia aquí


    // --- Manejador de cambio para la CLASE principal ---
    const handleClaseChange = (e) => {
        const selectedClase = e.target.value;
        setClaseSeleccionada(selectedClase);

        setTipoEquipoSeleccionado('');
        setAlmacenamientoSeleccionado('');
        setRamSeleccionada('');
        setProcesadorSeleccionado('');
        setTipoPerifericoSeleccionado('');
        setPerifericoEspecificoSeleccionado('');
    };

    // --- FUNCIÓN PARA ENVIAR LA SOLICITUD (FORMULARIO) ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setMensajeFormulario(''); // Limpiar mensajes anteriores

        if (claseSeleccionada === "") {
            setMensajeFormulario("Por favor, seleccione una Clase (Equipo, periférico, o ambos).");
            return;
        }
        if (descripcion.trim() === "") {
            setMensajeFormulario("Por favor agregue una descripción de la solicitud.");
            return;
        }

        // Construir la descripción de la solicitud con las características seleccionadas
        let finalDescription = descripcion;
        if (claseSeleccionada === "Equipo" || claseSeleccionada === "Equipo/Periferico") {
            if (tipoEquipoSeleccionado) finalDescription += `\nTipo de Equipo: ${tipoEquipoSeleccionado}`;
            if (almacenamientoSeleccionado) finalDescription += `\nAlmacenamiento: ${almacenamientoSeleccionado}`;
            if (ramSeleccionada) finalDescription += `\nRAM: ${ramSeleccionada}`;
            if (procesadorSeleccionado) finalDescription += `\nProcesador: ${procesadorSeleccionado}`;
        }
        if (claseSeleccionada === "Periferico" || claseSeleccionada === "Equipo/Periferico") {
            if (tipoPerifericoSeleccionado) finalDescription += `\nTipo Periférico: ${tipoPerifericoSeleccionado}`;
            if (perifericoEspecificoSeleccionado) finalDescription += `\nPeriférico Específico: ${perifericoEspecificoSeleccionado}`;
        }

        const datosSolicitud = {
            tipoSolicitud: claseSeleccionada, //Ahora enviamos la clase principal como tipoSolicitud
            descripcion: finalDescription, //La descripción combinada
            altaPrioridad,
        };

        try {
            const response = await fetch('http://localhost:8080/CONI1.0/api/solicitudes-compra', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosSolicitud),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                setMensajeFormulario(data.mensaje);
                // Limpia el formulario después de un envío exitoso
                setClaseSeleccionada('');
                setTipoEquipoSeleccionado('');
                setAlmacenamientoSeleccionado('');
                setRamSeleccionada('');
                setProcesadorSeleccionado('');
                setTipoPerifericoSeleccionado('');
                setPerifericoEspecificoSeleccionado('');
                setDescripcion(''); //Limpiar descripción
                setAltaPrioridad(false);
                fetchSolicitudes(); // Llama directamente a fetchSolicitudes para recargar el listado
            } else {
                setMensajeFormulario(`Error al enviar la solicitud: ${data.mensaje || 'Ocurrió un error desconocido.'}`);
            }
        } catch (error) {
            console.error('Error al conectar con el backend (envío):', error);
            setMensajeFormulario('Error de conexión con el servidor. Inténtelo de nuevo.');
        }
    };

    // --- FUNCIONES PARA EDITAR Y ELIMINAR SOLICITUDES ---

    const handleEdit = (solicitud) => {
        setSolicitudToEdit(solicitud);
        setEditFormData({
            tipoSolicitud: solicitud.tipoSolicitud,
            descripcion: solicitud.descripcion,
            altaPrioridad: solicitud.altaPrioridad,
            estado: solicitud.estado
        });
        setIsEditModalOpen(true);
        setMensajeEdicion('');
    };

    const handleEditFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditSubmit = async (event) => {
        event.preventDefault();
        setMensajeEdicion('');

        if (!solicitudToEdit) return;

        const url = `http://localhost:8080/CONI1.0/api/solicitudes-compra/${solicitudToEdit.id}`;

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editFormData),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                // Alerta personalizada para reemplazar window.alert
                const message = data.mensaje || 'Solicitud actualizada exitosamente.';
                document.getElementById('custom-alert-message').textContent = message;
                document.getElementById('custom-alert').style.display = 'block';

                fetchSolicitudes();
                setIsEditModalOpen(false);
            } else {
                const message = `Error al actualizar: ${data.mensaje || 'Ocurrió un error desconocido.'}`;
                document.getElementById('custom-alert-message').textContent = message;
                document.getElementById('custom-alert').style.display = 'block';
            }
        } catch (error) {
            console.error('Error al conectar con el backend (edición):', error);
            const message = 'Error de conexión con el servidor al actualizar.';
            document.getElementById('custom-alert-message').textContent = message;
            document.getElementById('custom-alert').style.display = 'block';
        }
    };

    const handleDelete = async (solicitudId) => {
        setMensajeEdicion('');
        
        // Reemplazando window.confirm por un modal personalizado
        // Nota: Mantenemos window.confirm por ahora, pero lo ideal es usar un modal personalizado.
        if (window.confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) {
            const url = `http://localhost:8080/CONI1.0/api/solicitudes-compra/${solicitudId}`;
            try {
                const response = await fetch(url, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                const data = await response.json();
                if (response.ok) {
                    const message = data.mensaje || 'Solicitud eliminada exitosamente.';
                    document.getElementById('custom-alert-message').textContent = message;
                    document.getElementById('custom-alert').style.display = 'block';
                    fetchSolicitudes();
                } else {
                    const message = `Error al eliminar: ${data.mensaje || 'Ocurrió un error desconocido.'}`;
                    document.getElementById('custom-alert-message').textContent = message;
                    document.getElementById('custom-alert').style.display = 'block';
                }
            } catch (error) {
                console.error('Error al conectar con el backend (eliminación):', error);
                const message = 'Error de conexión con el servidor al eliminar.';
                document.getElementById('custom-alert-message').textContent = message;
                document.getElementById('custom-alert').style.display = 'block';
            }
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSolicitudToEdit(null);
        setEditFormData({ tipoSolicitud: '', descripcion: '', altaPrioridad: false, estado: '' });
        setMensajeEdicion('');
    };

    // --- FUNCIÓN PARA CERRAR SESIÓN ---
    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8080/CONI1.0/LogoutServlet", {
                method: "GET",
                credentials: "include"
            });
            if (response.ok) {
                // Limpiamos todo el localStorage, incluyendo el objeto JSON completo
                localStorage.removeItem("usuarioLogueado");
                localStorage.removeItem("rol");
                localStorage.removeItem("idUsuario");
                localStorage.removeItem("cargoEmpleado");
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
    
    //Helper para determinar si las opciones de equipo deben estar visibles/habilitadas
    const showEquipoOptions = claseSeleccionada === "Equipo" || claseSeleccionada === "Equipo/Periferico";
    //Helper para determinar si las opciones de periférico deben estar visibles/habilitadas
    const showPerifericoOptions = claseSeleccionada === "Periferico" || claseSeleccionada === "Equipo/Periferico";

    return (
        <div className="compras-modulo">
            <main>
                <div className="encabezado">
                    <img src={logo} className="imagen-encabezado" alt="Logo CONI" />
                    <div className="barra-superior">
                        <nav>
                            <ul>
                                <li><button onClick={() => navigate("/perfilUsuario")}>Volver perfil usuario</button></li>
                                <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <div className="container-textos">
                    <p> Para realizar la solicitud, por favor complete todos los datos requeridos sobre el equipo o periférico necesario. </p>
                </div>
                <div className="container desplegable-compras">
                    <form id="formularioCompras" onSubmit={handleSubmit}>
                        {/*SELECT PRINCIPAL: CLASE*/}
                        <div className="seleccion">
                            <label htmlFor="claseSolicitud">Clase de Solicitud</label>
                        </div>
                        <select name="clase" id="claseSolicitud" value={claseSeleccionada} onChange={handleClaseChange}>
                            <option value="">Seleccione una opción</option>
                            <option value="Equipo">Equipo</option>
                            <option value="Periferico">Periférico</option>
                            <option value="Equipo/Periferico">Equipo y Periférico</option>
                        </select>
                        <br /><br />
                        {/* INPUT PARA DESCRIPCIÓN */}
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                        />
                        <br /><br />
                        {/* CHECKBOX DE PRIORIDAD */}
                        <div className="checkbox-container">
                            <input
                                type="checkbox"
                                id="altaPrioridad"
                                name="altaPrioridad"
                                checked={altaPrioridad}
                                onChange={(e) => setAltaPrioridad(e.target.checked)}
                            />
                            <label htmlFor="altaPrioridad">Alta Prioridad</label>
                        </div>
                        <br />
                        {/* CONTROLES CONDICIONALES PARA EQUIPOS */}
                        {showEquipoOptions && (
                            <>
                                <label>Tipo de Equipo:</label>
                                <select
                                    name="tipoEquipo"
                                    value={tipoEquipoSeleccionado}
                                    onChange={(e) => setTipoEquipoSeleccionado(e.target.value)}
                                >
                                    <option value="">Seleccione tipo de equipo</option>
                                    <option value="Computadora de escritorio">Computadora de escritorio</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Tablet">Tablet</option>
                                </select>
                                <br /><br />

                                <label>Almacenamiento:</label>
                                <select
                                    name="almacenamiento"
                                    value={almacenamientoSeleccionado}
                                    onChange={(e) => setAlmacenamientoSeleccionado(e.target.value)}
                                >
                                    <option value="">Seleccione Almacenamiento</option>
                                    {opcionesAlmacenamiento.map(opcion => (
                                        <option key={opcion} value={opcion}>{opcion}</option>
                                    ))}
                                </select>
                                <br /><br />

                                <label>RAM:</label>
                                <select
                                    name="ram"
                                    value={ramSeleccionada}
                                    onChange={(e) => setRamSeleccionada(e.target.value)}
                                >
                                    <option value="">Seleccione RAM</option>
                                    {opcionesRAM.map(opcion => (
                                        <option key={opcion} value={opcion}>{opcion}</option>
                                    ))}
                                </select>
                                <br /><br />

                                <label>Procesador:</label>
                                <select
                                    name="procesador"
                                    value={procesadorSeleccionado}
                                    onChange={(e) => setProcesadorSeleccionado(e.target.value)}
                                >
                                    <option value="">Seleccione procesador</option>
                                    {opcionesProcesador.map(opcion => (
                                        <option key={opcion} value={opcion}>{opcion}</option>
                                    ))}
                                </select>
                                <br /><br />
                            </>
                        )}
                        {/* CONTROLES CONDICIONALES PARA PERIFÉRICOS */}
                        {showPerifericoOptions && (
                            <>
                                <label>Tipo de Periférico:</label>
                                <select
                                    name="tipoPeriferico"
                                    value={tipoPerifericoSeleccionado}
                                    onChange={(e) => setTipoPerifericoSeleccionado(e.target.value)}
                                >
                                    <option value="">Seleccione tipo de periférico</option>
                                    <option value="Entrada">Entrada</option>
                                    <option value="Salida">Salida</option>
                                    <option value="Almacenamiento">Almacenamiento</option>
                                </select>
                                <br /><br />
                                {tipoPerifericoSeleccionado && (
                                    <>
                                        <label>Periférico Específico:</label>
                                        <select
                                            name="perifericoEspecifico"
                                            value={perifericoEspecificoSeleccionado}
                                            onChange={(e) => setPerifericoEspecificoSeleccionado(e.target.value)}
                                        >
                                            <option value="">Seleccione periférico</option>
                                            {tipoPerifericoSeleccionado === "Salida" && opcionesPerifericosSalida.map(opcion => (
                                                <option key={opcion} value={opcion}>{opcion}</option>
                                            ))}
                                            {tipoPerifericoSeleccionado === "Entrada" && opcionesPerifericosEntrada.map(opcion => (
                                                <option key={opcion} value={opcion}>{opcion}</option>
                                            ))}
                                            {tipoPerifericoSeleccionado === "Almacenamiento" && opcionesPerifericosAlmacenamiento.map(opcion => (
                                                <option key={opcion} value={opcion}>{opcion}</option>
                                            ))}
                                        </select>
                                        <br /><br />
                                    </>
                                )}
                            </>
                        )}
                        <button type="submit" className="btn-enviar">Enviar Solicitud</button>
                    </form>
                    {mensajeFormulario && <p className="mensaje-formulario">{mensajeFormulario}</p>}
                </div>
                {/* MODAL DE EDICIÓN */}
                {isEditModalOpen && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>Editar Solicitud</h3>
                            <form onSubmit={handleEditSubmit}>
                                <label>Tipo de Solicitud:</label>
                                <input
                                    type="text"
                                    name="tipoSolicitud"
                                    value={editFormData.tipoSolicitud}
                                    onChange={handleEditFormChange}
                                />
                                <br />
                                <label>Descripción:</label>
                                <textarea
                                    name="descripcion"
                                    value={editFormData.descripcion}
                                    onChange={handleEditFormChange}
                                />
                                <br />
                                <label>Prioridad:</label>
                                <input
                                    type="checkbox"
                                    name="altaPrioridad"
                                    checked={editFormData.altaPrioridad}
                                    onChange={handleEditFormChange}
                                />
                                <br />
                                {/* Campos de edición para rol "Otro" */}
                                {currentUser?.rol === "usuario" && currentUser?.cargo === "Otro" && (
                                    <>
                                        <label>Estado:</label>
                                        <select
                                            name="estado"
                                            value={editFormData.estado}
                                            onChange={handleEditFormChange}
                                        >
                                            <option value="Pendiente">Pendiente</option>
                                            <option value="Aprobada">Aprobada</option>
                                            <option value="Rechazada">Rechazada</option>
                                            <option value="Completada">Completada</option>
                                        </select>
                                    </>
                                )}
                                {mensajeEdicion && <p className="mensaje-edicion">{mensajeEdicion}</p>}
                                <div className="modal-actions">
                                    <button type="submit" className="btn-guardar">Guardar Cambios</button>
                                    <button type="button" className="btn-cancelar" onClick={handleCloseEditModal}>Cancelar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* TABLA DE SOLICITUDES */}
                <div className="listado-solicitudes">
                    <h3>Listado de Solicitudes</h3>
                    {cargandoSolicitudes && <p>Cargando solicitudes...</p>}
                    {errorListado && <p className="error-mensaje">{errorListado}</p>}
                    {!cargandoSolicitudes && !errorListado && solicitudes.length === 0 && (
                        <p>No hay solicitudes disponibles.</p>
                    )}
                    {!cargandoSolicitudes && solicitudes.length > 0 && (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tipo</th>
                                    <th>Descripción</th>
                                    <th>Prioridad</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudes.map(solicitud => (
                                    <tr key={solicitud.id}>
                                        <td>{solicitud.id}</td>
                                        <td>{solicitud.tipoSolicitud}</td>
                                        <td>{solicitud.descripcion}</td>
                                        <td>{solicitud.altaPrioridad ? "Sí" : "No"}</td>
                                        <td>{solicitud.estado}</td>
                                        <td>{new Date(solicitud.fechaSolicitud).toLocaleString()}</td>
                                        <td>
                                            <button onClick={() => handleEdit(solicitud)}>Editar</button>
                                            <button onClick={() => handleDelete(solicitud.id)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {/* Contenedor para el mensaje de alerta personalizado (usado en edición/eliminación) */}
                <div id="custom-alert" className="modal-custom-alert" style={{display: 'none'}}>
                    <div className="modal-content-alert">
                        <p id="custom-alert-message"></p>
                        <button onClick={() => document.getElementById('custom-alert').style.display = 'none'}>Aceptar</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ComprasForm;
