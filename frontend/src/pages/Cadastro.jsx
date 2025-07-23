import React, { useState } from 'react';
import axios from 'axios'; // ou '../utils/axiosInstance' se você estiver usando o instance global
import { useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState('aluno');
  const [erroCadastro, setErroCadastro] = useState('');
  const [mensagem, setMensagem] = useState('');

  const navigate = useNavigate();

  const validarUsername = (user) => /^[\w.@+-]+$/.test(user);

  const handleCadastro = async () => {
    setErroCadastro('');
    setMensagem('');

    const trimmedNome = nome.trim();
    const trimmedSobrenome = sobrenome.trim();
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!trimmedNome || !trimmedSobrenome || !trimmedEmail || !trimmedUsername || !senha) {
      setErroCadastro("Por favor, preencha todos os campos.");
      return;
    }

    if (senha.length < 6) {
      setErroCadastro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!validarUsername(trimmedUsername)) {
      setErroCadastro(
        "O nome de usuário só pode conter letras, números e os caracteres @/./+/-/_"
      );
      return;
    }

    try {
      if (role === 'professor') {
        const payloadProfessor = {
          nome: trimmedNome,
          sobrenome: trimmedSobrenome,
          email: trimmedEmail,
          username: trimmedUsername,
          senha: senha
        };
        await axios.post(
          'https://plataforma-ava2.onrender.com/api/solicitacoes-professor/',
          payloadProfessor
        );
        setMensagem('✅ Solicitação enviada! Aguarde a aprovação do administrador.');
      } else {
        const payloadAluno = {
          first_name: trimmedNome,
          last_name: trimmedSobrenome,
          email: trimmedEmail,
          username: trimmedUsername,
          password: senha
        };
        await axios.post(
          'https://plataforma-ava2.onrender.com/api/usuarios/',
          payloadAluno
        );
        setMensagem('✅ Conta de aluno criada com sucesso!');
      }

      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      console.error('Erro ao criar conta:', err.response?.data || err.message);

      let msg = 'Erro ao criar conta. Verifique os dados e tente novamente.';

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          msg = data;
        } else if (data.detail) {
          msg = data.detail;
        } else if (data.username?.length > 0) {
          msg = `Usuário: ${data.username[0]}`;
        } else if (data.email?.length > 0) {
          msg = `Email: ${data.email[0]}`;
        }
      }

      setErroCadastro("❌ " + msg);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
          B-High<span className="text-green-500">Education</span>
        </h2>
        <p className="text-black dark:text-gray-300">Crie sua conta</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Preencha os campos abaixo
        </p>

        {mensagem && (
          <div className="text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300 border border-green-300 dark:border-green-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {mensagem}
          </div>
        )}

        {erroCadastro && (
          <div className="text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 border border-red-300 dark:border-red-600 px-4 py-2 rounded text-center mb-4 text-sm">
            {erroCadastro}
          </div>
        )}

        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Sobrenome"
          value={sobrenome}
          onChange={(e) => setSobrenome(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <div className="flex flex-col gap-2 mb-4 text-black dark:text-white">
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="aluno"
              checked={role === 'aluno'}
              onChange={() => setRole('aluno')}
              className="mr-2"
            />
            Sou aluno
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="role"
              value="professor"
              checked={role === 'professor'}
              onChange={() => setRole('professor')}
              className="mr-2"
            />
            Sou professor (aguarda aprovação do admin)
          </label>
        </div>

        <button
          onClick={handleCadastro}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-500 mb-3"
        >
          Cadastrar
        </button>

        <button
          onClick={() => navigate('/login')}
          className="w-full border border-gray-400 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white py-2 rounded"
        >
          Já tenho uma conta
        </button>
      </div>
    </div>
  );
}
