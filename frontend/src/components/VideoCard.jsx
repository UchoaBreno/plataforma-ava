// src/components/VideoCard.jsx
import React from "react";
import { FaPlay, FaFileAlt } from "react-icons/fa";

/**
 *  Exibe um “cartão” de conteúdo da aula.
 *  Props:
 *    • aula         → objeto vindo da API (usa .titulo, .descricao, .video_url, .arquivo)
 *    • onAssistir() → callback executado ao clicar (ex.: navega para /aulas)
 */
export default function VideoCard({ aula, onAssistir }) {
  const temVideo = Boolean(aula.video_url);
  const temSlide = Boolean(aula.arquivo);

  const thumb = temVideo
    ? "https://placehold.co/600x340/ced4da/0f5132?text=Video+Aula&font=montserrat"
    : temSlide
    ? "https://placehold.co/600x340/ced4da/0f5132?text=Slide+PDF&font=montserrat"
    : "https://placehold.co/600x340/ced4da/0f5132?text=Aula&font=montserrat";

  return (
    <div
      onClick={onAssistir}
      className="relative cursor-pointer overflow-hidden rounded-lg shadow hover:shadow-lg"
    >
      {/* thumbnail */}
      <img
        src={thumb}
        alt="thumb da aula"
        className="h-44 w-full object-cover transition-transform duration-200 hover:scale-105"
      />

      {/* botão de play ou ícone de slide */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors hover:bg-black/40">
        {temVideo ? (
          <FaPlay className="h-10 w-10 text-white" />
        ) : temSlide ? (
          <FaFileAlt className="h-10 w-10 text-white" />
        ) : null}
      </div>

      {/* título + descrição breve */}
      <div className="space-y-1 bg-white p-3">
        <h3 className="line-clamp-1 font-semibold text-green-700">
          {aula.titulo}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-600">{aula.descricao}</p>
      </div>
    </div>
  );
}
