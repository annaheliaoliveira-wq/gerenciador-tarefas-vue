const express = require('express');
const session = require('express-session');
const path = require('path');
const jwt = require('jsonwebtoken');
const { Tarefa, Usuario } = require('./models');
const bcrypt = require('bcryptjs');
const {
  requerAutenticacao,
  autorizarPerfil,
  requerJWT,
  requerAdminJWT
} = require('./middlewares/auth');
const inicializarBanco = require('./config/seed');

const app = express();
const PORT = 3000;
// Interpretar os dados enviados nas requisições
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Rotas protegidas por JWT começam abaixo
app.get('/api/teste-jwt', requerJWT, (req, res) => {
  res.json({
    mensagem: 'Token JWT validado com sucesso!',
    usuario: req.usuarioJWT
  });
});

app.get('/api/minhas-tarefas', requerJWT, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      where: { usuarioId: req.usuarioJWT.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({ tarefas });
  } catch (error) {
    next(error);
  }
});

app.post('/api/minhas-tarefas', requerJWT, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || !titulo.trim()) {
      return res.status(400).json({
        erro: 'O título da tarefa é obrigatório.'
      });
    }

    const tarefa = await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || '',
      concluida: false,
      usuarioId: req.usuarioJWT.id
    });

    return res.status(201).json({
      mensagem: 'Tarefa cadastrada com sucesso.',
      tarefa
    });
  } catch (error) {
    next(error);
  }
});


app.patch('/api/minhas-tarefas/:id/toggle', requerJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findOne({
      where: {
        id: req.params.id,
        usuarioId: req.usuarioJWT.id
      }
    });

    if (!tarefa) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.'
      });
    }

    tarefa.concluida = !tarefa.concluida;
    await tarefa.save();

    return res.json({
      mensagem: 'Status atualizado com sucesso.',
      tarefa
    });
  } catch (error) {
    next(error);
  }
});


app.delete('/api/minhas-tarefas/:id', requerJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findOne({
      where: {
        id: req.params.id,
        usuarioId: req.usuarioJWT.id
      }
    });

    if (!tarefa) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.'
      });
    }

    await tarefa.destroy();

    return res.json({
      mensagem: 'Tarefa excluída com sucesso.'
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/admin/tarefas', requerAdminJWT, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      include: [{
        model: Usuario,
        as: 'usuario',
        attributes: ['id', 'nome', 'email']
      }],
      order: [['id', 'ASC']]
    });

    res.json({ tarefas });
  } catch (error) {
    next(error);
  }
});


app.post('/api/admin/tarefas', requerAdminJWT, async (req, res, next) => {
  try {
    const { titulo, descricao, usuarioId } = req.body;

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({
        erro: 'O título da tarefa é obrigatório.'
      });
    }

    const tarefa = await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || null,
      usuarioId: usuarioId || req.usuarioJWT.id
    });

    res.status(201).json({
      mensagem: 'Tarefa criada com sucesso.',
      tarefa
    });
  } catch (error) {
    next(error);
  }
});

// COLE A NOVA ROTA DE EDIÇÃO AQUI, ABAIXO DA ROTA DE CRIAÇÃO

app.put('/api/admin/tarefas/:id', requerAdminJWT, async (req, res, next) => {
  try {
    const { titulo, descricao, concluida, usuarioId } = req.body;

    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.'
      });
    }

    if (titulo !== undefined) {
      if (typeof titulo !== 'string' || titulo.trim() === '') {
        return res.status(400).json({
          erro: 'O título da tarefa é obrigatório.'
        });
      }

      tarefa.titulo = titulo.trim();
    }

    if (descricao !== undefined) {
      tarefa.descricao = descricao;
    }

    if (concluida !== undefined) {
      tarefa.concluida = concluida;
    }

    if (usuarioId !== undefined) {
      tarefa.usuarioId = usuarioId;
    }

    await tarefa.save();

    res.json({
      mensagem: 'Tarefa atualizada com sucesso.',
      tarefa
    });
  } catch (error) {
    next(error);
  }
});

app.delete('/api/admin/tarefas/:id', requerAdminJWT, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({
        erro: 'Tarefa não encontrada.'
      });
    }

    await tarefa.destroy();

    res.json({
      mensagem: 'Tarefa excluída com sucesso.'
    });
  } catch (error) {
    next(error);
  }
});


app.get('/api/admin/usuarios', requerAdminJWT, async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'email', 'perfil', 'createdAt'],
      order: [['id', 'ASC']]
    });

    res.json({ usuarios });
  } catch (error) {
    next(error);
  }
});

app.post('/api/admin/usuarios', requerAdminJWT, async (req, res, next) => {
  try {
    const { nome, email, senha, perfil } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        erro: 'Nome, e-mail e senha são obrigatórios.'
      });
    }

    if (typeof nome !== 'string' ||
        typeof email !== 'string' ||
        typeof senha !== 'string' ||
        (perfil !== undefined && typeof perfil !== 'string')) {
      return res.status(400).json({
        erro: 'Os dados enviados são inválidos.'
      });
    }

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      return res.status(400).json({
        erro: 'Nome, e-mail e senha não podem ficar vazios.'
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const existente = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (existente) {
      return res.status(409).json({
        erro: 'Já existe um usuário com esse e-mail.'
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
      nome: nome.trim(),
      email: emailNormalizado,
      senha: senhaHash,
      perfil: perfil === 'admin' ? 'admin' : 'user'
    });

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      usuario: {
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        perfil: novoUsuario.perfil
      }
    });
  } catch (error) {
    next(error);
  }
});


const JWT_SECRET = process.env.JWT_SECRET || 'chave-temporaria-desenvolvimento';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'segredo-gerenciador-tarefas-web3',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.erro = null;
  next();
});

app.use((req, res, next) => {
  const agora = new Date();
  const data = agora.toLocaleDateString('pt-BR');
  const hora = agora.toLocaleTimeString('pt-BR');
  console.log(`[${data} ${hora}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/autor', (req, res) => {
  res.render('autor');
});


app.get('/objetos', async (req, res, next) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.pagina, 10) || 1);
    const limite = 5;

    const resultado = await Tarefa.findAndCountAll({
      limit: limite,
      offset: (pagina - 1) * limite,
      order: [['createdAt', 'DESC']]
    });

    const tarefas = resultado.rows;
    const totalPaginas = Math.max(
      1,
      Math.ceil(resultado.count / limite)
    );

    if (req.headers.accept?.includes('application/json')) {
      return res.json({
        tarefas,
        pagina,
        totalPaginas,
        total: resultado.count
      });
    }

    res.render('objetos', {
      tarefas,
      pagina,
      totalPaginas
    });
  } catch (error) {
    next(error);
  }
});


app.get('/objetos/:id', async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).render('404', {
        rota: req.originalUrl
      });
    }

    if (req.headers.accept?.includes('application/json')) {
      return res.json(tarefa);
    }

    res.render('detalhes', { tarefa });
  } catch (error) {
    next(error);
  }
});

console.log('Rota /autor registrada');

app.get('/login', (req, res) => {
  if (req.session && req.session.usuario) {
    return res.redirect('/');
  }
  res.render('login', { erro: null });
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const aceitaJSON = req.headers.accept?.includes('application/json');

    if (!email || !senha || email.trim() === '' || senha.trim() === '') {
      if (aceitaJSON) {
        return res.status(400).json({
          erro: 'E-mail e senha são obrigatórios.'
        });
      }

      return res.status(400).render('login', {
        erro: 'E-mail e senha são obrigatórios.'
      });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() }
    });

    if (!usuario || !usuario.verificarSenha(senha)) {
      if (aceitaJSON) {
        return res.status(401).json({
          erro: 'Credenciais inválidas. Verifique seu e-mail e senha.'
        });
      }

      return res.status(401).render('login', {
        erro: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    const dadosUsuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    };

    if (aceitaJSON) {
      const token = jwt.sign(
        dadosUsuario,
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.json({
        mensagem: 'Login realizado com sucesso.',
        token,
        usuario: dadosUsuario
      });
    }

    req.session.usuario = dadosUsuario;
    return res.redirect('/');

  } catch (error) {
    next(error);
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.redirect('/login');
  });
});

app.get('/', requerAutenticacao, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      where: { usuarioId: req.session.usuario.id },
      order: [['createdAt', 'DESC']]
    });
    res.render('index', { tarefas, erro: null });
  } catch (error) {
    next(error);
  }
});

app.post('/tarefas', requerAutenticacao, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || titulo.trim() === '') {
      const tarefas = await Tarefa.findAll({
        where: { usuarioId: req.session.usuario.id },
        order: [['createdAt', 'DESC']]
      });
      return res.status(400).render('index', {
        tarefas,
        erro: 'O título da tarefa é obrigatório.'
      });
    }

    await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : null,
      usuarioId: req.session.usuario.id
    });

    res.redirect('/');
  } catch (error) {
    next(error);
  }
});

app.post('/tarefas/:id/toggle', requerAutenticacao, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).render('404', { rota: req.originalUrl });
    }

    if (tarefa.usuarioId !== req.session.usuario.id && req.session.usuario.perfil !== 'admin') {
      return res.status(403).render('403', {
        rota: req.originalUrl,
        perfilAtual: req.session.usuario.perfil,
        perfilRequerido: 'Proprietário da tarefa ou Administrador'
      });
    }

    tarefa.concluida = !tarefa.concluida;
    await tarefa.save();
    res.redirect(req.headers.referer || '/');
  } catch (error) {
    next(error);
  }
});

app.post('/tarefas/:id/delete', requerAutenticacao, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).render('404', { rota: req.originalUrl });
    }

    if (tarefa.usuarioId !== req.session.usuario.id && req.session.usuario.perfil !== 'admin') {
      return res.status(403).render('403', {
        rota: req.originalUrl,
        perfilAtual: req.session.usuario.perfil,
        perfilRequerido: 'Proprietário da tarefa ou Administrador'
      });
    }

    await tarefa.destroy();
    res.redirect(req.headers.referer || '/');
  } catch (error) {
    next(error);
  }
});

app.get('/vue', requerAutenticacao, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vue-tarefas.html'));
});

app.get('/api/tarefas', requerAutenticacao, async (req, res, next) => {
  try {
    const tarefas = await Tarefa.findAll({
      where: { usuarioId: req.session.usuario.id },
      order: [['createdAt', 'DESC']]
    });
    res.json({
      usuario: req.session.usuario,
      tarefas
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao carregar tarefas.' });
  }
});

app.post('/api/tarefas', requerAutenticacao, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;
    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O título da tarefa é obrigatório.' });
    }
    const tarefa = await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : null,
      usuarioId: req.session.usuario.id
    });
    res.status(201).json(tarefa);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao cadastrar tarefa.' });
  }
});

app.post('/api/tarefas/:id/toggle', requerAutenticacao, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }
    if (tarefa.usuarioId !== req.session.usuario.id && req.session.usuario.perfil !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    tarefa.concluida = !tarefa.concluida;
    await tarefa.save();
    res.json(tarefa);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao alternar status da tarefa.' });
  }
});

app.post('/api/tarefas/:id/delete', requerAutenticacao, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }
    if (tarefa.usuarioId !== req.session.usuario.id && req.session.usuario.perfil !== 'admin') {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }
    await tarefa.destroy();
    res.json({ mensagem: 'Tarefa excluída com sucesso.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir tarefa.' });
  }
});

app.post('/admin/usuarios', requerAutenticacao, autorizarPerfil('admin'), async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome?.trim() || !email?.trim() || !senha?.trim()) {
      return res.status(400).send('Preencha nome, e-mail e senha.');
    }

    const emailNormalizado = email.trim().toLowerCase();

    const existente = await Usuario.findOne({
      where: { email: emailNormalizado }
    });

    if (existente) {
      return res.status(409).send('Já existe um usuário com esse e-mail.');
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = await Usuario.create({
  nome: nome.trim(),
  email: emailNormalizado,
  senha: senhaHash,
  perfil: 'user'
});

console.log('Usuário cadastrado:', novoUsuario.id, novoUsuario.email);

return res.redirect('/admin');
  } catch (error) {
    next(error);
  }
});


app.get('/admin', requerAutenticacao, autorizarPerfil('admin'), async (req, res, next) => {
  try {
    const usuarios = await Usuario.findAll({
      include: [{ model: Tarefa, as: 'tarefas' }],
      order: [['nome', 'ASC']]
    });

    const todasTarefas = await Tarefa.findAll({
      include: [{ model: Usuario, as: 'usuario' }],
      order: [['createdAt', 'DESC']]
    });

    const metricas = {
      totalUsuarios: usuarios.length,
      totalTarefas: todasTarefas.length,
      tarefasConcluidas: todasTarefas.filter(t => t.concluida).length,
      tarefasPendentes: todasTarefas.filter(t => !t.concluida).length
    };

    res.render('admin', { usuarios, todasTarefas, metricas });
  } catch (error) {
    next(error);
  }
});

app.get('/erro-400', (req, res) => {
  res.status(400).render('400', {
    mensagem: 'Exemplo de requisição inválida.'
  });
});

app.get('/erro-500', (req, res, next) => {
  throw new Error('Falha interna intencional simulada.');
});

app.use((req, res) => {
  res.status(404).render('404', { rota: req.originalUrl });
});

app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(500).render('500', { erro: err.message });
});

inicializarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error(err);
});
