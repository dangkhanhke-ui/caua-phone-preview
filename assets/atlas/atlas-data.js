(function(){
'use strict';
// Atlas fiction fixtures. All values are simulated game data, not device surveillance.
const base='./';
const main={
breno:'MC01_Breno_Martins.png.png',luisa:'MC02_Luisa_Montenegro.png.png',
rafaela:'MC03_Rafaela_Lima.png.png',dudu:'MC04_Eduardo_Santos.png.png',
lucas:'MC05_Lucas_Andrade.png.png',brenda:'MC06_Brenda_Santos.png.png',
joao:'MC07_Joao_Cardoso.png.png',jessica:'MC08_Jessica_Ferreira.png.png',
henrique:'MC09_Henrique_Lima.png.png'
};
const profiles=[
['luisa','Luísa Montenegro','Luísa','N02','08:34','Subsolo','VIVO_3G',14,0],
['dudu','Eduardo Santos','Dudu','N05','08:41','A Casa','CASA_2G',25,0],
['brenda','Brenda Santos','Brenda','N06','07:22','A Casa','',21,0],
['breno','Breno Martins','Breno','N01','07:58','Subsolo','VIVO_3G',30,0],
['lucas','Lucas Andrade','Lucas','N04','08:09','Subsolo','SUBSOLO_2G',15,0],
['enzo','Enzo Moreira','Enzo','N10','08:17','A Casa','CASA_2G',20,0],
['rafaela','Rafaela Lima','Rafaela','N03','08:20','A Casa','CASA_2G',10,0],
['joao','João Cardoso','João','N07','07:31','Subsolo','VIVO_3G',9,0],
['jessica','Jéssica Ferreira','Jéssica','N08','08:12','Centro','VIVO_3G',8,0],
['henrique','Henrique Lima','Henrique','N09','19/05/2015','Subsolo','',7,0],
['sergio','Sérgio Almeida','Sérgio','C14','07:44','Centro','NET_VIRTUA',17,0],
['guilherme','Guilherme Rocha','Guilherme','C18','03/05/2013','Subsolo','',11,0],
['otavio','Otávio Ferreira','Otávio','C22','13/08/2015','Centro','',15,0],
['leandro','Leandro Costa','Leandro','A09','18/06/2012','Centro','',14,0],
['vanessa','Vanessa Oliveira','Vanessa','A12','11/05/2014','Centro','',15,0],
['diego','Diego Santana','Diego','C11','08:03','A Casa','CASA_2G',14,0],
['helena','Helena Prado','Helena','C16','26/08/2015','Centro','',9,0],
['camila','Camila Ribeiro','Camila','C19','07:50','Centro','VIVO_3G',10,0],
['natalia','Natália Borges','Natália','C20','27/08/2015','Centro','',8,0],
['tiago','Tiago Neves','Tiago','C23','07:22','A Casa','CASA_2G',11,0],
['paulo','Paulo Motta','Paulo','C24','20/08/2015','Centro','',8,0],
['beatriz','Beatriz Lima','Beatriz','C25','19/08/2015','A Casa','',8,0],
['marcela','Marcela Ferreira','Marcela','C27','08:32','Subsolo','VIVO_3G',10,0],
['romulo','Rômulo Braga','Rômulo','C28','13/08/2015','Centro','',6,0],
['gabriel','Gabriel Rocha','Gabriel','C29','08:01','Subsolo','SUBSOLO_2G',12,0],
['fernanda','Fernanda Coutinho','Fernanda','C30','17/08/2015','A Casa','',8,0],
['thiago','Thiago Pires','Thiago','C31','06/07/2015','Centro','',6,0],
['marina','Marina Campos','Marina','C32','10/08/2015','Centro','',6,0],
['carolina','Carolina Nunes','Carolina','C33','08:11','A Casa','CASA_2G',7,0],
['matheus','Matheus Queiroz','Matheus','C34','20/08/2015','Centro','',7,0],
['andre','André Carvalho','André','C35','22/08/2015','Subsolo','',9,0],
['aline','Aline Peixoto','Aline','C36','12/08/2015','Centro','',5,0],
['igor','Igor Ferreira','Igor','C37','18/07/2015','A Casa','',7,0],
['juliana','Juliana Rocha','Juliana','C38','03/08/2015','Centro','',6,0],
['bruno','Bruno Vasconcelos','Bruno','C39','06/08/2015','Centro','',7,0],
['amanda','Amanda Freitas','Amanda','C40','21/08/2015','A Casa','',8,0],
['renan','Renan Castro','Renan','C41','24/08/2015','Centro','',5,0],
['pedro','Pedro Tavares','Pedro','C42','27/08/2015','Subsolo','',6,0]
].map((row,i)=>({
id:row[0],name:row[1],short:row[2],code:row[3],last:row[4],place:row[5],network:row[6],
quota:row[7],removed:false,portrait:main[row[0]]||null,
sprite:main[row[0]]?null:((i*7+12)%50)+1,
offline:!row[6]||row[4].includes('/'),sync:'08:'+String(12+(i*7)%44).padStart(2,'0'),
camera:row[5]==='A Casa'?'Lối vào phía nam':row[5]==='Subsolo'?'Hành lang tầng 1':'Camera 03'
}));
const deleted=[
['rafaelm','Rafael M.','09/02/2014',6,10],
['cassio','Cássio T.','18/07/2013',3,6],
['lorena','Lorena S.','02/06/2015',4,14],
['marcos','Marcos A.','11/11/2012',2,18],
['elisa','Elisa B.','15/04/2014',5,22],
['danilo','Danilo P.','03/01/2015',3,3]
].map((r,i)=>({id:r[0],name:r[1],short:r[1],code:'X'+(i+1),last:r[2],deletedAt:r[2],place:'Arquivo',network:'',quota:r[3],removed:true,sprite:r[4],offline:true,camera:''}));
const sources=['Camera','Thiết bị','Tin nhắn','Đã lưu từ web','Nhập từ máy tính','VH Archive','Facebook'];
const types=['photo','camera','message','document','map','audio','mail','video'];
const entries=[];
function add(p,date,source,kind,title,more){
 const id='at-'+String(entries.length+1).padStart(4,'0');
 const e=Object.assign({id,p,date,source,kind,title,location:'',device:source==='Thiết bị'?'iPhone':source==='Tin nhắn'?'iPhone':'',saved:date,locked:false,pinned:false,origin:'',caption:''},more||{});
 entries.push(e);return e;
}
function item(p,date,source,kind,title,extra){return add(p,date,source,kind,title,extra);}
[
['leandro','2012-07-02 10:12','Đã lưu từ web','photo','registro_0207.jpg',{caption:'Arquivo extraído após a última atividade do dispositivo.'}],
['leandro','2012-06-21 01:46','Nhập từ máy tính','document','transferencias_21jun.pdf',{caption:'Comprovantes · có hai giao dịch từ Cauã.'}],
['leandro','2012-06-18 22:03','Camera','camera','CAM_0618_2203.jpg',{location:'Centro · Entrada'}],
['leandro','2012-06-14 15:31','Tin nhắn','message','conversa_1406.png',{caption:'Sérgio · 14 jun'}],
['leandro','2012-06-02 18:42','VH Archive','document','AR-12-447.pdf',{origin:'AR-12-447',saved:'2012-06-09 02:12'}],
['leandro','2012-04-11 20:26','Facebook','photo','foto_mesa_1104.jpg'],
['vanessa','2014-05-11 17:46','Thiết bị','map','local_1105.png',{location:'Centro'}],
['vanessa','2014-05-09 23:54','Camera','camera','CAM_0509_2354.jpg',{location:'A Casa · Saída'}],
['vanessa','2014-05-08 11:13','VH Archive','document','AR-14-209.pdf',{origin:'AR-14-209',saved:'2014-05-09 00:18'}],
['vanessa','2014-04-26 00:39','Tin nhắn','message','captura_conversa_2604.png'],
['vanessa','2014-04-20 18:30','Facebook','photo','fb_2004.jpg'],
['vanessa','2014-03-07 10:06','Thiết bị','photo','imagem_0703.jpg',{locked:true}],
['vanessa','2014-05-11 19:09','Nhập từ máy tính','audio','audio_1105.m4a',{locked:true,pinned:true}],
['breno','2015-08-27 08:12','Thiết bị','map','posicao_2708.png',{location:'Centro'}],
['breno','2015-08-25 21:16','Camera','camera','CAM_0825_2116.jpg',{location:'Subsolo · Entrada'}],
['breno','2015-08-24 11:36','Tin nhắn','message','captura_2408.png',{pinned:true}],
['breno','2015-08-20 02:21','VH Archive','document','AR-15-813.pdf',{origin:'AR-15-813',locked:true}],
['breno','2015-07-18 00:36','Camera','video','CAM_0718_0036.mp4',{location:'A Casa · Hall'}],
['breno','2015-06-03 22:42','Thiết bị','photo','IMG_0801.JPG'],
['breno','2015-05-19 18:06','Tin nhắn','message','captura_1905.png',{locked:true}],
['breno','2015-04-14 10:02','Đã lưu từ web','mail','correio_1404.png'],
['guilherme','2013-05-03 23:45','Camera','camera','CAM_0503_2345.jpg',{location:'Subsolo · Entrada'}],
['guilherme','2013-05-01 16:31','Nhập từ máy tính','document','cessao_contrato.pdf',{locked:true,pinned:true}],
['guilherme','2013-03-18 12:26','VH Archive','document','AR-13-187.pdf',{origin:'AR-13-187'}],
['guilherme','2012-11-16 08:42','Nhập từ máy tính','document','cobranca_1611.pdf'],
['guilherme','2012-07-05 02:02','Camera','camera','CAM_0705_0202.jpg',{location:'Subsolo · Escritório'}],
['guilherme','2011-08-30 20:22','Thiết bị','photo','escritorio_2011.jpg'],
['guilherme','2010-10-22 19:14','Facebook','photo','subsolo_2010.jpg'],
['otavio','2015-08-13 10:03','Nhập từ máy tính','document','fianca_2015.pdf',{locked:true,pinned:true}],
['otavio','2015-07-04 16:21','VH Archive','document','AR-15-504.pdf',{origin:'AR-15-504'}],
['otavio','2015-06-12 09:18','Tin nhắn','mail','email_1206.png'],
['otavio','2014-11-09 13:22','Nhập từ máy tính','document','assinatura_2014.pdf',{locked:true}],
['otavio','2014-04-07 14:10','Đã lưu từ web','photo','empresa_familia.jpg'],
['sergio','2015-08-13 01:21','VH Archive','document','AR-15-725.pdf',{origin:'AR-15-725',locked:true,pinned:true}],
['sergio','2015-07-11 19:18','Tin nhắn','mail','email_1107.png',{pinned:true}],
['sergio','2015-06-14 21:01','Nhập từ máy tính','audio','memo_1406.m4a',{locked:true,pinned:true}],
['sergio','2015-05-06 11:14','Nhập từ máy tính','document','declaracao_0605.pdf',{pinned:true}],
['brenda','2015-08-26 02:41','Camera','camera','CAM_0826_0241.jpg',{location:'A Casa · Hall'}],
['brenda','2015-08-24 14:08','Tin nhắn','message','whatsapp_2408.png',{pinned:true}],
['brenda','2015-08-14 10:33','VH Archive','document','AR-15-684.pdf',{origin:'AR-15-684',locked:true,pinned:true}],
['brenda','2015-07-30 22:16','Thiết bị','photo','img_3007.jpg',{locked:true}],
['brenda','2015-07-18 23:33','Facebook','photo','fb_1807.jpg'],
['dudu','2015-08-29 08:39','Thiết bị','photo','IMG_2928.JPG',{location:'A Casa',device:'iPhone'}],
['dudu','2015-08-29 08:36','Camera','camera','CAM_0829_0836.jpg',{location:'A Casa · Lối vào phía nam'}],
['dudu','2015-08-28 23:14','Tin nhắn','message','captura_2808.png',{pinned:true}],
['dudu','2015-08-24 10:34','Thiết bị','map','posicao_2408.png',{location:'A Casa'}],
['enzo','2015-08-29 08:17','Thiết bị','photo','sync_0829.jpg'],
['enzo','2015-08-28 22:32','Camera','camera','CAM_0828_2232.jpg',{location:'A Casa · Lối vào'}],
['luisa','2011-09-12 21:48','Nhập từ máy tính','map','rota_2011.png',{locked:true,pinned:true}],
['luisa','2011-09-11 12:21','Tin nhắn','message','comunicacao_2011.png'],
['luisa','2015-08-16 23:43','VH Archive','document','AR-15-638.pdf',{origin:'AR-15-638'}]
].forEach(v=>item.apply(null,v));
const labels=['IMG','captura','arquivo','registro','anexo','scan','recorte','CAM','doc','print'];
const locs=['Subsolo','A Casa','Centro','Escritório','Entrada lateral','Hành lang tầng 1'];
// Deterministic seeded fillers provide browsable real records, not dead-end counters.
// These are generic background media; story-critical items above are curated.
function seedHash(s){let x=17;for(let i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))%2147483647;return x;}
function fill(p,year,month,count,lockedShare){
 const num=Number(count)||0;
 for(let j=0;j<num;j++){
  const h=seedHash(p.id+year+month+j);
  const day=String(1+h%Math.min(28,(year===2015&&month===8)?29:28)).padStart(2,'0');
  const hour=String(6+(h*7)%18).padStart(2,'0');
  const minute=String((h*11)%60).padStart(2,'0');
  const sec=String((h*17)%60).padStart(2,'0');
  const d=year+'-'+String(month).padStart(2,'0')+'-'+day+' '+hour+':'+minute;
  const si=(h+j)%sources.length;
  const src=sources[si];
  const kind=src==='Camera'?'camera':src==='Tin nhắn'?'message':src==='VH Archive'?'document':src==='Thiết bị'?(j%4===0?'map':'photo'):src==='Nhập từ máy tính'?(j%3===0?'audio':'document'):src==='Facebook'?'photo':types[(h+j)%types.length];
  const code=String((h+j)%9843).padStart(4,'0');
  const suffix={photo:'jpg',camera:'jpg',message:'png',document:'pdf',map:'png',audio:'m4a',mail:'png',video:'mp4'}[kind]||'jpg';
  const f=src==='VH Archive'?'AR-'+String(year).slice(-2)+'-'+code+'.pdf':labels[(h+j)%labels.length]+'_'+code+'.'+suffix;
  const locked=(lockedShare||0)>0&&((h+j)%10)<lockedShare;
  add(p.id,d,src,kind,f,{saved:year+'-'+String(month).padStart(2,'0')+'-'+day+' '+hour+':'+sec,
   location:(kind==='camera'||kind==='map')?locs[(h+j)%locs.length]:'',
   device:src==='Thiết bị'?'iPhone 5':src==='Tin nhắn'?'iPhone':'',
   origin:src==='VH Archive'?'AR-'+String(year).slice(-2)+'-'+code:'',
   locked,pinned:false});
 }
}
profiles.forEach(p=>{
 if(p.id==='breno')[[2013,7,3],[2014,7,8],[2015,2,11],[2015,5,37],[2015,6,29],[2015,7,42],[2015,8,58]].forEach(x=>fill(p,...x,1));
 else if(p.id==='vanessa')[[2011,8,2],[2012,7,3],[2013,8,18],[2014,2,41],[2014,5,27]].forEach(x=>fill(p,...x,6));
 else if(p.id==='leandro')[[2010,10,3],[2011,7,9],[2012,3,18],[2012,6,31]].forEach(x=>fill(p,...x,3));
 else if(p.id==='guilherme')[[2010,9,6],[2011,9,10],[2012,10,17],[2013,4,26]].forEach(x=>fill(p,...x,3));
 else if(p.id==='otavio')[[2013,9,4],[2014,4,11],[2015,8,23]].forEach(x=>fill(p,...x,3));
 else {const n=p.quota;fill(p,2014,3,Math.max(2,Math.floor(n*.18)),1);fill(p,2015,6,Math.floor(n*.36),1);fill(p,2015,8,Math.max(2,n-Math.floor(n*.36)),2);}
});
deleted.forEach(p=>fill(p,Number(p.deletedAt.slice(-4))||2014,Math.max(1,Math.min(12,Number(p.deletedAt.slice(3,5))||6)),p.quota,0));
const activity=[
{p:'breno',time:'08:52',type:'device',text:'Thiết bị của Breno vừa kết nối lại.'},
{p:'brenda',time:'08:47',type:'sync',text:'Có 2 mục mới trong hồ sơ Brenda.'},
{p:'dudu',time:'08:41',type:'device',text:'Dudu rời mạng CASA_2G.'},
{p:'dudu',time:'08:36',type:'location',text:'Dudu được ghi nhận tại A Casa.'},
{p:'enzo',time:'08:17',type:'device',text:'Thiết bị của Enzo hoạt động.'},
{p:'breno',time:'07:58',type:'device',text:'Breno kết nối mạng mới.'},
{p:'luisa',time:'07:42',type:'camera',text:'Có ghi nhận mới từ camera Subsolo.'},
{p:'dudu',time:'07:18',type:'sync',text:'4 mục được đồng bộ vào hồ sơ Eduardo Santos.'},
{p:'gabriel',time:'06:55',type:'location',text:'Gabriel được ghi nhận tại Subsolo.'}
];
const rules=[
{p:'dudu',names:['Rời A Casa','Thiết bị ngoại tuyến quá 30 phút']},
{p:'breno',names:['Xuất hiện tại A Casa','Xuất hiện tại Subsolo','Kết nối Wi-Fi mới']},
{p:'vanessa',names:['Không còn hoạt động']},
{p:'enzo',names:['Xuất hiện tại A Casa','Dữ liệu mới được đồng bộ']},
{p:'brenda',names:['Dữ liệu mới được đồng bộ']},
{p:'luisa',names:['Thiết bị ngoại tuyến']}
];
window.AtlasData2015=Object.freeze({
config:{firstCode:'2408',secondCode:'1105',sync:'24/08/2015 · 08:54',now:'29/08/2015 · 08:52'},
profiles,deleted,entries,activity,rules,sources,
avatar(p){return p.portrait?base+p.portrait:null;}
});
})();