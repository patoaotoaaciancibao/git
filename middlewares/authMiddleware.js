function userLogin(req, res, next) {
  console.log('Sesión del usuario:', req.session.usuario); // Verifica la sesión aquí
  if (req.session && req.session.usuario) {
    return next(); // ✅ Usuario logueado
  } else {
    return res.redirect('/admin-login?error=sinpermiso'); // ✅
  }
}


module.exports = userLogin;
