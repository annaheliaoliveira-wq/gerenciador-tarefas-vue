const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'chave-temporaria-desenvolvimento';

function requerJWT(req, res, next) {
  const autorizacao = req.headers.authorization;

  if (!autorizacao || !autorizacao.startsWith('Bearer ')) {
    return res.status(401).json({
      erro: 'Token de autenticação não informado.'
    });
  }

  const token = autorizacao.split(' ')[1];

  try {
    req.usuarioJWT = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({
      erro: 'Token inválido ou expirado.'
    });
  }
}

function requerAdminJWT(req, res, next) {
  requerJWT(req, res, () => {
    if (req.usuarioJWT.perfil !== 'admin') {
      return res.status(403).json({
        erro: 'Acesso permitido somente a administradores.'
      });
    }

    next();
  });
}
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
  autorizarPerfil,
  requerJWT,
  requerAdminJWT
};
