#!/usr/bin/env python3
"""Make the optimised web images in assets/ from Marta's originals (downloaded read-only from her public Wix media URLs; originals are NOT stored in this repo).
Usage: python3 tools/images.py <dir with originals>   (docs/SOURCES.md lists the Wix media id behind every asset)"""
import sys,os,glob,json
from PIL import Image,ImageOps
O=sys.argv[1] if len(sys.argv)>1 else '/workspace/marta/raw'
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..');A=os.path.join(ROOT,'assets')
def find(prefix):
    g=[p for p in glob.glob(os.path.join(O,'*'+prefix+'*'))];assert g,prefix;return g[0]
def load(p):
    im=Image.open(find(p));im=ImageOps.exif_transpose(im)
    if im.mode in('RGBA','LA','P'):
        im=im.convert('RGBA');bg=Image.new('RGBA',im.size,(255,255,255,255));bg.alpha_composite(im);im=bg
    return im.convert('RGB')
def cap(im,w):
    return im if im.width<=w else im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
SRC={}
def save(name,prefix,widths,q=78,maxh=None):
    im=load(prefix)
    for suf,w in widths:
        t=cap(im,w)
        if maxh and t.height>maxh: t=t.resize((round(t.width*maxh/t.height),maxh),Image.LANCZOS)
        fn=f'{name}{suf}.webp';t.save(os.path.join(A,fn),'WEBP',quality=q,method=6);print(fn,t.size,os.path.getsize(os.path.join(A,fn))//1024,'KB')
    SRC[name]=os.path.basename(find(prefix))
# photos of Marta and her shows (gallery order = content.json gallery order)
PH=[('g_magic_show','c41c5f_eb30fa6e'),('g_witch_hat','c41c5f_df0b9ca8'),('g_face_paint_drink','c41c5f_4e99f016'),('g_balloon_hat_boy','c41c5f_fd2a2411'),('g_face_paint_cheer','c41c5f_18b5b117'),('g_frog_hat','c41c5f_14cca7c2'),
 ('g_black_white_face','c41c5f_5d41c253'),('g_face_paint_girl','c41c5f_26e20c5d'),('g_face_paint_group','c41c5f_320cd6c7'),('g_blue_face','c41c5f_c3993409'),('g_marta_red_jacket','c41c5f_f29fbdca'),('g_marta_balloons','c41c5f_72d9c03f'),
 ('g_toddler_balloons','c41c5f_529c0f05'),('g_wedding_guests','c41c5f_641bebf0'),('g_party_kids','c41c5f_baa67454'),('g_marta_kids_pool','c41c5f_b0e64a30'),('g_marta_shop','c41c5f_14c1e503'),('g_marta_peppa','c41c5f_256570b1')]
HERO=[('hero_marta','c41c5f_fad2cc31'),('about_marta','c41c5f_c3a36bfb')]
LOGOS=[('ikea','c41c5f_00abac85'),('bank_of_ireland','c41c5f_05e13098'),('citibank','c41c5f_0b03efa8'),('jp_morgan','c41c5f_2274965d'),('tesco','c41c5f_2922b016'),('web_summit','c41c5f_320cc675'),('harvey_norman','c41c5f_5ba73b12'),('bmw','c41c5f_5d117411'),
 ('supervalu','c41c5f_8ada0681'),('coca_cola','c41c5f_8cba3db3'),('flying_tiger','c41c5f_94ee76f8'),('cystic_fibrosis_ireland','c41c5f_95a26abc'),('matheson','c41c5f_a17429c1'),('lidl','c41c5f_dca3a109'),('salesforce','c41c5f_46b248c5'),('fitbit','c41c5f_4917ce7e'),('vodafone','c41c5f_5312329c')]
def main():
    os.makedirs(A,exist_ok=True)
    for n,p in HERO: save(n,p,[('',900),('_480',480)],80)
    for n,p in PH: save(n,p,[('',900),('_480',480)],78)
    for n,p in LOGOS: save('logo_'+n,p,[('',240)],85,maxh=120)
    posts=json.load(open(os.path.join(ROOT,'docs','source','post-images.json')))
    for n,p in posts.items(): save(n,p,[('',700),('_420',420)],76)
    json.dump(SRC,open(os.path.join(ROOT,'docs','source','sources.json'),'w'),indent=1)
if __name__=='__main__':main()
