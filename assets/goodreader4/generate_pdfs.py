#!/usr/bin/env python3
"""Build GoodReader 2015 PDF assets from the same JSON as the interactive viewer."""
import json,io,os,html
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader,PdfWriter
BASE='assets/goodreader4'
DEST=BASE+'/docs'
os.makedirs(DEST,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/'
pdfmetrics.registerFont(TTFont('GR',font+'DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('GRB',font+'DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('GRI',font+'DejaVuSans-Oblique.ttf'))
pdfmetrics.registerFontFamily('GR',normal='GR',bold='GRB',italic='GRI',boldItalic='GRB')
def style(name,fn,size,lead,after=0,before=0):
 return ParagraphStyle(name,fontName=fn,fontSize=size,leading=lead,spaceAfter=after,spaceBefore=before)
sty={'brand':style('Brand','GRB',16,21,10),'title':style('Title','GRB',12,17,14),
'heading':style('Head','GRB',10.8,16,5,13),'para':style('Body','GR',9.25,14.1,9),
'line':style('Line','GR',9.25,15.6,2),'signature':style('Sig','GRB',10,16,4),
'handwritten':style('Hand','GRI',15,22,4),'seal':style('Seal','GRB',9,14,5)}
def foot(canvas,doc):
 canvas.saveState();canvas.setFont('GR',7.5);canvas.setFillColor(colors.grey)
 canvas.drawRightString(A4[0]-48,27,str(doc.page));canvas.restoreState()
for d in json.load(open(BASE+'/documents.json',encoding='utf-8'))['documents']:
 out=DEST+'/'+d['filename'];buf=io.BytesIO()
 pdf=SimpleDocTemplate(buf,pagesize=A4,leftMargin=52,rightMargin=52,topMargin=51,bottomMargin=53,title=d['filename'],author='Subsolo' if d['id']=='subsolo-2015' else 'VH')
 flow=[]
 for pageidx,page in enumerate(d['pages']):
  if pageidx:flow.append(PageBreak())
  for block in page:
   t=block['type']
   if t=='space':flow.append(Spacer(1,9));continue
   if t=='list':
    for item in block['items']:flow.append(Paragraph('• '+html.escape(item),sty['para']))
    continue
   body=html.escape(block.get('text',''))
   if t=='line':body='<b>'+html.escape(block['label'])+':</b> '+body
   flow.append(Paragraph(body,sty.get(t,sty['para'])))
 pdf.build(flow,onFirstPage=foot,onLaterPages=foot)
 if d.get('password'):
  reader=PdfReader(io.BytesIO(buf.getvalue()));writer=PdfWriter()
  writer.append_pages_from_reader(reader)
  writer.encrypt(user_password=d['password'],owner_password='VHArchive2012-N09',algorithm='AES-128')
  with open(out,'wb') as f:writer.write(f)
 else:
  with open(out,'wb') as f:f.write(buf.getvalue())
 print('Built',out,os.path.getsize(out),'bytes')
