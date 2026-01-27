export const config = {
  matcher: '/',
};

export default function middleware(request) {
  // 사용자가 명시적으로 언어를 선택한 경우 자동 리다이렉트하지 않음
  const cookies = request.headers.get('cookie') || '';
  const hasLocalePreference = cookies.includes('locale=');

  if (hasLocalePreference) {
    return undefined;
  }

  const acceptLanguage = request.headers.get('accept-language') || '';
  const isKorean = acceptLanguage.toLowerCase().includes('ko');

  // Only redirect if Korean language is preferred and not already on /ko/
  if (isKorean) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return Response.redirect(new URL('/ko/', request.url), 302);
    }
  }

  return undefined;
}
