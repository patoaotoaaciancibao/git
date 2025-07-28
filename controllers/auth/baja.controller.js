const userModel = require('../../models/userModel');

const bajaController = {
    confirmarBaja: (req, res) => {
        if (req.session.usuario.rol === 'admin') {
            return res.redirect('/admin/home?error=baja_admin');
        }
        res.render('auth/dar-de-baja'); // Vista nueva
    },

    procesarBaja: async (req, res) => {
        const usuario = req.session.usuario;

        if (!usuario) {
            console.warn("❌ Usuario no logueado intentó acceder a dar de baja.");
            return res.redirect('/acceso');
        }

        if (usuario.rol === 'admin') {
            console.warn("🔒 Intento de baja por un administrador:", usuario.email);
            return res.redirect('/admin/home?error=baja_admin');
        }

        try {
            console.log("🧪 Ejecutando darDeBaja con ID:", usuario.id_usuario);

            await userModel.darDeBaja(usuario.id_usuario);

            console.log("✅ Baja completada");
            req.session.destroy(() => res.redirect('/acceso?msg=baja_exitosa'));
        } catch (err) {
            console.error("❌ Error real:", err.message);
            res.status(500).send('Error al procesar la baja.');
        }
    }

};

module.exports = bajaController;
