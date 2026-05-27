#!/usr/bin/env python3
import json, re, urllib.request, sys

API_KEY = 'AIzaSyDsipVkCmWiokk0RgQY5TaZmv-XaItzMOs'
S26 = '12ifCX85urqUxt67Ad5xr26ffzGxvGNz5FFZT38oKZM8'
FSID = '1f0xEiBz5Mzu79zxks1Ew0lfAdwQu-7VKvKxaUcz3VzU'
LSID = '1Pl9uQvDSq4qWVT6MzqWCiZoI4Oga0wMhVu7wFwMoW4I'
G26 = {'Jan':0,'Feb':1981407338,'Mar':1445967367,'Apr':1565950911,'Mei':2013738206,'Jun':163552086,'Jul':1190948522}
GF = {'Jan':0,'Feb':1881517497,'Mar':901744559,'Apr':551469341,'Mei':1750587883,'Jun':1146229567,'Jul':2100896413}
BN = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul']

def gv(sid, gid):
    url = f'https://docs.google.com/spreadsheets/d/{sid}/gviz/tq?tqx=out:json&tq=&gid={gid}&key={API_KEY}'
    try:
        d = urllib.request.urlopen(url, timeout=15).read().decode('utf-8')
        m = re.search(r'.setResponse((.+));', d)
        if not m: return [], []
        j = json.loads(m.group(1))
        rows = j.get('table',{}).get('rows',[])
        vals, fvals = [], []
        for r in rows:
            c = r.get('c',[])
            v, fv = [], []
            for x in c:
                if x is None: v.append(''); fv.append('')
                else:
                    val = x.get('v'); fmt = x.get('f')
                    if isinstance(val, bool): v.append('TRUE' if val else '')
                    elif val is None: v.append('')
                    else: v.append(str(val))
                    fv.append(str(fmt) if fmt is not None else (str(val) if val is not None else ''))
            vals.append(v); fvals.append(fv)
        return vals, fvals
    except: return [], []

P = []
for b in BN:
    vals, fvals = gv(S26, G26[b])
    for i in range(len(vals)):
        v, f = vals[i], fvals[i]
        if len(f) >= 11 and f[0] and len(f[0]) >= 8 and f[0][2] == '/':
            try: P.append({'t':f[0],'b':b,'c1':int(float(v[1]or 0)),'c2':int(float(v[2]or 0)),'c3':int(float(v[3]or 0)),'c4':int(float(v[4]or 0)),'c5':int(float(v[5]or 0)),'c6':int(float(v[6]or 0)),'c7':int(float(v[7]or 0)),'c8':int(float(v[8]or 0)),'tt':int(float(v[9]or 0)),'kj':int(float(v[10]or 0))})
            except: pass
print(f'P: {len(P)}', flush=True)

F = []
for b in BN:
    vals, fvals = gv(FSID, GF[b])
    for i in range(len(vals)):
        v, f = vals[i], fvals[i]
        if len(f) >= 5 and f[0]:
            try:
                no = f[0]
                pf = f[1] if len(f) > 1 else ''
                jm = int(float(v[2])) if len(f) > 2 and v[2] else 0
                cb = v[3] if len(f) > 3 else ''
                jt = f[4] if len(f) > 4 and f[4] else (v[4] if len(f) > 4 else '')
                nb = (v[5] if len(f) > 5 else '') == 'TRUE'
                F.append({'no':no,'b':b,'nb':nb,'pf':pf,'jm':jm,'cb':cb,'jt':jt})
            except: pass
lunas = sum(1 for f in F if f['nb'])
print(f'F: {len(F)} (lunas={lunas} belum={len(F)-lunas})', flush=True)

L = {}; LD = []
cur = ''; cr = []
vals, fvals = gv(LSID, 0)
for i in range(len(vals)):
    v = vals[i]
    serial = v[3] if len(v) > 3 else ''
    if serial and re.match(r'^44\d{2,3}', serial):
        from datetime import datetime, timedelta
        try:
            d = datetime(1899,12,30) + timedelta(days=float(serial))
            months = {1:'JAN',2:'FEB',3:'MAR',4:'APR',5:'MEI',6:'JUN',7:'JUL',8:'AGU',9:'SEP',10:'OKT',11:'NOV',12:'DES'}
            tgl = f'{d.day} {months[d.month]} {d.year}'
            if cur and cr: L[cur] = {'rr': cr}; LD.append(cur)
            cur = tgl; cr = []; continue
        except: pass
    txt = v[0] if v else ''
    if txt == 'URAIAN': continue
    if cur and len(v) >= 4:
        if txt or v[1] or v[2] or v[3]:
            cr.append({'u':txt,'p':v[1] if len(v)>1 else '','s':v[2] if len(v)>2 else '','t':v[3] if len(v)>3 else ''})
if cur and cr: L[cur] = {'rr': cr}; LD.append(cur)
print(f'L: {len(LD)}', flush=True)

BO, TO, TK = {}, 0, 0
for p in P: TO+=p['tt']; TK+=p['kj']; BO[p['b']]=BO.get(p['b'],0)+p['tt']
data = {'P':P,'F':F,'L':L,'D':LD,'B':BO,'TO':TO,'TK':TK}

with open('/tmp/lphfix/index.html') as f: html = f.read()
dj = json.dumps(data)
s = html.index('var data_js = ') + 14
e = html.index(';', s)
html = html[:s] + dj + html[e:]
with open('/tmp/lphfix/index.html','w') as f: f.write(html)
with open('/tmp/lphfix/data.json','w') as f: json.dump({'penjualan':P,'faktur':F,'lph':L,'lph_dates':LD,'bulan_omzet':BO,'total_omzet':TO,'total_kunjungan':TK},f)
print(f'OK: P={len(P)} F={len(F)} L={len(LD)}', flush=True)
