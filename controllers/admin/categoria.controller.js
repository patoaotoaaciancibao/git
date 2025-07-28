const categoriaModel = require('../../models/categoriaModel');
const logger = require('../../utils/logger');
const path = require('path');
const fs = require('fs');

const categoriaController = {
    formCrearCategoria: (req, res) => {
        res.render('admin/categorias/crear_cat', { errors: [] });
    },

    crearCategoria: async (req, res) => {
        const { nombre } = req.body;
        const errors = [];

        if (!nombre || nombre.trim() === '') {
            errors.push('El nombre de la categoría es obligatorio.');
            return res.render('admin/categorias/crear_cat', { errors });
        }

        try {
            const nuevaCategoria = await categoriaModel.crearCategoria(nombre.trim());
            const idCategoria = nuevaCategoria.id;

            if (req.file) {
                const ext = path.extname(req.file.originalname).toLowerCase();
                const extensionesValidas = ['.jpg', '.jpeg', '.png', '.webp'];

                if (!extensionesValidas.includes(ext)) {
                    fs.unlinkSync(req.file.path); // eliminar el archivo inválido
                    errors.push('Tipo de archivo no válido. Solo se permiten JPG, PNG o WEBP.');
                    return res.render('admin/categorias/crear_cat', { errors });
                }

                const nuevoNombre = `${idCategoria}${ext}`;
                const rutaNueva = path.join('./assets/categorias', nuevoNombre);

                fs.renameSync(req.file.path, rutaNueva);
                await categoriaModel.guardarImagenCategoria(idCategoria, nuevoNombre);
            } else {
                // ✅ Si no se subió imagen, usar "generica.jpg"
                await categoriaModel.guardarImagenCategoria(idCategoria, 'generica.jpg');
            }

            logger.debug(`Categoría creada - ID: ${idCategoria}`);
            res.redirect('/admin/categorias');
        } catch (error) {
            console.error(error);
            errors.push('Error al crear la categoría.');
            res.render('admin/categorias/crear_cat', { errors });
        }
    },

    formEditarCategoria: async (req, res) => {
        const { id } = req.params;

        try {
            const categoria = await categoriaModel.buscarCategoriaPorId(id);
            if (!categoria) return res.status(404).send('Categoría no encontrada');

            res.render('admin/categorias/editar_cat', { categoria, errors: [] });
        } catch (error) {
            console.error('Error al cargar la categoría:', error);
            res.status(500).send('Error al cargar la categoría');
        }
    },

    editarCategoria: async (req, res) => {
        const { id } = req.params;
        const { nombre } = req.body;
        const errors = [];

        if (!nombre || nombre.trim() === '') {
            errors.push('El nombre de la categoría es obligatorio.');
            const categoria = await categoriaModel.buscarCategoriaPorId(id);
            return res.render('admin/categorias/editar_cat', { categoria, errors });
        }

        try {
            let nuevoNombreImagen = null;

            if (req.file) {
                const ext = path.extname(req.file.originalname).toLowerCase();
                const extensionesValidas = ['.jpg', '.jpeg', '.png', '.webp'];

                if (!extensionesValidas.includes(ext)) {
                    fs.unlinkSync(req.file.path); // eliminar archivo inválido
                    const categoria = await categoriaModel.buscarCategoriaPorId(id);
                    errors.push('Tipo de archivo no válido. Solo se permiten JPG, PNG o WEBP.');
                    return res.render('admin/categorias/editar_cat', { categoria, errors });
                }

                const categoria = await categoriaModel.buscarCategoriaPorId(id);

                if (categoria.imagen) {
                    const rutaAnterior = path.join('./assets/categorias', categoria.imagen);
                    if (fs.existsSync(rutaAnterior)) {
                        fs.unlinkSync(rutaAnterior);
                    }
                }

                nuevoNombreImagen = `${id}${ext}`;
                const rutaNueva = path.join('./assets/categorias', nuevoNombreImagen);
                fs.renameSync(req.file.path, rutaNueva);
            }

            await categoriaModel.editarCategoria(id, nombre.trim(), nuevoNombreImagen);
            res.redirect('/admin/categorias');
        } catch (error) {
            console.error('Error al editar la categoría:', error);
            errors.push('Error al editar la categoría.');
            const categoria = await categoriaModel.buscarCategoriaPorId(id);
            res.render('admin/categorias/editar_cat', { categoria, errors });
        }
    }
};

module.exports = categoriaController;
