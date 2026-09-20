function requerAutenticacao(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.redirect('/login');
}

function autorizarPerfil(perfilRequerido) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.redirect('/login');
    }

    if (req.session.usuario.perfil !== perfilRequerido) {
      return res.status(403).render('403', {
        rota: req.originalUrl,
        perfilAtual: req.session.usuario.perfil,
        perfilRequerido
      });
    }

    next();
  };
}

module.exports = {
  requerAutenticacao,
  autorizarPerfil
};
