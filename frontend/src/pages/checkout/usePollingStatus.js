import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkoutAPI } from '../../services/API';
import { POLL_INTERVAL_MS, POLL_TIMEOUT_MS } from './checkoutConstants';

export function usePollingStatus({ setPaymentStep, setStatusMessage, setCountdown }) {
  const navigate = useNavigate();
  const pollRef = useRef(null);
  const countdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
  }, []);

  const startPolling = useCallback((ref) => {
    setCountdown(Math.floor(POLL_TIMEOUT_MS / 1000));

    countdownRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    const poll = async () => {
      try {
        const result = await checkoutAPI.getPaymentStatus(ref);
        if (result?.step === 'completed') {
          stopPolling(); setPaymentStep('completed');
          setTimeout(() => navigate('/order-success'), 1500);
        } else if (result?.step === 'failed') {
          stopPolling(); setPaymentStep('failed');
          setStatusMessage(result?.message || 'Paiement échoué ou annulé.');
        } else if (result?.message) {
          setStatusMessage(result.message);
        }
      } catch { /* silent — continue polling */ }
    };

    poll();
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      stopPolling(); setPaymentStep('failed');
      setStatusMessage('Délai dépassé (3 min). Aucune confirmation reçue. Réessayez.');
    }, POLL_TIMEOUT_MS);
  }, [navigate, stopPolling, setPaymentStep, setStatusMessage, setCountdown]);

  return { startPolling, stopPolling };
}
