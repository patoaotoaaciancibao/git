## Condiciones Generales para todas las oportunidades

-   El examen es presencial e individual.
-   Se presenta en la fecha del examen. Deben asistir a firmar acta de asistencia como siempre.
-   Solo pueden rendir alumnos que figuren en acta.
-   Cada alumno tendrá su repositorio de GitLab propio (creado por el profesor).
-   Solo se corrige lo que está en la rama "main".
-   Para actualizar "main" se debe seguir el esquema de trabajo de Merge Request.
-   Fecha tope para solicitar MRs y cambio de código:
    -   **El día del examen hasta el mediodía**
-   El proyecto debe estar en un estado adecuado (se debe poder clonar, instalar y ejecutar) sin tener que realizar ajustes de código, de base de datos o modificaciones manuales ni externas.
-   Se debe seguir utilizando las mismas tecnologías y herramientas utilizadas a lo largo del semestre.
-   Leer y seguir las instrucciones especificadas.
-   En caso de dudas se deben hacer las consultas vía GitLab.
-   Si hay tickets pendientes, o errores acarreados de entregas anteriores, se deben corregir para esta entrega. Estas correcciones no suman puntos al momento del examen, pero en caso de no haberse corregido restaran sobre el total. Especial atención a errores de tipo:
    -   base de datos no actualizada correctamente.
    -   enlaces a páginas rotas.
    -   navegación incorrecta.
    -   errores de validación que no se muestren correctamente en la interfaz.
    -   paquetes o librerías no instaladas o definidas correctamente.
    -   dependencias no actualizadas.
    -   validaciones incompletas (solo front por ejemplo) o incorrectas (ejemplo no normalizar un correo electrónico que permita registrar dos veces el mismo correo pero con diferente "case").
    -   código ubicado incorrectamente (ejemplo, consultas SQL fuera de modelos, validaciones mezcladas con lógica, código en archivos de rutas).
-   Para las pruebas de las funcionalides y correcciones se harán desde la interfaz Web. No debe ser necesario crear ni tener que editar datos ni estructura de la base de datos para las funcionalidades.
-   Cada oportunidad debe realizar solo los items solicitados en la oportunidad que va a rendir + las funcionalidades implementadas hasta el último día de clases (ejemplo: El que rinde 2da oportunidad debe hacer todo lo solicitado para 2da, todo lo realizado durante las clases pero NO debe implementar lo de primera oportunidad).
-   Ser respetuosos de la materia, del profesor y de los compañeros no pidiendo excepciones especiales y respetando los tiempos y procesos definidos.

---
---


# Examen Final - Tercera Oportunidad

## Actividades a implementar (en el repositorio GitLab):

### Diseño y Programación:

#### Item F1 - Envío de correo - 🚥 / 5 puntos🚥

-   [ ] Implementar el envío de correos a un alumno, cuando este se auto-inscribe en un curso.
-   [ ] Debe utilizarse [MailTrap](https://mailtrap.io/es/) para validar el envío de correos sin necesidad de un servidor especial.
-   [ ] Utilizar una plantilla adecuada (no simplemente un texto genérico).
-   [ ] Seguir los lineamientos en clase para el uso de valores confidenciales en el proyecto y el Git.
-   El correo debe mostrar:

    -   [ ] el nombre y logo usado en su Web
    -   [ ] Información del alumno (nombre, email)
    -   [ ] Imagen del alumno - icono que el usuario puede subir en sus datos personales. Si no tiene foto de perfil, usar la imagen genérica de usuario
    -   Información del curso a mostrar en el correo:

        -   [ ] Nombre Categoría
        -   [ ] Nombre Curso
        -   [ ] Imagen de Portada del curso
        -   [ ] Enlace directo clickeable en el correo que lleve directamente al "Ver Curso" en donde se inscribió.

---

#### Item F2 - Archivos de Video 🚥 / 6 puntos🚥

-   Subir videos en un Curso - 4 puntos:

    -   [ ] Permitir que el profesor de un curso pueda adjuntar un archivo de video a un curso (upload), de forma opcional al momento de editar un curso, de la misma forma que puede asociar una imagen como portada del curso.
    -   [ ] El profesor debe poder adjuntar el video al curso desde la interfaz de visualización de curso de un profesor asignado. Asi mismo, debe poder eliminar el archivo de video en cualquier momento.
    -   [ ] Validar la extensión del archivo. Definir 2 extensiones que permitirá su app. Mencionarlas en la documentación. En caso de error mostrar un mensaje "amigable" adecuado de validación en pantalla.
    -   [ ] Los videos deben subirse dentro de la carpeta:
            `/assets/videos/{idCurso}/{nombreOriginalVideo.extensión}`
    -   [ ] En el caso de subir dos veces un mismo video (mismo nombre) a un mismo curso,
            emitir un error "amigable" adecuado de validación en pantalla.
    -   [ ] Se debe validar la extensión máxima del video (tamaño) a 3MB. En caso de error mostrar un mensaje "amigable" adecuado de validación en pantalla.
    -   [ ] Ningún archivo de video, existente o futuro, deberá "trackearse" en el repo Git.

-   Ver Stream de videos - 2 puntos:
    -   [ ] En las páginas de Ver Curso, el curso tiene un video asociado debe visualizarse como un stream (**no una descarga**) dentro de la vista del curso. No utilizar una página externa.
    -   [ ] Asegurarse de incluir en la documentación una captura de ejemplo de como se debe visualizar el video dentro de su página, así como un ejemplo donde encontrar esta visualización.
    -   [ ] El video solo debe ser visible para usuarios que son alumnos o profesores del curso donde fueron subidos.

---

#### Item F3 - Notas de Alumno 🚥 / 6 puntos🚥

-   Notas de Alumno - Profesor - 4 puntos:

    -   [ ] En el menú de Ver Curso para un profesor, agregar una opción que permita cargar calificaciones de los alumnos inscriptos (Aprobado / Reprobado) en una nueva página.
    -   [ ] Asegurarse la opción "Ver Mis Cursos como Profesor" exista y sea accesible desde el navbar para un usuario logueado.
    -   [ ] En la nueva página, se deben listar todos los alumnos inscriptos ordenados alfabeticamente, un alumno por fila.
    -   [ ] Por cada alumno debe permitir registrar su calificación y guardarla en un elemento de formulario adecuado. Esto se debe hacer por todo el "paquete" de alumnos, es decir no tener un botón guardar por cada alumno, sino un solo botón que guarda las calificaciones de todos los alumnos de una sola vez. Debe aceptar valores nulos, lo cuál debería dejar al alumno sin calificación.
    -   [ ] En caso que el alumno ya tenga una calificación previamente, está debe aparecer pre-cargada en el formulario.

-   Ver Calificación Alumno - 2 puntos:
    -   [ ] Actualizar las vistas de Ver Curso para que un alumno, al ingresar a dicho curso, si tiene calificación pueda visualizar claramente en esa interfaz su calificación. Agregar una captura en la documentación mostrando cómo se debe visualizar. No debe mostrarse nada al alumno si no tiene calificación (valor nulo).

---

#### Item F4 - Envío de correo al profesor 🚥 / 5 puntos 🚥

-   [ ] Implementar el envío de correos, cuando se cargan los puntajes de un curso (item F3 previo) al profesor de ese curso.
-   [ ] Debe utilizarse [MailTrap](https://mailtrap.io/es/) para validar el envío de correos sin necesidad de un servidor especial.
-   [ ] Utilizar una plantilla adecuada (no simplemente un texto genérico).
-   [ ] Seguir los lineamientos en clase para el uso de valores confidenciales en el proyecto y el Git.
-   El correo debe mostrar:

    -   [ ] el nombre y logo usado en su Web
    -   [ ] El correo debe enviarse a todos los usuarios profesore de ese curso. Un solo correo para todos los que existan.
    -   Información del curso a mostrar en el correo:

        -   [ ] Nombre Curso
        -   [ ] Imagen de Portada del curso
        -   [ ] Enlace directo clickeable en el correo que lleve directamente al "Editar Curso" para los profesores.
        -   [ ] El listado de todos los alumnos del curso y la calificación que fue cargada para los mismos, incluyendo a los que no tengan calificación.

    -   [ ] Asegurarse en la documentación de agregar capturas del correo de muestra.

---

#### Item F5 - Correlatividades 🚥 / 8 puntos 🚥

-   Correlatividades - Creación - 4 puntos:

    Desde el menú Admin, agregar una opción para gestionar cursos correlativos.

    Un curso correlativo es aquel que requiere haber aprobado uno previo para permitir la inscripción en este.

    Ejemplo, si IS3 se registra como requisito correlativo de IS4, solo los alumnos que tengan calificación APROBADA en IS3 pueden autoinscribirse a IS4.

    -   [ ] Un curso puede tener cero, uno o muchos cursos correlativos previos.
    -   [ ] Se debe poder encontrar que cursos tienen correlativas y cuáles no en el menú de Admin. Agregar en la documentación la captura y el enlace donde encontrar esta información.
    -   [ ] Se debe validar que un curso no se pueda registrar más de una vez como
            correlativo de otro (es decir, IS3 -> IS4 no debería poder registrarse dos veces).
    -   [ ] Se debe poder eliminar una correlativa en cualquier momento.
    -   [ ] Utilizar elementos adecuados para editar cursos y correlativas desde una página para cada curso.
    -   [ ] Agregar en la documentación los URLs de ejemplo donde se gestionan correlativas y capturas necesarias.

-   Correlatividades - AutoInscripción - 4 puntos:
    -   [ ] Implementar el control de cursos correlativos al momento de autoinscribirse un alumno a un curso. El control solo debe ser cumplido si el alumno ha APROBADO las correlativas (los que no tienen calificación o tienen REPROBADO por tanto, no lo hacen).
    -   [ ] El control solo debe ser aplicado en la auto-inscripción de un usuario como alumno de un curso.
    -   [ ] Si el admin inscribe a un alumno, no debe aplicarse el control.
    -   [ ] En caso de error de validación, se debe mostrar un error adecuado en pantalla indicando cuál(es) cursos correlativos está incumpliendo.
    -   [ ] En caso que un curso tenga muchas correlativas, se deben cumplir todas para permitir la inscripción.

---

### Testing: 🚥 / 6 puntos 🚥

-   Test de Interfaz:
    Crear un test de interfaz utilizando Playwright.
    -   [ ] El test debe ser ejecutado en el navegador Mozilla únicamente.
    -   [ ] Debe mostrarse la ejecución en el modo gráfico.
    -   El test debe:
        -   [ ] Autoregistrar un usuario. Utilizar un diccionario o generador de correos y datos para que cada ejecución inserte un nuevo usuario sin repetir datos. Puede definir valores aleatorios adecuados para cada campo. Imprimir en la consola los valores al iniciar la ejecución. El password siempre será el valor utilizado de pruebas en el semestre.
        -   [ ] Hacer login con el usuario
        -   [ ] Validar carga correctamente su página "home".
        -   [ ] Guardar una captura de pantalla automática en este punto.
        -   [ ] Hacer logout.
        -   [ ] Hacer login con un usuario administrador (datos del login de un administrador en duro en el test)
        -   [ ] Ir al menú de creación de curso y crear un nuevo curso usando valores aleatorios basados en un diccionario (similar al paso del autoregistro. No usar siempre los mismos datos).
        -   [ ] Luego de la creación del curso, navegar a la página de edición de curso (donde se visualicen los datos del curso creado) y guardar una captura de la página. Imprimir en la consola el nombre del curso y el ID autogenerado que le fue asignado.
        -   [ ] Navegar al menú de asignar profesor a curso.
        -   [ ] Asignar al usuario autoregistrado al inicio del test como profesor del curso creado (en base al ID que le fue asignado en la creación, no utilizar un ID en duro) a través del formulario Web.
        -   [ ] Guardar una captura de pantalla automática en este punto.
    -   [ ] En la corrección se hará login manualmente con el usuario creado y se debe visualizar correctamente el curso en el menú de "Mis Cursos Profesor" del usuario logueado.
    -   [ ] Debe poder ejecutarse con un comando el cuál debe permitir la ejecución del proceso completo.
    -   [ ] Documentar el comando de forma visible y entendible (como texto) en la documentación.
    -   [ ] Mostrar la salida con capturas en la documentación.

---

### Documentación: 🚥 / 4 puntos 🚥

-   Wiki

    En un proceso de desarrollo de Software, la documentación es clave. Para esta entrega
    tendrán que leer e investigar como utilizar la Wiki del GitLab para documentar su proyecto. Deberán:

    -   [ ] Crear una página principal en la Wiki de su proyecto.
    -   [ ] Crear una subpágina en la Wiki por cada item solicitado dentro de este examen. Lease,
            si hay 3 requerimientos a implementar, deberían haber 3 subpáginas dentro de la Wiki.
    -   Dentro de cada página de ticket deberán indicar los cambios realizados a nivel de usando la siguiente plantilla:

        -   Una o más capturas de la implementación
        -   Descripción u observaciones. Texto libre para indicar brevemente que
            implicó la implementación o modificación realizada.
        -   Base de datos. Énfasis en ajustes realizados con capturas de estas modificaciones con capturas de las modificaciones.
        -   Rutas: Creadas
        -   Modelos: Nuevos o modificados.
        -   Controlador: Nuevos o modificados.
        -   Validaciones y como se muestran. Qué validaciones ha implementado, en front o back,
            como se muestra un error de validación en pantalla (captura).
        -   Interfaz y estilos de presentación
        -   Comandos (por ejemplo comandos a ejecutar en terminal)

    -   Cada sección deberá tener un título y su desarrollo.
    -   Cada sección que no aplique deberá tener el texto "N/A". Es decir, si el requerimiento item
        #F1 (ejemplo) no tuvo modificaciones en la base de datos, no se elimina la sección, sino simplemente se define como su contenido "N/A".
    -   [ ] En la página principal de la Wiki agregar el DER completo de su aplicación, así como una breve descripción del trabajo realizado.

    -   [ ] Agregar en el footer de la App Web un enlace para llegar directamente a la página
            principal de la documentación. Este enlace deberá estar visible
            en todos los footers de la app, en caso de tener más de uno.

    -   Se evaluará:

        -   Correctitud: Lo que se ve en la Wiki representa la versión entregada del código, y viceversa. 2 puntos
        -   Presentación: Elementos solicitados están presentes en la Wiki. Presentación adecuada
            de elementos en la Wiki (títulos utilizando elementos de títulos, párrafos, imágenes
            son visibiles y entendibles, ortografía, coherencia entre el texto y las secciones). 2 puntos

        Para tener el puntaje total además se deben documentar todas las funcionalidades solicitadas correctamente.


---
---

<del>

# Examen Final - Segunda Oportunidad

## Actividades a implementar (en el repositorio GitLab):

### Diseño y Programación:

---

#### Item F1 - Envío de correo - 🚥 / 5 puntos🚥

-   [ ] Implementar el envío de correos a un alumno, cuando este se auto-inscribe en un curso.
-   [ ] Debe utilizarse [MailTrap](https://mailtrap.io/es/) para validar el envío de correos sin necesidad de un servidor especial.
-   [ ] Utilizar una plantilla adecuada (no simplemente un texto genérico).
-   [ ] Seguir los lineamientos en clase para el uso de valores confidenciales en el proyecto y el Git.
-   El correo debe mostrar:

    -   [ ] el nombre y logo usado en su Web
    -   [ ] Información del alumno (nombre, email)
    -   [ ] Imagen del alumno - icono que el usuario puede subir en sus datos personales. Si no tiene foto de perfil, usar la imagen genérica de usuario
    -   Información del curso a mostrar en el correo:

        -   [ ] Nombre Categoría
        -   [ ] Nombre Curso
        -   [ ] Imagen de Portada del curso
        -   [ ] Enlace directo clickeable en el correo que lleve directamente al "Ver Curso" en donde se inscribió.

---

#### Item F2 - Archivos de Video 🚥 / 7 puntos🚥

-   Subir videos en un Curso - 5 puntos:
    -   [ ] Permitir que el profesor de un curso pueda adjuntar un archivo de video a un curso (upload), de forma opcional, al momento de crear/editar un curso, de la misma forma que puede asociar una imagen como portada del curso.
    -   [ ] Validar la extensión del archivo. Definir 2 extensiones que permitirá su app. Mencionarlas en la documentación. En caso de error mostrar un mensaje "amigable" adecuado de validación en pantalla.
    -   [ ] Los videos deben subirse dentro de la carpeta:
            `/assets/videos/{idCurso}/{nombreOriginalVideo.extensión}`
    -   [ ] En el caso de subir dos veces un mismo video (mismo nombre) a un mismo curso,
            emitir un error "amigable" adecuado de validación en pantalla.
    -   [ ] Se debe validar la extensión máxima del video (tamaño) a 3MB. En caso de error mostrar un mensaje "amigable" adecuado de validación en pantalla.
    -   [ ] Ningún archivo de video, existente o futuro, deberá "trackearse" en el repo Git.
-   Ver Stream de videos - 2 puntos:
    -   [ ] En las páginas de Ver Curso, el curso tiene un video asociado debe visualizarse como un stream (**no una descarga**) dentro de la vista del curso. No utilizar una página externa.
    -   [ ] Asegurarse de incluir en la documentación una captura de ejemplo de como se debe visualizar el video dentro de su página, así como un ejemplo donde encontrar esta visualización.
    -   [ ] El video solo debe ser visible para usuarios que son alumnos o profesores del curso donde fueron subidos.

---

#### Item F3 - Notas de Alumno 🚥 / 8 puntos🚥

-   Notas de Alumno - Profesor - 5 puntos:
    -   [ ] En el menú de Ver Curso para un profesor, agregar una opción que permita cargar calificaciones de los alumnos inscriptos (Aprobado / Reprobado) en una nueva página.
    -   [ ] Asegurarse la opción "Ver Mis Cursos como Profesor" exista y sea accesible desde el navbar para un usuario logueado.
    -   [ ] En la nueva página, se deben listar todos los alumnos inscriptos ordenados alfabeticamente, un alumno por fila.
    -   [ ] Por cada alumno debe permitir registrar su calificación y guardarla en un elemento de formulario adecuado. Esto se debe hacer por todo el "paquete" de alumnos, es decir no tener un botón guardar por cada alumno, sino un solo botón que guarda las calificaciones de todos los alumnos de una sola vez. Debe aceptar valores nulos, lo cuál debería dejar al alumno sin calificación.
    -   [ ] En caso que el alumno ya tenga una calificación previamente, está debe aparecer pre-cargada en el formulario.
-   Ver Calificación Alumno - 2 puntos:
    -   [ ] Actualizar las vistas de Ver Curso para que un alumno, al ingresar a dicho curso, si tiene calificación pueda visualizar claramente en esa interfaz su calificación. Agregar una captura en la documentación mostrando cómo se debe visualizar. No debe mostrarse nada al alumno si no tiene calificación (valor nulo).

---

#### Item F4 - Correlatividades 🚥 / 10 puntos 🚥

-   Correlatividades - Creación - 5 puntos:

    Desde el menú Admin, agregar una opción para gestionar cursos correlativos.

    Un curso correlativo es aquel que requiere haber aprobado uno previo para permitir la inscripción en este.

    Ejemplo, si IS3 se registra como requisito correlativo de IS4, solo los alumnos que tengan calificación APROBADA en IS3 pueden autoinscribirse a IS4.

    -   [ ] Un curso puede tener cero, uno o muchos cursos correlativos previos.
    -   [ ] Se debe poder encontrar que cursos tienen correlativas y cuáles no en el menú de Admin. Agregar en la documentación la captura y el enlace donde encontrar esta información.
    -   [ ] Se debe validar que un curso no se pueda registrar más de una vez como
            correlativo de otro (es decir, IS3 -> IS4 no debería poder registrarse dos veces).
    -   [ ] Se debe poder eliminar una correlativa en cualquier momento.
    -   [ ] Utilizar elementos adecuados para editar cursos y correlativas desde una página para cada curso.
    -   [ ] Agregar en la documentación los URLs de ejemplo donde se gestionan correlativas y capturas necesarias.

-   Correlatividades - AutoInscripción - 5 puntos:
    -   [ ] Implementar el control de cursos correlativos al momento de autoinscribirse un alumno a un curso. El control solo debe ser cumplido si el alumno ha APROBADO las correlativas (los que no tienen calificación o tienen REPROBADO por tanto, no lo hacen).
    -   [ ] El control solo debe ser aplicado en la auto-inscripción de un usuario como alumno de un curso.
    -   [ ] Si el admin inscribe a un alumno, no debe aplicarse el control.
    -   [ ] En caso de error de validación, se debe mostrar un error adecuado en pantalla indicando cuál(es) cursos correlativos está incumpliendo.
    -   [ ] En caso que un curso tenga muchas correlativas, se deben cumplir todas para permitir la inscripción.

---

### Testing: 🚥 / 6 puntos 🚥

-   Test de Interfaz:
    Crear un test de interfaz utilizando Playwright.
    -   [ ] El test debe ser ejecutado en el navegador Mozilla únicamente.
    -   [ ] Debe mostrarse la ejecución en el modo gráfico.
    -   El test debe:
        -   [ ] Autoregistrar un usuario. Utilizar un diccionario o generador de correos y datos para que cada ejecución inserte un nuevo usuario sin repetir datos. Puede definir valores aleatorios adecuados para cada campo. Imprimir en la consola los valores al iniciar la ejecución. El password siempre será el valor utilizado de pruebas en el semestre.
        -   [ ] Hacer login con el usuario
        -   [ ] Validar carga correctamente su página "home".
        -   [ ] Guardar una captura de pantalla automática en este punto.
        -   [ ] Hacer logout.
        -   [ ] Hacer login con un usuario administrador (datos del login en duro en el test)
        -   [ ] Ir al menú de asignar profesor a curso.
        -   [ ] Asignar al usuario autoregistrado al inicio del test como profesor de un curso dado (predeterminado en código) a través del formulario Web.
        -   [ ] Guardar una captura de pantalla automática en este punto.
    -   Debe poder ejecutarse con un comando el cuál debe permitir la ejecución del proceso completo.
    -   Documentar el comando de forma visible y entendible (como texto) en la documentación.
    -   Mostrar la salida con capturas en la documentación.

---

### Documentación: 🚥 / 4 puntos 🚥

-   Wiki

    En un proceso de desarrollo de Software, la documentación es clave. Para esta entrega
    tendrán que leer e investigar como utilizar la Wiki del GitLab para documentar su proyecto. Deberán:

    -   [ ] Crear una página principal en la Wiki de su proyecto.
    -   [ ] Crear una subpágina en la Wiki por cada item solicitado dentro de este examen. Lease,
            si hay 3 requerimientos a implementar, deberían haber 3 subpáginas dentro de la Wiki.
    -   Dentro de cada página de ticket deberán indicar los cambios realizados a nivel de usando la siguiente plantilla:

        -   Una o más capturas de la implementación
        -   Descripción u observaciones. Texto libre para indicar brevemente que
            implicó la implementación o modificación realizada.
        -   Base de datos. Énfasis en ajustes realizados con capturas de estas modificaciones con capturas de las modificaciones.
        -   Rutas: Creadas
        -   Modelos: Nuevos o modificados.
        -   Controlador: Nuevos o modificados.
        -   Validaciones y como se muestran. Qué validaciones ha implementado, en front o back,
            como se muestra un error de validación en pantalla (captura).
        -   Interfaz y estilos de presentación
        -   Comandos (por ejemplo comandos a ejecutar en terminal)

    -   Cada sección deberá tener un título y su desarrollo.
    -   Cada sección que no aplique deberá tener el texto "N/A". Es decir, si el requerimiento item
        #F1 (ejemplo) no tuvo modificaciones en la base de datos, no se elimina la sección, sino simplemente se define como su contenido "N/A".
    -   [ ] En la página principal de la Wiki agregar el DER completo de su aplicación, así como una breve descripción del trabajo realizado.

    -   [ ] Agregar en el footer de la App Web un enlace para llegar directamente a la página
            principal de la documentación. Este enlace deberá estar visible
            en todos los footers de la app, en caso de tener más de uno.

    -   Se evaluará:

        -   Correctitud: Lo que se ve en la Wiki representa la versión entregada del código, y viceversa. 2 puntos
        -   Presentación: Elementos solicitados están presentes en la Wiki. Presentación adecuada
            de elementos en la Wiki (títulos utilizando elementos de títulos, párrafos, imágenes
            son visibiles y entendibles, ortografía, coherencia entre el texto y las secciones). 2 puntos

        Para tener el puntaje total además se deben documentar todas las funcionalidades solicitadas correctamente.

---

---

# Examen Final - Primera Oportunidad

## Actividades a implementar (en el repositorio GitLab):

### Diseño y Programación:

---

#### Item F1 - Envío de correo - 5 puntos

-   [ ] Implementar el envío de correos a un profesor, cuando es asignado como profesor de un curso.
-   [ ] Debe utilizarse [MailTrap](https://mailtrap.io/es/) para validar el envío de correos sin necesidad de un servidor especial.
-   [ ] Utilizar una plantilla adecuada (no simplemente un texto genérico).
-   [ ] Seguir los lineamientos en clase para el uso de valores confidenciales en el proyecto y el Git.
-   El correo debe mostrar:

    -   [ ] el nombre y logo usado en su Web
    -   [ ] Información del profesor
    -   Información del curso:

        -   [ ] Nombre Categoría
        -   [ ] Nombre Curso
        -   [ ] Imagen de Portada

---

#### Item F2 - Archivos de Video

-   Subir videos en Secciones de un Curso - 4 puntos:
    -   [ ] Permitir que solo el/los profesor de un curso pueda adjuntar (subir) un archivo de video a una sección (upload), de forma opcional.
    -   [ ] El profesor de un curso debería poder subir el video solo en la página de visualización de la sección dentro del curso (página ya existente implementada en entregas anteriores).
    -   [ ] Una sección solo debe poder tener un video asociado. Pero en caso de subirse un video incorrectamente, se debe poder remover el video de la sección por parte del profesor. Validar que al eliminar un video de una sección, se elimine el archivo de la carpeta de videos.
    -   [ ] Validar la extensión del archivo. Definir 2 extensiones que permitirá su app. Mencionarlas en la documentación.
    -   [ ] Los videos deben subirse dentro de la carpeta:
            `/assets/videos/{idCurso}/{idSeccion}/{nombreOriginalVideo.extensión}`
    -   [ ] Se debe validar la extensión máxima del video (tamaño) a 3MB.
    -   [ ] Ningún archivo de video, existente o futuro, deberá "trackearse" en el repo Git.
-   Ver Stream de videos en Secciones - 4 puntos:
    -   [ ] En las páginas de Ver Curso, si una
            sección tiene un video asociado debe poder visualizarse desde la sección por parte del alumno del curso.
    -   [ ] El video debe visualizarse como un stream (**no una descarga**) dentro de la vista del curso asociado a la sección donde fue subido. No utilizar una página externa.
    -   [ ] Asegurarse de incluir en la documentación una captura de ejemplo de como se debe visualizar dentro de su página, así como un ejemplo donde encontrar esta visualización.
    -   [ ] El video solo debe ser visible para usuarios que son alumnos o profesores del curso donde fueron subidos.

---

#### Item F3 - Rutas de Aprendizaje

-   Ruta de aprendizaje - Admin - 5 puntos:
    -   [ ] En el menú de Administrador agregar una opción para manejar (crear, editar, listar) "Rutas de Aprendizaje".
    -   [ ] Una "Ruta de Aprendizaje" debe tener un nombre, y además debe poder agregarse uno o más cursos a esta.
    -   [ ] Un ejemplo podría ser una "Ruta" llamada "FullStack" y que contenga varios cursos. Pueden ser
            de la misma o distinta categoría.
    -   [ ] Las "rutas", dentro del módulo de administrador, deben poder crearse con un nombre obligatoriamente. Aplicar validación.
    -   [ ] Al editar una "ruta" debe mostrar los cursos que tenga agregado, así como permitir agregar uno o más adicionalmente en cualquier momento.
    -   [ ] Claramente, si podemos agregar un curso, debemos poder removerlo de la "ruta" en caso que lo hayamos
            agregado incorrectamente.
    -   [ ] Un curso solo debe poder estar dentro de una ruta, no puede estar en más de una, al mismo tiempo.
-   Ver Ruta de Aprendizaje - 2 puntos:
    -   [ ] Actualizar las vistas de Ver Curso para mostrar el nombre de la "ruta" de un curso, en caso de que la tenga.

---

#### Item F4 - Correlatividades

-   Correlatividades - Creación - 5 puntos:

    Solo dentro de una ruta de aprendizaje, se deben poder definir cursos correlativos.
    Un curso correlativo implica que el alumno debe estar inscripto como alumno en la correlativa previa para inscribirse al curso.

    Ejemplo, si IS3 se registra como requisito correlativo de IS4, solo los alumnos que están inscriptos en IS3 pueden autoinscribirse a IS4.

    -   [ ] Un curso puede tener cero, uno o muchos cursos correlativos previos, pero solo de cursos que formen parte de la misma ruta.
    -   [ ] Un curso que no forme parte de ninguna ruta, no puede tener correlativas.
    -   [ ] Se debe validar que un curso no se pueda registrar más de una vez como
            correlativo de otro (es decir, IS3 -> IS4 no debería poder registrarse dos veces).
    -   [ ] Se debe poder eliminar una correlativa en cualquier momento.
    -   [ ] Utilizar elementos adecuados para editar cursos y correlativas dentro de una ruta.
    -   [ ] Especial atención al remover un curso de una "ruta" solicitado previamente. Se debe validar que no tenga una correlativa antes de hacerlo.

-   Correlatividades - AutoInscripción - 5 puntos:
    -   [ ] Implementar el control de cursos correlativos al momento de autoinscribirse un alumno a un curso.
    -   [ ] El control solo debe ser aplicado en la auto-inscripción de un usuario como alumno de
            un curso.
    -   [ ] Si el admin inscribe a un alumno, no debe aplicarse el control.
    -   [ ] En caso de error de validación, se debe mostrar un error adecuado en pantalla indicando cuál(es) cursos correlativos está incumpliendo.
    -   [ ] En caso que un curso tenga muchas correlativas, se deben cumplir todas para permitir la inscripción.

---

### Testing:

-   Test de Interfaz - 5 puntos:
    Crear un test de interfaz utilizando Playwright.
    -   [ ] El test debe ser ejecutado en el navegador Mozilla únicamente.
    -   [ ] Debe mostrarse la ejecución en el modo gráfico.
    -   El test debe:
        -   [ ] Autoregistrar un usuario. Utilizar un diccionario o generador de correos y datos para que cada ejecución inserte un nuevo usuario sin repetir datos. Puede definir valores aleatorios adecuados para cada campo. Imprimir en la consola los valores al iniciar la ejecución. El password siempre será el valor utilizado de pruebas en el semestre.
        -   [ ] Hacer login con el usuario
        -   [ ] Validar carga correctamente su página "home".
        -   [ ] Inscribirse a un curso al cuál no sea posible por correlatividad.
        -   [ ] Validar el error en base a un elemento visible en pantalla. El curso debe estar definido "en duro" en la prueba. Se debe generar una captura de pantalla en este punto automático en el test.
        -   [ ] Inscribirse a un curso al cuál si sea posible por correlatividad.
        -   [ ] Validar el exito en base a un elemento visible en pantalla. El curso debe estar definido "en duro" en la prueba. Se debe generar una captura de pantalla en este punto automático en el test.
    -   Debe poder ejecutarse con un comando el cuál debe permitir la ejecución del proceso completo.
    -   Documentar el comando de forma visible y entendible (como texto) en la documentación.
    -   Mostrar la salida con capturas en la documentación.

---

### Documentación:

-   Wiki - 5 puntos

    En un proceso de desarrollo de Software, la documentación es clave. Para esta entrega
    tendrán que leer e investigar como utilizar la Wiki del GitLab para documentar su proyecto. Deberán:

    -   [ ] Crear una página principal en la Wiki de su proyecto.
    -   [ ] Crear una subpágina en la Wiki por cada item solicitado dentro de este examen. Lease,
            si hay 3 requerimientos a implementar, deberían haber 3 subpáginas dentro de la Wiki.
    -   Dentro de cada página de ticket deberán indicar los cambios realizados a nivel de usando la siguiente plantilla:

        -   Una o más capturas de la implementación
        -   Descripción u observaciones. Texto libre para indicar brevemente que
            implicó la implementación o modificación realizada.
        -   Base de datos. Énfasis en ajustes realizados con capturas de estas modificaciones con capturas de las modificaciones.
        -   Rutas: Creadas
        -   Modelos: Nuevos o modificados.
        -   Controlador: Nuevos o modificados.
        -   Validaciones y como se muestran. Qué validaciones ha implementado, en front o back,
            como se muestra un error de validación en pantalla (captura).
        -   Interfaz y estilos de presentación
        -   Comandos (por ejemplo comandos a ejecutar en terminal)

    -   Cada sección deberá tener un título y su desarrollo.
    -   Cada sección que no aplique deberá tener el texto "N/A". Es decir, si el requerimiento item
        #F1 (ejemplo) no tuvo modificaciones en la base de datos, no se elimina la sección, sino simplemente se define como su contenido "N/A".
    -   En la página principal de la Wiki agregar el DER completo de su aplicación, así como una breve descripción del trabajo realizado.

    -   Agregar en el footer de la App Web un enlace para llegar directamente a la página
        principal de la documentación. Este enlace deberá estar visible
        en todos los footers de la app, en caso de tener más de uno.

    -   Se evaluará:

        -   Correctitud: Lo que se ve en la Wiki representa la versión entregada del código, y viceversa. 2,5 puntos
        -   Presentación: Elementos solicitados están presentes en la Wiki. Presentación adecuada
            de elementos en la Wiki (títulos utilizando elementos de títulos, párrafos, imágenes
            son visibiles y entendibles, ortografía, coherencia entre el texto y las secciones). 2,5 puntos

        Para tener el puntaje total además se deben documentar todas las funcionalidades solicitadas correctamente.

    </del>

---
