import sys
s=open(sys.argv[1],encoding='utf-8').read()
def rep(a,b):
    global s; assert s.count(a)==1,(a,s.count(a)); s=s.replace(a,b)
rep("fetch(SB_URL+'/rest/v1/rpc/'+fn,","fetch(SB_URL+'/rest/v1/rpc/r_'+fn,")
rep("<title>لوحة تحكّم تحدّي الدقيقة</title>","<title>لوحة تحكّم تحدّي الدقيقة</title>")
rep('<h1>لوحة التحكّم</h1>','<h1>لوحة التحكّم</h1>')
rep("https://almotawa80.github.io/60sec/#k=","https://almotawa80.github.io/60sec/road.html#k=")
for k in ["'mc_admin_tab'","'mc_issued'","'mc_admin_open'","'mc_admin_tr'"]:
    s=s.replace(k,k[:-1]+"_road'")
open(sys.argv[2],'w',encoding='utf-8').write(s); print('ok')
