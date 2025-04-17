import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

interface BackButtonProps {
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/');
    }
  };

  return (
    <button
      onClick={handleClick}
      className="group fixed left-8 top-8 z-50 flex h-10 w-10 items-center justify-center rounded-full
      bg-white/70 dark:bg-gray-900/70 shadow-lg backdrop-blur transition-all
      duration-300 hover:bg-white/90 dark:hover:bg-gray-900/90"
      aria-label="Go back"
      style={{ border: 'none' }}
    >
      <ArrowLeft
        className="h-5 w-5 text-gray-800 dark:text-gray-300 transition-all duration-200
        group-hover:text-indigo-600 dark:group-hover:text-indigo-300
        group-hover:animate-backArrowTwice"
      />
    </button>
  );
};

export default BackButton;