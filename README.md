# Plataforma AVA (PIBIC)

Um Ambiente Virtual de Aprendizado (AVA) desenvolvido em React (front-end) e Django REST Framework (back-end) para fins de pesquisa PIBIC. Permite que **professores** publiquem aulas e acompanhem entregas de atividades, e que **alunos** vejam suas prioridades e façam entregas.

---

## 📋 Conteúdo

1. [Visão Geral](#visão-geral)
2. [Tecnologias](#tecnologias)
3. [Funcionalidades](#funcionalidades)
4. [Pré-requisitos](#pré-requisitos)
5. [Instalação](#instalação)

   * [Back-end (Django)](#back-end-django)
   * [Front-end (React)](#front-end-react)
6. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
7. [Estrutura de Pastas](#estrutura-de-pastas)
8. [Como Usar](#como-usar)
9. [Contribuição](#contribuição)
10. [Licença](#licença)

---

## 🔎 Visão Geral

Este projeto fornece:

* **Autenticação JWT** (login / cadastro).
* **Papéis**: Professor (is\_staff) e Aluno (usuário comum).
* **Professor**:

  * Publicar / editar / apagar aulas (slides, descrição, data agendada).
  * Publicar atividades.
  * Ver lista de alunos com contagem dinâmica de entregas.
  * Ver entregas de cada aluno em modal.
  * Gerenciar aulas via modal customizado (GerenciarAulasModal).
* **Aluno**:

  * Ver “Minhas Aulas” organizadas em **Alta**, **Média** e **Baixa** prioridade, filtrando automaticamente as que já entregou.
  * Home com cartões de “Aulas de Hoje”, “Aulas da Semana” e “Aulas do Mês”, também removendo aulas já entregues.
  * Fazer upload de entrega de atividades via modal.

---

## 🛠 Tecnologias

* **Back-end**

  * Python 3.x
  * Django
  * Django REST Framework
  * djangorestframework-simplejwt

* **Front-end**

  * React
  * Tailwind CSS
  * Axios
  * dayjs
  * jwt-decode

---

## ⚙️ Funcionalidades

| Papéis        | Funcionalidade                                               |
| :------------ | :----------------------------------------------------------- |
| **Geral**     | Autenticação JWT, perfil, upload de foto, layout responsivo. |
| **Professor** | CRUD de aulas, publicar atividade, modal de Gerenciar Aulas. |
|               | Ver lista de alunos + contagem de entregas com polling.      |
|               | Modal de entregas por aluno.                                 |
| **Aluno**     | Listagem de próximas aulas dividida em prioridades.          |
|               | Home com separação “Hoje”, “Semana”, “Mês”.                  |
|               | Upload de entregas via modal.                                |

---

## 📦 Pré-requisitos

* Git
* Node.js (v16+) & npm ou Yarn
* Python 3.8+ & pip
* PostgreSQL ou outro banco compatível (ou SQLite para dev)

---

## 🔧 Instalação

### Back-end (Django)

```bash
git clone <URL_DO_REPO>
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Front-end (React)

```bash
cd frontend
npm install      # ou yarn install
npm start        # ou yarn start
```

Acesse `http://localhost:3000`.

---

## ⚙️ Configuração de Variáveis de Ambiente

**Back-end** (`.env` ou `settings.py`):

```env
SECRET_KEY=uma_chave_secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:senha@localhost:5432/dbname
```

**Front-end** (`.env.local`):

```env
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## 📁 Estrutura de Pastas

```
/
├── backend/
│   ├── usuarios/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   └── views.py
│   ├── project/       # settings, urls
│   └── manage.py
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── AulasAluno.jsx
    │   │   ├── AulasProfessor.jsx
    │   │   ├── Home.jsx
    │   │   └── ProfessorEntregas.jsx
    │   ├── components/
    │   │   ├── Sidebar.jsx
    │   │   ├── VideoCard.jsx
    │   │   ├── GerenciarAulasModal.jsx
    │   │   └── EditAulaModal.jsx
    │   └── index.js
    └── package.json
```

---

## 🚀 Como Usar

1. Inicie **back-end**: `python manage.py runserver` (porta 8000).
2. Inicie **front-end**: `npm start` (porta 3000).
3. Acesse `http://localhost:3000` e faça login.
4. Navegue entre as abas de Professor e Aluno para testar as funcionalidades.

---

## 🤝 Contribuição

1. Fork este repositório.
2. Crie uma branch: `git checkout -b feature/nome-da-feature`.
3. Commit suas mudanças: `git commit -m "feat: descrição da feature"`.
4. Push para a branch: `git push origin feature/nome-da-feature`.
5. Abra um Pull Request.

---

## 📄 Licença

Este projeto está licenciado sob a MIT License.
