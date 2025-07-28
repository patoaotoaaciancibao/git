function esProfesor(req, res, next) {
  if (req.session?.usuario?.rol === 'profesor') {
    return next(); // Si es profesor, permite el acceso
  } else {
    // Si no es profesor, redirige al login con mensaje de permiso denegado
    return res.redirect('/admin-login?error=sinpermiso');
  }
}

module.exports = esProfesor;
