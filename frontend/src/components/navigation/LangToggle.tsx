import React from 'react';
import { Language } from '../../types';

interface LangToggleProps {
  lang: Language;
  onToggleLang: (lang: Language) => void;
  className?: string;
}

const optionClass = (active: boolean) =>
  `min-h-9 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea580c] ${
    active ? 'bg-gradient-orange text-white shadow-xs' : 'text-[#64748b] hover:text-[#0f172a]'
  }`;

export const LangToggle: React.FC<LangToggleProps> = ({ lang, onToggleLang, className = '' }) => (
  <div
    role="group"
    aria-label="Langue / Language"
    className={`flex items-center bg-[#fffaf5] p-0.5 rounded-full border border-[#fed7aa]/80 text-xs font-bold shadow-2xs ${className}`}
  >
    <button
      type="button"
      onClick={() => onToggleLang('FR')}
      aria-pressed={lang === 'FR'}
      className={optionClass(lang === 'FR')}
      title="Français"
    >
      <svg className="w-3.5 h-2.5 rounded-2xs shrink-0 shadow-2xs overflow-hidden" viewBox="0 0 640 480" aria-hidden="true">
        <g fillRule="evenodd" strokeWidth="1pt">
          <path fill="#fff" d="M0 0h640v480H0z" />
          <path fill="#002654" d="M0 0h213.3v480H0z" />
          <path fill="#ce1126" d="M426.7 0H640v480H426.7z" />
        </g>
      </svg>
      <span>FR</span>
    </button>
    <button
      type="button"
      onClick={() => onToggleLang('EN')}
      aria-pressed={lang === 'EN'}
      className={optionClass(lang === 'EN')}
      title="English"
    >
      <svg className="w-3.5 h-2.5 rounded-2xs shrink-0 shadow-2xs overflow-hidden" viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#012169" d="M0 0h640v480H0z" />
        <path
          fill="#FFF"
          d="m75 0 244 181L562 0h78v62L400 241l240 178v61h-80L320 301 81 480H0v-60l239-179L0 60V0h75z"
        />
        <path
          fill="#C8102E"
          d="m424 288 216 159v33h-44L366 312l58-24zM640 0v10L443 157l54 22L640 41V0zm-186 90 56 21L82 480H26l216-160 54 21L82 480H26L454 90zM0 440v40h42L220 327l-52-22L0 440zM0 0l225 166-50 20L0 42V0z"
        />
        <path fill="#FFF" d="M241 0v480h160V0H241zM0 160v160h640V160H0z" />
        <path fill="#C8102E" d="M267 0v480h106V0H267zM0 187v106h640V187H0z" />
      </svg>
      <span>EN</span>
    </button>
  </div>
);
