# Análise e Classificação de Bugs


### Bug 1: Aluno não consegue responder um Quiz

-   **Tipo**: Lógico
-   **Local Plausível**:
    -   Front-end: `QuizDetail.jsx`
    -   Back-end: `api/views.py` (em um app de atividades/quiz, não no app `usuarios`)
-   **Descrição**: Um aluno, na página `QuizDetail.jsx`, preenche todas as questões, clica no botão "Enviar Respostas", mas a atividade não é registrada como entregue. A causa provável é uma divergência entre os dados que o componente `QuizDetail.jsx` está enviando e o que o back-end (Django) espera receber, resultando em uma falha que não é comunicada corretamente ao usuário.
---

### Bug 2: Não é possível fazer registro como professor

-   **Tipo**: Lógico
-   **Local Plausível**:
    -   Front-end: `Login.jsx`
    -   Back-end: `usuarios/views.py`
-   **Descrição**: Na página de `Login.jsx`, um usuário com credenciais corretas e perfil de "professor" tenta fazer registro. Apesar dos dados estarem certos, o sistema retorna uma mensagem de erro. O problema reside na lógica do back-end, no arquivo `usuarios/views.py`, que não está validando corretamente o perfil "professor".

---

### Bug 3: E-mail de recuperação de senha não é enviado

-   **Tipo**: Runtime (Erro em tempo de execução)
-   **Local Plausível**:
    -   Front-end: `RecuperarSenha.jsx`
    -   Back-end (Lógica): `usuarios/views.py`
    -   Back-end (Configuração): `backend/settings.py`
-   **Descrição**: O usuário acessa a página `RecuperarSenha.jsx` e solicita a recuperação. A interface exibe uma mensagem de sucesso, mas o e-mail nunca chega. A falha ocorre no back-end devido a uma configuração incorreta do serviço de envio de e-mails (SMTP) no arquivo `backend/settings.py`.

