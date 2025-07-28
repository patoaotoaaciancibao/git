/*-- Inserción de categorías
INSERT INTO categorias (nombre) VALUES
    ('Programación'),
    ('Diseño'),
    ('Marketing');

-- Inserción de cursos
INSERT INTO cursos (nombre, descripcion, id_categoria) VALUES
    ('Python para principiantes', 'Aprende los fundamentos de Python', 1),
    ('Diseño gráfico con Adobe Illustrator', 'Crea diseños profesionales', 2),
    ('Marketing digital para redes sociales', 'Estrategias de marketing en redes', 3),
    ('Java avanzado', 'Programación orientada a objetos', 1);

-- Insertar secciones para el curso con ID 7
INSERT INTO secciones (curso_id, titulo, descripcion) VALUES
   (7, 'Introducción a JavaScript', 'Aprendé los fundamentos del lenguaje.'),
   (7, 'Variables y Tipos de Datos', 'Conocé cómo declarar y usar variables.'),
   (7, 'Funciones y Alcance', 'Cómo definir funciones y su comportamiento.'),
   (7, 'DOM y eventos', 'Manipulá elementos HTML con JavaScript.'),
   (7, 'Proyecto Final', 'Aplicá lo aprendido en una mini app.');

-- Inscripciones (usuarios como estudiantes)
INSERT INTO inscripciones (id_usuario, id_curso, fecha_inscripcion) VALUES
   (1, 1, '2025-10-26'),
   (2, 2, '2025-10-26'),
   (3, 3, '2025-10-26'),
   (4, 4, '2025-10-26'),
   (5, 4, '2025-10-26');

-- Asignación de profesores a cursos
INSERT INTO asignaciones (id_usuario, id_curso) VALUES
   (6, 1),
   (7, 2),
   (8, 3),
   (9, 4),
   (6, 4);
*/
