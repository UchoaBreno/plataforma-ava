# Plataforma AVA (PIBIC)

Um Ambiente Virtual de Aprendizado (AVA) desenvolvido em React (front-end) e Django REST Framework (back-end) para fins de pesquisa PIBIC. Permite que **professores** publiquem aulas e acompanhem entregas de atividades, e que **alunos** vejam suas prioridades e façam entregas.

---

## 📋 Conteúdo

1. [Visão Geral](#visão-geral)  
2. [Tecnologias](#tecnologias)  
3. [Funcionalidades](#funcionalidades)  
4. [Pré-requisitos](#pré-requisitos)  
5. [Instalação](#instalação)  
   - [Back-end (Django)](#back-end-django)  
   - [Front-end (React)](#front-end-react)  
6. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)  
7. [Estrutura de Pastas](#estrutura-de-pastas)  
8. [Como Usar](#como-usar)  
9. [Contribuição](#contribuição)  
10. [Licença](#licença)  

---

## 🔎 Visão Geral

Este projeto fornece:

- **Autenticação JWT** (login / cadastro).  
- **Papéis**: Professor (is_staff) e Aluno (usuário comum).  
- **Professor**:
  - Publicar / editar / apagar aulas (slides, descrição, data agendada).  
  - Publicar atividades (visualmente — placeholder).  
  - Ver lista de alunos com contagem dinâmica de entregas.  
  - Ver entregas de cada aluno em modal.  
  - Gerenciar aulas via modal customizado (GerenciarAulasModal).  

- **Aluno**:
  - Ver “Minhas Aulas” organizadas em **Alta**, **Média** e **Baixa** prioridade, filtrando automaticamente as que já entregou.  
  - Tela inicial (“Home”) com cartões de “Aulas de Hoje”, “Aulas da Semana” e “Aulas do Mês”, também removendo aulas já entregues.  
  - Fazer upload de entrega de atividades e ver confirmação.  

---

## 🛠 Tecnologias

- **Back-end**  
  - Python 3.x  
  - Django  
  - Django REST Framework  
  - djangorestframework-simplejwt  
- **Front-end**  
  - React  
  - Tailwind CSS  
  - Axios  
  - dayjs  
  - jwt-decode  

---

## ⚙️ Funcionalidades

| Papéis     | Funcionalidade                                                |
|:-----------|:--------------------------------------------------------------|
| **Geral**  | Autenticação JWT, perfil, upload de foto, layout responsivo.  |
| **Professor** | CRUD de aulas, publicar atividade, modal de Gerenciar Aulas.<br>Ver lista de alunos + contagem de entregas com polling.<br>Modal de entregas por aluno. |
| **Aluno**  | Listagem de próximas aulas dividida em prioridades.<br>Home com separação “Hoje”, “Semana”, “Mês”.<br>Upload de entregas via modal. |

---

## 📦 Pré-requisitos

- Git  
- Node.js (v16+) & npm ou Yarn  
- Python 3.8+ & pip  
- PostgreSQL ou outro banco compatível (ou SQLite para dev)  

---

## 🔧 Instalação

### Back-end (Django)

1. Clone o repositório:
   ```bash
   git clone <URL_DO_REPO>
   cd <PASTA_DO_REPO>/backend


2. Crie e ative um ambiente virtual:
python -m venv .venv
source .venv/bin/activate   # Linux/macOS
.venv\Scripts\activate      # Windows


3. Instale dependências:
pip install -r requirements.txt


4. Aplique migrations e crie superusuário:
python manage.py migrate
python manage.py createsuperuser


5. Rode o servidor em um terminal:
python manage.py runserver


Front-end (React)
1. No diretório raiz:
   cd frontend


2. Instale dependências:
npm install
# ou
yarn install


3. Rode o servidor de desenvolvimento em outro:
npm start
# ou
yarn start


4. Acesse http://localhost:3000.

 Configuração de Variáveis de Ambiente

No back-end, crie um arquivo .env (ou ajuste settings.py) contendo:
SECRET_KEY=uma_chave_secreta
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:senha@localhost:5432/dbname


No front-end, se necessário, crie .env.local:
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/api


/
├── backend/
│   ├── usuarios/
│   │   ├── models.py       # Usuario, Aula, Entrega
│   │   ├── serializers.py  # AulaSerializer, EntregaSerializer, etc.
│   │   ├── views.py        # AulaView, EntregaView, etc.
│   ├── project/            # settings.py, urls.py
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
    │   └── utils/
    └── package.json



 Como Usar
Back-end rodando em localhost:8000.

Front-end rodando em localhost:3000.

Acesse /login para autenticar.

Professor:

Menu “Aulas do Professor”: AulasProfessor.jsx.

Botão flutuante “Gerenciar Aulas” abre GerenciarAulasModal.

Cards de alunos atualizam entregas via polling.

Aluno:

Menu “Aulas do Aluno”: AulasAluno.jsx.

Botão flutuante “Entregar atividade” abre modal de upload.

Home: Home.jsx separa em hoje/semana/mês.

🤝 Contribuição
Fork este repositório

Crie uma branch: git checkout -b feature/nome-da-feature

Commit suas mudanças: git commit -m "feat: descrição"

Push para a branch: git push origin feature/nome-da-feature

Abra um Pull Request

📄 Licença
Este projeto está sob a MIT License.
