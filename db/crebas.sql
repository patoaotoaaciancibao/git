-- Eliminar tablas en orden seguro
DROP TABLE IF EXISTS asignaciones;
DROP TABLE IF EXISTS inscripciones;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS cursos;
DROP TABLE IF EXISTS categorias;

-- Creación de la tabla Categoria
CREATE TABLE categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(150) NOT NULL
);

-- Creación de la tabla Curso
CREATE TABLE cursos (
    id_curso INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    id_categoria INTEGER REFERENCES categorias(id_categoria)
);

-- Creación de la tabla Usuarios
CREATE TABLE usuarios (
    id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    contraseña TEXT NOT NULL,
    es_admin BOOLEAN NOT NULL DEFAULT 0
);

-- Creación de la tabla Inscripciones
CREATE TABLE inscripciones (
    id_inscripcion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER REFERENCES usuarios(id_usuario),
    id_curso INTEGER REFERENCES cursos(id_curso),
    fecha_inscripcion DATE
);

-- Creación de la tabla Asignaciones
CREATE TABLE asignaciones (
     id_asignacion INTEGER PRIMARY KEY AUTOINCREMENT,
     id_usuario INTEGER REFERENCES usuarios(id_usuario),
     id_curso INTEGER REFERENCES cursos(id_curso)
);

-- Crear la tabla secciones si no existe
CREATE TABLE IF NOT EXISTS secciones (
    id_seccion INTEGER PRIMARY KEY AUTOINCREMENT,
    curso_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (curso_id) REFERENCES cursos(id_curso)
);

-- Crear tabla de comentarios (uno por alumno por curso)
CREATE TABLE IF NOT EXISTS comentarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_curso INTEGER NOT NULL,
    comentario TEXT NOT NULL,
    estrellas INTEGER CHECK(estrellas BETWEEN 1 AND 5),
    UNIQUE(id_usuario, id_curso),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_curso) REFERENCES cursos(id_curso)
);
