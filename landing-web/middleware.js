export default function middleware(request) {
  const url = new URL(request.url)

  // Skip if already on /ko/ path
  if (url.pathname.startsWith('/ko')) {
    return
  }

  // Skip static files
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/)) {
    return
  }

  // Only redirect on root path
  if (url.pathname !== '/') {
    return
  }

  // Get browser language from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language') || ''
  const primaryLang = acceptLanguage.split(',')[0]?.split('-')[0]?.toLowerCase()

  // Redirect Korean speakers to /ko/
  if (primaryLang === 'ko') {
    return Response.redirect(new URL('/ko/', url), 302)
  }
}

export const config = {
  matcher: ['/'],
}
