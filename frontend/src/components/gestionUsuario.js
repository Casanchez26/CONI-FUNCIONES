import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../img/ESLOGAN CONI.png';
import './estilos.css';

const GestionarUsuario = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const usuario = localStorage.getItem("usuarioLogueado");
        if (!usuario) {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = async () => {
        try {
            const response = await fetch("http://localhost:8080/CONI1.0/LogoutServlet", {
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

    const handleNuevoUsuario = () => {
        navigate('/nuevoUsuario');
    };

    const handleActualizarUsuario = () => {
        navigate('/modificarUsuario');
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
                            <li><button onClick={handleLogout}>Cerrar sesión</button></li>
                        </ul>
                    </nav>
                </div>
            </section>

            <header className='gestionar-usuario'>
                <div className="container botones-principales">
                    <button className="nuevo-usuario" type="button" onClick={handleNuevoUsuario}>
                        Nuevo Usuario
                    </button>
                    <button className="actualizar-usuario" type="button" onClick={handleActualizarUsuario}>
                        Modificar Usuario
                    </button>
                </div>
            </header>
        </div>
    );
};

export default GestionarUsuario;