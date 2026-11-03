# 📚 Sistema de Gerenciamento de Livros (CRUD + API REST)

Aplicação web desenvolvida para o gerenciamento de um acervo literário pessoal, permitindo organizar livros, acompanhar a situação de leitura e consultar informações em tempo real através de integração com a API externa **Open Library**.

O projeto foi construído utilizando **Node.js nativo (sem frameworks)** no back-end, complementado por uma interface web moderna em HTML5, CSS3 e JavaScript puro no front-end.

---

## 🚀 Funcionalidades Principais

* **CRUD Completo:** Cadastro, listagem, consulta, edição e exclusão de livros com identificadores únicos.
* **Confirmação de Exclusão:** Alerta de segurança antes de remover qualquer registro do acervo.
* **Integração com Open Library:** Pesquisa automática de livros por título utilizando a API externa, com preenchimento automático do formulário ou opção de fallback para cadastro manual.
* **API RESTful:** Endpoints estruturados em JSON utilizando os métodos HTTP corretos (`GET`, `POST`, `PUT`, `DELETE`) e Status Codes adequados.
* **Identificação Visual de Status:** Badges estilizadas para acompanhar o progresso de leitura (*Quero ler*, *Lendo*, *Concluído*).
* **Filtro Local em Tempo Real:** Campo de busca rápida no acervo cadastrado.
* **Persistência de Dados:** Armazenamento seguro em arquivo JSON, mantendo os dados salvos mesmo após reiniciar o servidor.
* **Tratamento de Erros:** Validação de campos obrigatórios, ISBNs duplicados, rotas inexistentes e falhas de comunicação externa.

---

## 🛠️ Tecnologias Utilizadas

* **Back-end:** Node.js (Módulos nativos: `http`, `fs`, `path`)
* **Front-end:** HTML5, CSS3, JavaScript (Fetch API, Manipulação do DOM)
* **Armazenamento:** JSON (`data/livros.json`)
* **API Externa:** [Open Library Search API](https://openlibrary.org/dev/docs/api/search)

---

## 📂 Estrutura do Projeto

```text
gerenciamento-livros/
│
├── data/
│   └── livros.json      # Base de dados em formato JSON
├── public/
│   ├── index.html       # Interface web principal
│   ├── style.css        # Estilização e design responsivo
│   └── script.js        # Lógica do front-end e consumo de APIs
├── server.js            # Servidor HTTP Node.js e API REST
├── package.json         # Configurações do projeto Node.js
└── README.md            # Documentação do projeto