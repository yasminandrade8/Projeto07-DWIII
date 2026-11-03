const API_URL = '/api/livros';

let livrosCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarLivros();

    document.getElementById('formLivro').addEventListener('submit', salvarLivro);
    document.getElementById('btnCancelar').addEventListener('click', cancelarEdicao);
    document.getElementById('btnBuscarExterna').addEventListener('click', buscarOpenLibrary);
    document.getElementById('inputFiltroLocal').addEventListener('input', filtrarLivrosLocais);
});

function mostrarMensagem(texto, tipo = 'sucesso') {
    const el = document.getElementById('mensagem');
    el.textContent = texto;
    el.className = `mensagem ${tipo}`;
    setTimeout(() => {
        el.className = 'mensagem hidden';
    }, 4000);
}

async function carregarLivros() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar livros.');
        livrosCache = await response.json();
        renderizarLivros(livrosCache);
    } catch (error) {
        mostrarMensagem('Erro ao carregar lista de livros.', 'erro');
    }
}

function renderizarLivros(livros) {
    const container = document.getElementById('listaLivros');
    container.innerHTML = '';

    if (livros.length === 0) {
        container.innerHTML = '<p>Nenhum livro cadastrado no acervo.</p>';
        return;
    }

    livros.forEach(livro => {
        let classeStatus = 'quero-ler';
        if (livro.status === 'Lendo') classeStatus = 'lendo';
        if (livro.status === 'Concluído') classeStatus = 'concluido';

        const card = document.createElement('div');
        card.className = 'livro-card';
        card.innerHTML = `
            <img src="${livro.capa || 'https://via.placeholder.com/70x100?text=Sem+Capa'}" alt="Capa" class="livro-capa">
            <div class="livro-info">
                <div>
                    <h3>${livro.titulo}</h3>
                    <p><strong>Autor:</strong> ${livro.autor}</p>
                    <p><strong>Gênero:</strong> ${livro.genero} | <strong>Ano:</strong> ${livro.anoPublicacao}</p>
                    <p><strong>ISBN:</strong> ${livro.isbn}</p>
                    <span class="badge ${classeStatus}">${livro.status}</span>
                </div>
                <div class="livro-acoes">
                    <button class="btn-warning" onclick="prepararEdicao(${livro.id})">Editar</button>
                    <button class="btn-danger" onclick="excluirLivro(${livro.id})">Excluir</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}


async function salvarLivro(e) {
    e.preventDefault();

    const id = document.getElementById('livroId').value;
    const titulo = document.getElementById('titulo').value;
    const autor = document.getElementById('autor').value;
    const isbn = document.getElementById('isbn').value;
    const anoPublicacao = document.getElementById('anoPublicacao').value;
    const genero = document.getElementById('genero').value;
    const status = document.getElementById('status').value;
    const capa = document.getElementById('livroCapa').value;

    const livroData = { titulo, autor, isbn, anoPublicacao, genero, status, capa };

    try {
        let response;
        if (id) {

            response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(livroData)
            });
        } else {

            response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(livroData)
            });
        }

        const resultado = await response.json();

        if (!response.ok) {
            throw new Error(resultado.erro || 'Erro ao salvar livro.');
        }

        mostrarMensagem(id ? 'Livro atualizado com sucesso!' : 'Livro cadastrado com sucesso!');
        limparFormulario();
        carregarLivros();
    } catch (error) {
        mostrarMensagem(error.message, 'erro');
    }
}

async function excluirLivro(id) {
    if (!confirm('Tem certeza de que deseja excluir este livro do acervo?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        const resultado = await response.json();
        if (!response.ok) throw new Error(resultado.erro || 'Erro ao excluir livro.');

        mostrarMensagem('Livro excluído com sucesso!');
        carregarLivros();
    } catch (error) {
        mostrarMensagem(error.message, 'erro');
    }
}

window.prepararEdicao = function(id) {
    const livro = livrosCache.find(l => l.id === id);
    if (!livro) return;

    document.getElementById('livroId').value = livro.id;
    document.getElementById('titulo').value = livro.titulo;
    document.getElementById('autor').value = livro.autor;
    document.getElementById('isbn').value = livro.isbn;
    document.getElementById('anoPublicacao').value = livro.anoPublicacao;
    document.getElementById('genero').value = livro.genero;
    document.getElementById('status').value = livro.status;
    document.getElementById('livroCapa').value = livro.capa || '';

    document.getElementById('formTitulo').textContent = 'Editar Livro';
    document.getElementById('btnSalvar').textContent = 'Salvar Alterações';
    document.getElementById('btnCancelar').classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function cancelarEdicao() {
    limparFormulario();
}

function limparFormulario() {
    document.getElementById('formLivro').reset();
    document.getElementById('livroId').value = '';
    document.getElementById('livroCapa').value = '';
    document.getElementById('formTitulo').textContent = 'Cadastrar Novo Livro';
    document.getElementById('btnSalvar').textContent = 'Cadastrar Livro';
    document.getElementById('btnCancelar').classList.add('hidden');
}

async function buscarOpenLibrary() {
    const termo = document.getElementById('inputBuscaExterna').value.trim();
    const resultadoDiv = document.getElementById('resultadoBuscaExterna');

    if (!termo) {
        mostrarMensagem('Digite um título para pesquisar na Open Library.', 'erro');
        return;
    }

    resultadoDiv.innerHTML = '<p>Buscando na Open Library...</p>';
    resultadoDiv.classList.remove('hidden');

    try {
        const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(termo)}`);
        if (!response.ok) throw new Error('Falha na comunicação com a Open Library.');

        const data = await response.json();

        if (data.docs && data.docs.length > 0) {
            const livroInfo = data.docs[0];
            const titulo = livroInfo.title || '';
            const autor = livroInfo.author_name ? livroInfo.author_name.join(', ') : 'Desconhecido';
            const ano = livroInfo.first_publish_year || '';
            const isbn = livroInfo.isbn ? livroInfo.isbn[0] : '';
            const coverId = livroInfo.cover_i;
            const capaUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '';

            resultadoDiv.innerHTML = `
                <img src="${capaUrl || 'https://via.placeholder.com/60x90?text=Sem+Capa'}" alt="Capa">
                <div>
                    <h4>${titulo}</h4>
                    <p><strong>Autor:</strong> ${autor}</p>
                    <p><strong>Ano:</strong> ${ano}</p>
                    <button type="button" class="btn-primary" style="margin-top: 0.5rem; padding: 0.4rem 0.8rem; font-size: 0.85rem;" 
                        onclick='preencherComOpenLibrary(${JSON.stringify({titulo, autor, ano, isbn, capaUrl})})'>
                        Preencher Formulário
                    </button>
                </div>
            `;
        } else {
            resultadoDiv.innerHTML = '<p>Nenhum resultado encontrado na Open Library. Você pode realizar o cadastro manual abaixo.</p>';
        }
    } catch (error) {
        resultadoDiv.innerHTML = '<p style="color: red;">Falha ao consultar a API externa. O cadastro manual permanece disponível.</p>';
    }
}

window.preencherComOpenLibrary = function(dados) {
    document.getElementById('titulo').value = dados.titulo;
    document.getElementById('autor').value = dados.autor;
    document.getElementById('anoPublicacao').value = dados.ano;
    if (dados.isbn) document.getElementById('isbn').value = dados.isbn;
    document.getElementById('livroCapa').value = dados.capaUrl;
    
    mostrarMensagem('Dados carregados da Open Library no formulário com sucesso!');
    window.scrollTo({ top: 300, behavior: 'smooth' });
};

function filtrarLivrosLocais(e) {
    const termo = e.target.value.toLowerCase();
    const filtrados = livrosCache.filter(l => 
        l.titulo.toLowerCase().includes(termo) || 
        l.autor.toLowerCase().includes(termo) ||
        l.genero.toLowerCase().includes(termo)
    );
    renderizarLivros(filtrados);
}