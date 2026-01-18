import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { actionLogger } from '../services/actionLogger';

export const usePageLogger = () => {
  const location = useLocation();
  const prevPathRef = useRef<string | null>(null);

  useEffect(() => {
    // 동일 경로 중복 로깅 방지
    if (prevPathRef.current !== location.pathname) {
      actionLogger.pageView(location.pathname);
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);
};
