#!/usr/bin/env python3
"""Detect faces (YuNet) in every photo in assets/ and write tests/faces.json: {asset: {size:[w,h], main:[[x,y,w,h]...]}} (fractions of the image).
tests/faces.js then checks, in a real browser at 375/768/1280, that each of these faces stays fully inside the visible crop.
Usage: python3 tools/faces.py [model.onnx]"""
import cv2,json,os,sys,glob
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
M=sys.argv[1] if len(sys.argv)>1 else '/workspace/wedding/build/cv/yunet.onnx'
SKIP=('logo_','font_','og.','icon','social_')
out={}
for f in sorted(glob.glob(os.path.join(ROOT,'assets','*.webp'))):
    n=os.path.basename(f)
    if n.startswith(SKIP) or n.endswith('_480.webp') or n.endswith('_420.webp'): continue
    im=cv2.imread(f)
    if im is None: continue
    h,w=im.shape[:2];s=min(1.0,1000/max(h,w));sm=cv2.resize(im,(int(w*s),int(h*s))) if s<1 else im
    det=cv2.FaceDetectorYN.create(M,'',(sm.shape[1],sm.shape[0]),0.7,0.3,5000);_,r=det.detect(sm)
    faces=[]
    if r is not None:
        H,W=sm.shape[:2]
        for q in r:
            x,y,bw,bh=[float(v) for v in q[:4]];x0=max(0,x)/W;y0=max(0,y)/H;x1=min(W,x+bw)/W;y1=min(H,y+bh)/H
            if (x1-x0)*W>=36: faces.append([round(x0,4),round(y0,4),round(x1-x0,4),round(y1-y0,4)])
    out['assets/'+n]={'size':[w,h],'main':faces}
json.dump(out,open(os.path.join(ROOT,'tests','faces.json'),'w'),indent=0)
print(len(out),'images,',sum(1 for v in out.values() if v['main']),'with faces,',sum(len(v['main']) for v in out.values()),'faces')
