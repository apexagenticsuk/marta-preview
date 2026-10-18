#!/usr/bin/env python3
"""Writes 404.html from contact.html's header/footer (noindex kept). Run from the site folder after changing the header/footer: python3 tools/make-404.py "<title suffix>"."""
import re,sys
suffix=sys.argv[1]
h=open('contact.html').read()
sub=lambda pat,rep:re.sub(pat,lambda m:rep,h,count=1)
h=sub(r'<title>.*?</title>','<title>Page not found | %s</title>'%suffix)
d='This page does not exist.'
h=sub(r'<meta name="description" content="[^"]*">','<meta name="description" content="%s">'%d)
h=sub(r'<meta property="og:title" content="[^"]*">','<meta property="og:title" content="Page not found | %s">'%suffix)
h=sub(r'<meta property="og:description" content="[^"]*">','<meta property="og:description" content="%s">'%d)
# unknown paths can be any depth: make every relative link/file resolve from the site root (works at /, and at /marta-preview/ on GitHub Pages)
h=h.replace('<head>','<head><script>var p=location.pathname,i=p.indexOf("/marta-preview/");document.write(\'<base href="\'+(i===0?"/marta-preview/":"/")+\'">\')</script>',1)
a=h.index('<main');b=h.index('</main>')
main='''<main id="main" tabindex="-1">
<section class="phead"><div class="wrap"><p class="eyebrow">404</p><h1>Page <span class="r">not found</span></h1></div></section>
<section class="enquire"><div class="wrap legalp">
<p>Sorry, that page does not exist. It may have moved, or the link may have a typo.</p>
<p><a class="btn rose" href="index.html">Back to the home page</a> <a class="btn ghost" href="contact.html">Contact Marta</a></p>
</div></section>
'''
h=h[:a]+main+h[b:]
h=re.sub(r' class="cur"','',h);h=h.replace(' aria-current="page"','')
open('404.html','w').write(h)
