import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKonamiCode() {
  const navigate = useNavigate();

  useEffect(() => {
    const sequence = (import.meta.env.VITE_ADMIN_SECRET_SEQUENCE || '').split(',');
    if (!sequence.length || !sequence[0]) return;

    let index = 0;

    const onKey = (e) => {
      if (e.key === sequence[index]) {
        index++;
        if (index === sequence.length) {
          index = 0;
          navigate('/AdminLogin');
        }
      } else {
        index = e.key === sequence[0] ? 1 : 0;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);
}