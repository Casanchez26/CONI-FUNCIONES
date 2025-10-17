-- Crear la base de datos 'conibd' si no existe
CREATE DATABASE IF NOT EXISTS conibd;

-- Usar la base de datos 'conibd'
USE conibd;

-- Crear la tabla 'usuarios' con las columnas exactas de tu phpMyAdmin
CREATE TABLE IF NOT EXISTS usuarios (
    nombre VARCHAR(255) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL
);

-- Insertar los datos iniciales en la tabla 'usuarios'
INSERT INTO usuarios (nombre, cedula, rol, username, password, email) VALUES
('yuly caballero', '1007963690', 'usuario', 'yuly', '940726', 'yuly@gmail.com'),
('valentina osorio', '1234567895', 'admin', 'valen', '123456', 'valentina@gmail.com'),
('christian sanchez', '1110550665', 'admin', 'christian', '940726', 'an.sa.pa26@gmail.com');