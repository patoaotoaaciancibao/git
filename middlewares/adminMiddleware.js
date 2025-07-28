function esAdmin(req, res, next) {
  if (req.session.usuario?.rol === 'admin' || req.session.usuario?.rol === 'profesor') {
    return next();
  }
  // Redirigir si no tiene permisos
  return res.redirect('/admin-login?error=sinpermiso');
}



module.exports = esAdmin;
