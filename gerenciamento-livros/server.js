const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'livros.json');

function garantirArquivoDados() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
}

function lerLivros() {
    garantirArquivoDados();
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function salvarLivros(livros) {
    garantirArquivoDados();
    fs.writeFileSync(DATA_FILE, JSON.stringify(livros, null, 2), 'utf8');
}

function servirEstatico(req, res) {
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.css': contentType = 'text/css'; break;
        case '.js': contentType = 'text/javascript'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'Rota ou recurso não encontrado.' }));
            } else {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'Erro interno no servidor.' }));
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const urlParts = req.url.split('?')[0].split('/');


    if (urlParts[1] === 'api' && urlParts[2] === 'livros') {
        const id = urlParts[3] ? parseInt(urlParts[3]) : null;
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            let dadosReq = null;
            if (body) {
                try {
                    dadosReq = JSON.parse(body);
                } catch (e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'JSON inválido no corpo da requisição.' }));
                    return;
                }
            }

            const livros = lerLivros();

            if (req.method === 'GET' && !id) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(livros));
            }
            else if (req.method === 'GET' && id) {
                const livro = livros.find(l => l.id === id);
                if (!livro) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Livro não encontrado.' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(livro));
                }
            }
            else if (req.method === 'POST' && !id) {
                const { titulo, autor, isbn, anoPublicacao, genero, status, capa } = dadosReq || {};

                if (!titulo || !autor || !isbn || !anoPublicacao || !genero || !status) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' }));
                    return;
                }

                if (livros.some(l => l.isbn === isbn)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Já existe um livro cadastrado com este ISBN.' }));
                    return;
                }

                const novoLivro = {
                    id: livros.length > 0 ? Math.max(...livros.map(l => l.id)) + 1 : 1,
                    titulo,
                    autor,
                    isbn,
                    anoPublicacao: Number(anoPublicacao),
                    genero,
                    status,
                    capa: capa || ''
                };

                livros.push(novoLivro);
                salvarLivros(livros);

                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(novoLivro));
            }

            else if (req.method === 'PUT' && id) {
                const index = livros.findIndex(l => l.id === id);
                if (index === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Livro não encontrado para atualização.' }));
                    return;
                }

                const { titulo, autor, isbn, anoPublicacao, genero, status, capa } = dadosReq || {};

                if (!titulo || !autor || !isbn || !anoPublicacao || !genero || !status) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Preencha todos os campos obrigatórios.' }));
                    return;
                }

                if (livros.some(l => l.isbn === isbn && l.id !== id)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Outro livro já utiliza este ISBN.' }));
                    return;
                }

                livros[index] = {
                    id,
                    titulo,
                    autor,
                    isbn,
                    anoPublicacao: Number(anoPublicacao),
                    genero,
                    status,
                    capa: capa || livros[index].capa
                };

                salvarLivros(livros);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(livros[index]));
            }

            else if (req.method === 'DELETE' && id) {
                const index = livros.findIndex(l => l.id === id);
                if (index === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ erro: 'Livro não encontrado para exclusão.' }));
                    return;
                }

                const livroRemovido = livros.splice(index, 1)[0];
                salvarLivros(livros);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ mensagem: 'Livro excluído com sucesso', livro: livroRemovido }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ erro: 'Endpoint não encontrado.' }));
            }
        });
    } else {
        servirEstatico(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});