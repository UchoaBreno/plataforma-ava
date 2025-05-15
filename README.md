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
