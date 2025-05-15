import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Cadastro() {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCadastro = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/usuarios/', {
        
        first_name,
        last_name,
        email,
        username,
        password,
      });
      console.log(response.data);
      
      alert('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      console.error('Erro ao criar conta:', error.response?.data || error.message);
      alert('Erro ao criar conta. Verifique os dados.');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white border border-gray-300 rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-semibold mb-2">
          Plataforma<span className="text-green-500">AVA</span>
        </h2>
        <p className="text-black">Crie sua conta</p>
        <p className="text-sm text-gray-600 mb-6">Preencha os campos abaixo</p>

        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
          placeholder="Nome"
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
          placeholder="Sobrenome"
          onChange={(e) => setLastName(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
          placeholder="E-mail"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded"
          placeholder="Usuário"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded"
          type="password"
          placeholder="Senha"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleCadastro}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 mb-3"
        >
          Cadastrar
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full bg-white text-black py-2 border border-gray-400 rounded"
        >
          Já tenho uma conta
        </button>
      </div>
    </div>
  );
}
