import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';

const PostLoginAnimation: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Se não há usuário autenticado, redirecionar para login
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Configurar timeout para redirecionar após a animação (7.5 segundos)
    const timer = setTimeout(() => {
      handleAnimationComplete();
    }, 7500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleAnimationComplete = () => {
    // Após a animação, redirecionar para a página apropriada baseada no papel do usuário
    if (user) {
      // Fail-safe: se vier como admin mas possuir empresaId, tratar como empresa
      const effectiveRole = user.role === 'admin' && user.empresaId ? 'empresa' : user.role;
      console.log('[PostLoginAnimation] Redirecionamento pós-login', {
        roleOriginal: user.role,
        empresaId: user.empresaId,
        roleEfetivo: effectiveRole,
      });
      switch (effectiveRole) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'empresa':
          navigate('/empresa/overview', { replace: true });
          break;
        case 'colaborador':
          navigate('/colaborador', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    } else {
      navigate('/', { replace: true });
    }
  };

  // Se não há usuário, não renderizar nada (será redirecionado)
  if (!user) {
    return null;
  }

  return (
    <iframe
      src="/Video pós login.html"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        border: 'none',
        zIndex: 9999
      }}
      title="HumaniQ AI Splash Screen"
    />
  );
};

export default PostLoginAnimation;