#!/usr/bin/env python3
"""Make a 640px-wide WebP variant of every gallery/post image at least 800px wide,
so phones (about 345 CSS px x 1.75-2 DPR) download ~25KB instead of the 900px file."""
import glob, os
from PIL import Image
for p in sorted(glob.glob('assets/g_*.webp')+glob.glob('assets/post_*.webp')):
    if p.endswith(('_480.webp','_420.webp','_640.webp')): continue
    out=p[:-5]+'_640.webp'
    if os.path.exists(out): continue
    im=Image.open(p)
    if im.width<800: continue
    h=round(im.height*640/im.width)
    im.convert('RGB').resize((640,h),Image.LANCZOS).save(out,'WEBP',quality=76,method=6)
    print(out,os.path.getsize(out))
