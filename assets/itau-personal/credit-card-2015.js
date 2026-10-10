/* Cauã · Itaú Visa Gold simulated card ledger. Source: sheet "Thẻ tín dụng".
   Separate from the checking-account ledger. All values are integer centavos. */
(function(){
 'use strict';
 const RAW=`42162|12:04|Supermercados Mundial|Siêu thị|13450|07
42165|18:33|Drogaria Pacheco|Hiệu thuốc|7890|07
42168|16:51|Lojas Renner — Rio Sul|Quần áo|22990|07
42170|13:23|Bob’s — Centro|Ăn uống|4650|07
42173|09:40|Posto Ipiranga|Xăng xe|12900|07
42175|17:06|Café do Arco|Quán cà phê|3850|07
42178|21:17|Lapa 40 Graus|Ăn uống|15480|07
42181|15:45|Centauro — Rio Sul|Đồ thể thao|21900|07
42182|14:18|Livraria da Travessa|Sách|8460|07
42185|20:28|Bar do Adão|Ăn uống|16230|07
42187|11:43|Casa & Vídeo|Đồ gia dụng|8990|07
42189|17:13|C&A — Centro|Quần áo|41310|07
42192|12:15|Supermercados Mundial|Siêu thị|14990|08
42194|20:16|Botequim Belmonte|Ăn uống|5250|08
42197|15:52|Lojas Americanas|Mua sắm|19900|08
42199|10:33|Posto Shell|Xăng xe|8560|08
42202|19:48|Drogaria Pacheco|Hiệu thuốc|6490|08
42204|14:06|Centauro — Rio Sul|Đồ thể thao|23800|08
42208|21:09|Pizzaria Guanabara|Ăn uống|11040|08
42210|16:35|Café do Forte|Quán cà phê|4990|08
42212|22:10|Restaurante Nova Capela|Ăn uống|17650|08
42215|15:01|Casa & Vídeo|Đồ gia dụng|11500|08
42218|19:42|Kinoplex|Giải trí|8990|08
42220|18:23|Lojas Renner — Rio Sul|Quần áo|45740|08
42223|13:16|Supermercados Mundial|Siêu thị|16275|09
42226|17:09|Drogaria Pacheco|Hiệu thuốc|3990|09
42228|20:22|Botequim Belmonte|Ăn uống|9180|09
42231|16:45|C&A — Rio Sul|Quần áo|26450|09
42233|08:59|Posto Ipiranga|Xăng xe|12000|09
42236|12:41|Lojas Americanas|Mua sắm|8490|09
42238|21:28|Restaurante Nova Capela|Ăn uống|18960|09
42239|19:34|Bar do Adão|Ăn uống|7250|09`;
 const isoDay=serial=>new Date(Date.UTC(1899,11,30)+serial*86400000).toISOString().slice(0,10);
 const transactions=Object.freeze(RAW.split('\n').map((line,index)=>{
  const [serial,time,merchant,category,amount,month]=line.split('|');
  return Object.freeze({id:'VISA-2015-'+String(index+1).padStart(3,'0'),date:isoDay(Number(serial)),time,merchant,category,amountCents:Number(amount),period:'2015-'+month});
 }));
 const statements=Object.freeze([
  Object.freeze({period:'2015-07',closingDate:'2015-07-05',dueDate:'2015-07-13',amountCents:178100,status:'paid',paymentReference:'CP-20150713-0332'}),
  Object.freeze({period:'2015-08',closingDate:'2015-08-05',dueDate:'2015-08-12',amountCents:178900,status:'paid',paymentReference:'CP-20150812-0340'}),
  Object.freeze({period:'2015-09',closingDate:'2015-09-05',dueDate:'2015-09-14',amountCents:102595,status:'open',paymentReference:null})
 ]);
 const totals=new Map(statements.map(s=>[s.period,transactions.filter(t=>t.period===s.period).reduce((sum,t)=>sum+t.amountCents,0)]));
 if(transactions.length!==32||statements.some(s=>totals.get(s.period)!==s.amountCents)||transactions.some(t=>t.date>'2015-08-23'))throw Error('Visa Gold card canon mismatch');
 window.CauaPersonalCard=Object.freeze({
  holder:'Cauã Henrique Valença de Oliveira',cardName:'Itaú Visa Gold',last4:'4836',limitCents:1000000,
  currentCents:102595,availableCents:897405,asOf:'2015-08-29',lastPurchase:'2015-08-23',
  transactions,statements
 });
})();