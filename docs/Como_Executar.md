# Como Executar o Sistema

Siga os passos abaixo para instalar, configurar e executar o projeto B-High Education localmente.

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados na sua máquina:
* [Git](https://git-scm.com/)
* [Python](https://www.python.org/) (versão 3.8 ou superior)
* [Node.js](https://nodejs.org/en/) (incluindo o npm)

## 1. Instalação

Primeiro, clone o repositório e instale as dependências do Back-end e do Front-end.

### Back-end (Django)

```bash
# 1. Clone o repositório (faça isso apenas uma vez)
git clone <URL_DO_SEU_REPOSITORIO>

# 2. Navegue até a pasta do back-end
cd backend

# 3. Crie e ative um ambiente virtual
python -m venv .venv
# No Linux/macOS:
source .venv/bin/activate
# No Windows:
# .venv\Scripts\activate

# 4. Instale as dependências do Python
pip install -r requirements.txt

# 5. Aplique as migrações do banco de dados
python manage.py migrate

# 6. (Opcional) Crie um superusuário para acessar o painel de admin
python manage.py createsuperuser
```

### Front-end (React)

```bash
# 1. Navegue até a pasta do front-end (a partir da raiz do projeto)
cd frontend

# 2. Instale as dependências do Node.js
npm install
```

## 2. Configuração das Variáveis de Ambiente

Antes de rodar o projeto, você precisa configurar as variáveis de ambiente. Crie os arquivos `.env` conforme os exemplos abaixo.

### Back-end

1.  Na pasta `backend`, crie um arquivo chamado `.env`.
2.  Adicione o seguinte conteúdo a ele, ajustando se necessário:

    ```ini
    # Arquivo: backend/.env
    SECRET_KEY=uma_chave_secreta_super_segura_pode_ser_qualquer_coisa
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    DATABASE_URL=postgres://user:senha@localhost:5432/dbname
    ```

### Front-end

1.  Na pasta `frontend`, crie um arquivo chamado `.env.local`.
2.  Adicione o seguinte conteúdo a ele:

    ```ini
    # Arquivo: frontend/.env.local
    REACT_APP_API_BASE_URL=[http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)
    ```

## 3. Execução

Com tudo instalado e configurado, inicie os servidores do Back-end e do Front-end. **Você precisará de dois terminais abertos ao mesmo tempo.**

### Terminal 1: Iniciar o Back-end

```bash
# 1. Navegue até a pasta do back-end
cd backend

# 2. Ative o ambiente virtual (se ainda não estiver ativo)
source .venv/bin/activate

# 3. Inicie o servidor Django (porta 8000)
python manage.py runserver
```

### Terminal 2: Iniciar o Front-end

```bash
# 1. Navegue até a pasta do front-end
cd frontend

# 2. Inicie o servidor de desenvolvimento do React (porta 3000)
npm start
```

## 4. Acesso e Teste

1.  Abra seu navegador e acesse a URL: **[http://localhost:3000](http://localhost:3000)**
2.  Faça login com um usuário de teste ou com o superusuário que você criou.
3.  Navegue entre as abas e funcionalidades de **Professor** e **Aluno** para testar a aplicação.
