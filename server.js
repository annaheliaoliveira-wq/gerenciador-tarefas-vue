const express = require('express');
const session = require('express-session');
const path = require('path');
const { Tarefa, Usuario } = require('./models');
const { requerAutenticacao, autorizarPerfil } = require('./middlewares/auth');
const inicializarBanco = require('./config/seed');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.get('/login', (req, res) => {
  if (req.session && req.session.usuario) {
    return res.redirect('/');
  }
  res.render('login', { erro: null });
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha || email.trim() === '' || senha.trim() === '') {
      return res.status(400).render('login', {
        erro: 'E-mail e senha são obrigatórios.'
      });
    }

    const usuario = await Usuario.findOne({
      where: { email: email.trim().toLowerCase() }
    });

    if (!usuario || !usuario.verificarSenha(senha)) {
      return res.status(401).render('login', {
        erro: 'Credenciais inválidas. Verifique seu e-mail e senha.'
      });
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil
    };

    res.redirect('/');
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
