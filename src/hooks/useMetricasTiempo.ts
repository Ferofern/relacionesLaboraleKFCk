import { useState, useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 30000; // 30 segundos

export function useMetricasTiempo() {
  const [tiempoInteraccion, setTiempoInteraccion] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimeoutRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    setTiempoInteraccion(0);
    setIsIdle(false);
    resetIdleTimeout();
  }, []);

  const handleActivity = useCallback(() => {
    if (isIdle) {
      setIsIdle(false);
    }
    resetIdleTimeout();
  }, [isIdle]);

  const resetIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
    }
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsIdle(true);
    }, IDLE_TIMEOUT_MS);
  }, []);

  // Configurar listeners de actividad
  useEffect(() => {
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Iniciar timeout inicial
    resetIdleTimeout();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    };
  }, [handleActivity, resetIdleTimeout]);

  // Manejar el cronómetro
  useEffect(() => {
    if (!isIdle) {
      timerIntervalRef.current = window.setInterval(() => {
        setTiempoInteraccion(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) window.clearInterval(timerIntervalRef.current);
    };
  }, [isIdle]);

  const getTiempoInteraccion = useCallback(() => {
    return tiempoInteraccion;
  }, [tiempoInteraccion]);

  return { getTiempoInteraccion, resetTimer };
}
