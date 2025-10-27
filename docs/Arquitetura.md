# Arquitetura Resumida do Sistema B-High Education

A arquitetura do sistema B-High Education é centralizada em um Ambiente Virtual de Aprendizagem (AVA), que serve como o núcleo para as interações entre os diferentes usuários e sistemas externos.

O modelo define claramente os papéis dos usuários e a integração com serviços essenciais como autenticação e banco de dados, conforme ilustrado no diagrama a seguir.

### Diagrama da Arquitetura

![Diagrama da Arquitetura do Sistema](./img/Arquitetura_Sistema.png)

### Descrição dos Componentes

* **Usuários (Aluno, Professor, Coordenador):** Representam os três principais perfis que interagem com o sistema. Cada um possui permissões e funcionalidades específicas dentro do AVA.

* **AVA (Ambiente Virtual de Aprendizagem):** É a aplicação central. Ele contém toda a lógica de negócios, como a gestão de aulas, atividades, quizzes e a interação entre os usuários.

* **Sistema de Autenticação:** Um serviço responsável por verificar a identidade dos usuários (login) e garantir que apenas pessoas autorizadas acessem o sistema.

* **Banco de Dados Externo:** Armazena todas as informações persistentes da aplicação, como dados de usuários, conteúdo dos cursos, notas e entregas de atividades.

* **MEC (Ministério da Educação):** Representa uma entidade externa com a qual o sistema pode precisar se comunicar ou estar em conformidade, embora não interaja diretamente com a lógica principal da aplicação.

