export const config = {
  matcher: '/',
};

export default function middleware(request) {
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
