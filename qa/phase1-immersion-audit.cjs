// Phase 1 guard: production, player-facing text only. Do not scan story evidence.
const fs=require('node:fs'),assert=require('node:assert/strict');
const sources=['index.html','js/safari.js','assets/whatsapp/wa-enhancements-2015.js'];
const banned=[
 /bản sao (?:điện thoại|dữ liệu|này)/gi,
 /chế độ (?:xem dữ liệu|chỉ đọc)/gi,
 /trong game/gi,
 /bản (?:dựng|thử|mô phỏng|offline|Facebook offline|điều tra)/gi,
 /thiết bị điều tra/gi,
 /(?:Safari|phiên bản) (?:local|cục bộ)/gi,
 /phục vụ điều tra/gi,
 /trong bản (?:dữ liệu|offline|mô phỏng)/gi,
 /dữ liệu (?:case|ngoại tuyến|offline|điện thoại)/gi,
 /sẽ hoàn thiện trong đợt tiếp theo/gi,
 /fb15InstallMessenger|Cài đặt Messenger/gi,
];
let violations=[];
for(const path of sources){
 const content=fs.readFileSync(path,'utf8');
 for(const re of banned){
   for(const hit of content.matchAll(re)){
     const line=content.slice(0,hit.index).split('\n').length;
     violations.push(path+':'+line+': '+hit[0]);
   }
 }
}
assert.equal(violations.length,0,'Out-of-world UI language found:\n'+violations.join('\n'));
const html=fs.readFileSync('index.html','utf8');
assert(!html.includes('id="fb15InstallMessenger"'),'False Messenger installer must not exist');
for(const key of ['photos','mail','messages','whatsapp','facebook','safari','phone','calendar','voice','notes','itau','itau-biz','goodreader']){
 assert(html.includes('data-app="'+key+'"'),'Missing launcher '+key);
}
assert(html.includes('Không có kết nối.'),'Natural connection response missing');
console.log('PHASE 1 COPY PASS — '+sources.length+' entrypoints, 13 launchers, no meta language.');
