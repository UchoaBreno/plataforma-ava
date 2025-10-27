# Relatório de Manutenção Corretiva – B-High Education


### 1. Descrição do Sistema

O sistema **B-High Education** é um Ambiente Virtual de Aprendizagem (AVA) desenvolvido para auxiliar na adoção e implementação da modalidade de ensino híbrido (b-learning) no ensino superior. O seu objetivo é integrar as Tecnologias de Informação e Comunicação (TIC) ao ambiente educacional, oferecendo uma solução que combina as vantagens do ensino tradicional com a flexibilidade das ferramentas online. A plataforma foi projetada para atender a diferentes perfis de utilizadores, como Alunos, Professores e Coordenadores, com funcionalidades para gestão de aulas, criação e entrega de atividades e quizzes, e acompanhamento de desempenho.

### 2. Bugs Identificados e Corrigidos

Durante a fase de manutenção corretiva, foram identificados, classificados e corrigidos(apenas um) três bugs que impactam funcionalidades essenciais do sistema.

---

#### **Bug 1: Erro ao responder quiz**

* **Classificação:** Lógico.
* **Descrição:** Inicialmente reportado como um erro ao enviar a resposta, a investigação revelou que a causa raiz é uma falha no fluxo de criação de Aulas e Quizzes no back-end. Os dados não estão sendo corretamente salvos na base de dados, o que impede que os quizzes listados para os alunos não podem ter respostas submetidas.
* **Link para a Issue:** `[Issue #1: Bug: Erro ao responder quiz](https://github.com/Thonzx/TP1_Manutencao_Corretiva/issues/1)`
* **Evidências de Validação:**
    * **Antes:** O quiz criado pelo professor não era guardado na base de dados com o id da aula, então ao enviar uma resposta, o aluno era direcionado para uma tela resultante de um erro.
  **![Erro_Quiz (1)](https://github.com/user-attachments/assets/dd1d67c9-d530-4d8b-8395-2d2bf14510da)*

---

#### **Bug 2: Registro falha para usuários com perfil de professor**

* **Classificação:** Lógico / Erro de Roteamento.
* **Descrição:** Ao tentar criar uma nova conta com o perfil de "professor", a aplicação retornava um erro "404 Page Not Found". A causa era a ausência de uma rota no `urls.py` do back-end para o endpoint `/api/solicitacoes-professor/`, o que impedia a comunicação entre o front-end e a API.
* **Link para a Issue:** `[Issue #2: Bug: Registro falha para usuários com perfil de professor](https://github.com/Thonzx/TP1_Manutencao_Corretiva/issues/2)`
* **Link para o Pull Request da Correção:** `[PR #4: Corrige o erro 404 no registo de novos professores](https://github.com/Thonzx/TP1_Manutencao_Corretiva/pull/4)`
* **Evidências de Validação:**
    * **Antes:** O formulário de registo de professor retornava um erro 404, como documentado na imagem `Erro_Conta_Professor.jpeg`.
      ![Erro_Conta_Professor](https://github.com/user-attachments/assets/0a7d9a68-84bc-437f-9e99-66935a366f12)

   * **Depois:** Nova tentativa de registo com as mesmas informações..
<img width="1916" height="922" alt="image" src="https://github.com/user-attachments/assets/22bef645-ee11-4b8d-a5e3-1f2ea11c4326" />


---

#### **Bug 3: E-mail de recuperação de senha não é recebido pelo usuário**

* **Classificação:** Runtime / Erro de Configuração.
* **Descrição:** A funcionalidade "Esqueci minha senha" informa ao utilizador que um e-mail foi enviado, mas a mensagem nunca chega ao seu destino. O problema foi identificado como uma falha de configuração do serviço de envio de e-mails (SMTP) no ficheiro `settings.py` do Django.
* **Link para a Issue:** `[Issue #3: Bug: E-mail de recuperação de senha não é recebido pelo usuário](https://github.com/Thonzx/TP1_Manutencao_Corretiva/issues/3)`
* **Evidências de Validação:**
    * **Antes:** O e-mail de recuperação não era recebido.
      ![Bug_Senha](https://github.com/user-attachments/assets/f039fb4e-a0e1-48f2-ae6d-f57796be9e36)
