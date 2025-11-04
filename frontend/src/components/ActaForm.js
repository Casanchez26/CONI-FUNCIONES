import React, { useEffect, useState, useMemo, useCallback } from 'react'; // Agregamos useCallback
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import logoAldir from '../img/logo aldir.png';
import '../App.css'; // Asegúrate de importar tu archivo CSS global para los estilos de tablas y botones

function ActaForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const [equipos, setEquipos] = useState([]);
    const [formulario, setFormulario] = useState({ nombre_completo: '', cedula: '' });
    const [seleccionados, setSeleccionados] = useState([]);
    const [actasConsultadas, setActasConsultadas] = useState([]);
    const [consulta, setConsulta] = useState('');
    const { cedula, nombre } = location.state || {};
    const [actaDAta, setActaDAta] = useState({
        nombre_completo: nombre || '',
        cedula: cedula || '',
    });

    const [searchEquipmentsQuery, setSearchEquipmentsQuery] = useState('');

    // Función para cargar los equipos disponibles (usamos useCallback para optimización)
    const fetchEquiposDisponibles = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8080/CONI/EquipoServlet?accion=listar&estado=disponible');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEquipos(data);
        } catch (err) {
            console.error("Error al cargar equipos disponibles:", err);
            // Considera mostrar un mensaje al usuario si la carga inicial falla
        }
    }, []); // No tiene dependencias externas, solo se crea una vez

    useEffect(() => {
        setActaDAta(prev => ({
            ...prev,
            nombre_completo: nombre || '',
            cedula: cedula || ''
        }));
    }, [cedula, nombre]);

    useEffect(() => {
        const usuario = localStorage.getItem("usuarioLogueado");
        if (!usuario) {
            navigate("/login");
        }
    }, [navigate]);

    // Cargar equipos disponibles al montar el componente
    useEffect(() => {
        fetchEquiposDisponibles();
    }, [fetchEquiposDisponibles]); // Dependencia: la función useCallback

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8080/CONI/LogoutServlet", {
                method: "GET",
                credentials: "include"
            });

            if (response.ok) {
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

    const handleChange = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value });
        setActaDAta({ ...actaDAta, [e.target.name]: e.target.value });
    };

    const handleCheckboxChange = (n_inventario) => {
        setSeleccionados((prev) =>
            prev.includes(n_inventario)
                ? prev.filter((id) => id !== n_inventario)
                : [...prev, n_inventario]
        );
    };

    // Lógica de handleSubmit basada en tu código original, con adiciones para refresco y limpieza
    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Datos de acta a enviar:", actaDAta);

        if (seleccionados.length === 0) {
            alert('Por favor seleccione al menos un equipo.');
            return;
        }

        const datos = {
            ...formulario,
            n_inventario: seleccionados
        };

        fetch('http://localhost:8080/CONI/ActasServlet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        })
            .then(res => res.json())
            .then(data => {
                alert(data.mensaje); // Muestra el mensaje del backend
                generarPDF(datos); // Genera el PDF inmediatamente después del mensaje del backend

                // Limpiar formulario y selección después de éxito
                setFormulario({ nombre_completo: '', cedula: '' });
                setActaDAta({ nombre_completo: '', cedula: '' });
                setSeleccionados([]);

                // REFRESCAR LA LISTA DE EQUIPOS DISPONIBLES
                fetchEquiposDisponibles(); // Llama a la función useCallback para recargar los equipos
            })
            .catch(err => {
                console.error("Error al registrar el acta:", err);
                alert("Error al registrar el acta. Inténtelo de nuevo.");
            });
    };

    const generarPDF = (datos) => {
        const doc = new jsPDF();

        const fecha = new Date().toLocaleDateString('es-CO', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        // Logo
        const img = new Image();
        img.src = logoAldir;
        doc.addImage(img, 'PNG', 10, 10, 50, 20);

        // Información del acta
        doc.setFontSize(12);
        doc.text(`Ciudad y fecha: Bogotá, ${fecha}`, 10, 40);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('Asunto: Acta entrega de equipos y/o periféricos', 10, 50);
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');

        const texto = `Distriquímicos Aldir hace entrega a ${datos.nombre_completo}, identificado con C.C. ${datos.cedula}, del siguiente material para uso en la empresa como se relaciona:`;
        doc.text(texto, 10, 60, { maxWidth: 190 });

        // Tabla con los equipos seleccionados
        const bodyEquipos = datos.n_inventario.map(id => {
            const eq = equipos.find(e => e.n_inventario === id);
            return eq ? [
                `${eq.clase} ${eq.marca} (${eq.tipo})`,
                eq.n_inventario,
                eq.n_serie || 'N/A'
            ] : [`Equipo no encontrado (${id})`, 'N/A', 'N/A'];
        });

        autoTable(doc, {
            startY: 80,
            head: [['Descripción del Equipo', 'N° Inventario', 'N° de Serie']],
            body: bodyEquipos
        });

        const yFinal = doc.lastAutoTable.finalY + 30;

        // Firmas
        doc.text('Firma quien recibe', 20, yFinal);
        doc.text('Firma quien entrega', 130, yFinal);

        doc.save(`Acta_${datos.cedula}.pdf`);
    };

    console.log("Datos que se envían:", JSON.stringify(formulario));

    const consultarActas = () => {
        fetch(`http://localhost:8080/CONI/ActasServlet?cedula=${consulta}`)
            .then(res => res.json())
            .then(data => setActasConsultadas(data))
            .catch(err => console.error(err));
    };

    const descargarPDF = (cedula) => {
        fetch(`http://localhost:8080/CONI/DescargarPDFServlet?cedula=${cedula}`)
            .then(response => {
                if (!response.ok) throw new Error("No se pudo descargar el PDF");
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `Acta_${cedula}.pdf`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            })
            .catch(error => {
                console.error("Error al descargar PDF:", error);
                alert("No se pudo descargar el PDF.");
            });
    };

    const filteredAndGroupedEquipos = useMemo(() => {
        const lowerCaseQuery = searchEquipmentsQuery.toLowerCase();
        const filtered = equipos.filter(eq =>
            eq.n_inventario.toLowerCase().includes(lowerCaseQuery) ||
            eq.n_serie.toLowerCase().includes(lowerCaseQuery) ||
            eq.tipo.toLowerCase().includes(lowerCaseQuery) ||
            eq.clase.toLowerCase().includes(lowerCaseQuery) ||
            eq.marca.toLowerCase().includes(lowerCaseQuery)
        );

        const grouped = {
            'EQUIPO': [],
            'PERIFERICO': []
        };
        filtered.forEach(eq => {
            if (grouped[eq.clase.toUpperCase()]) {
                grouped[eq.clase.toUpperCase()].push(eq);
            }
        });
        return grouped;
    }, [equipos, searchEquipmentsQuery]);


    return (
        <div className="acta-form-modulo">

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

            <main className="container acta-main">
                <h2>Registrar Acta</h2>
                <form onSubmit={handleSubmit} className="form-registro-acta">
                    <input
                        type="text"
                        name="nombre_completo"
                        value={actaDAta.nombre_completo}
                        placeholder="Nombre completo"
                        onChange={handleChange}
                        required
                    /><br />
                    <input
                        type="text"
                        name="cedula"
                        placeholder="Cédula"
                        value={actaDAta.cedula}
                        onChange={handleChange}
                        required
                    /><br />

                    <h4 className="section-title">Seleccione uno o más equipos disponibles:</h4>
                    <input
                        type="text"
                        placeholder="Buscar equipo por N° Inventario, Marca, Tipo..."
                        value={searchEquipmentsQuery}
                        onChange={(e) => setSearchEquipmentsQuery(e.target.value)}
                        className="search-input"
                    />

                    <div className="equipos-selection-container">
                        {filteredAndGroupedEquipos.EQUIPO && filteredAndGroupedEquipos.EQUIPO.length > 0 && (
                            <div className="equipment-category">
                                <h3>Equipos</h3>
                                <div className="equipment-list">
                                    {filteredAndGroupedEquipos.EQUIPO.map((eq) => (
                                        <div key={eq.n_inventario} className="equipment-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value={eq.n_inventario}
                                                    onChange={() => handleCheckboxChange(eq.n_inventario)}
                                                    checked={seleccionados.includes(eq.n_inventario)}
                                                />
                                                <span className="equipment-details">
                                                    <span className="detail-label">N° Inv:</span> {eq.n_inventario} |
                                                    <span className="detail-label"> Clase:</span> {eq.clase} |
                                                    <span className="detail-label"> Tipo:</span> {eq.tipo} |
                                                    <span className="detail-label"> Marca:</span> {eq.marca}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {filteredAndGroupedEquipos.PERIFERICO && filteredAndGroupedEquipos.PERIFERICO.length > 0 && (
                            <div className="equipment-category">
                                <h3>Periféricos</h3>
                                <div className="equipment-list">
                                    {filteredAndGroupedEquipos.PERIFERICO.map((eq) => (
                                        <div key={eq.n_inventario} className="equipment-item">
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    value={eq.n_inventario}
                                                    onChange={() => handleCheckboxChange(eq.n_inventario)}
                                                    checked={seleccionados.includes(eq.n_inventario)}
                                                />
                                                <span className="equipment-details">
                                                    <span className="detail-label">N° Inv:</span> {eq.n_inventario} |
                                                    <span className="detail-label"> Clase:</span> {eq.clase} |
                                                    <span className="detail-label"> Tipo:</span> {eq.tipo} |
                                                    <span className="detail-label"> Marca:</span> {eq.marca}
                                                </span>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchEquipmentsQuery &&
                            filteredAndGroupedEquipos.EQUIPO.length === 0 &&
                            filteredAndGroupedEquipos.PERIFERICO.length === 0 && (
                                <p className="no-results-message">No se encontraron equipos o periféricos que coincidan con la búsqueda.</p>
                            )}
                        {!searchEquipmentsQuery && equipos.length === 0 && (
                            <p className="no-results-message">No hay equipos o periféricos disponibles para asignar.</p>
                        )}
                    </div>

                    <br />
                    <button type="submit">Registrar y Generar PDF</button>
                </form>

                <hr className="divider" />

                <h2>Consultar Actas</h2>
                <div className="consultar-actas-section">
                    <input
                        type="text"
                        placeholder="N° Cédula"
                        value={consulta}
                        onChange={(e) => setConsulta(e.target.value)}
                        className="search-input"
                    />
                    <button onClick={consultarActas}>Consultar</button>
                </div>

                {actasConsultadas.length > 0 && (
                    <div className="actas-consultadas-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID Acta</th>
                                    <th>Nombre Completo</th>
                                    <th>Cédula</th>
                                    <th>N° Inventario(s)</th>
                                    <th>Fecha</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {actasConsultadas.map((acta, index) => (
                                    <tr key={index}>
                                        <td>{acta.id_acta}</td>
                                        <td>{acta.nombre_completo}</td>
                                        <td>{acta.cedula}</td>
                                        <td>{acta.n_inventario}</td>
                                        <td>{acta.fecha}</td>
                                        <td>
                                            <button
                                                onClick={() => descargarPDF(acta.cedula)}
                                                className="btn-accion btn-descargar"
                                            >
                                                Descargar PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {actasConsultadas.length === 0 && consulta && (
                    <p className="no-results-message">No se encontraron actas para la cédula consultada.</p>
                )}
            </main>
        </div>
    );
}

export default ActaForm;
