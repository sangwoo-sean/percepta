import { apiClient } from '../api/client';

type ActionType =
  | 'page_view'
  | 'auth_login_start'
  | 'auth_login_success'
  | 'auth_login_failed'
  | 'auth_logout'
  | 'nav_language_change';

interface ActionLogPayload {
  sessionId: string;
  action: ActionType;
  page?: string;
  metadata?: Record<string, unknown>;
}

const SESSION_ID_KEY = 'percepta_session_id';

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

async function logAction(payload: ActionLogPayload): Promise<void> {
  try {
    await apiClient.post('/action-logs', payload);
  } catch {
    // fire-and-forget: 에러 무시
  }
}

export const actionLogger = {
  pageView(page: string, metadata?: Record<string, unknown>): void {
    logAction({
      sessionId: getOrCreateSessionId(),
      action: 'page_view',
      page,
      metadata,
    });
  },

  authEvent(
    action: 'auth_login_start' | 'auth_login_success' | 'auth_login_failed' | 'auth_logout',
    metadata?: Record<string, unknown>,
  ): void {
    logAction({
      sessionId: getOrCreateSessionId(),
      action,
      metadata,
    });
  },

  navEvent(
    action: 'nav_language_change',
    metadata?: Record<string, unknown>,
  ): void {
    logAction({
      sessionId: getOrCreateSessionId(),
      action,
      metadata,
    });
  },
};
