const fs    = require('fs');
const path  = require('path');
const https = require('https');
require('dotenv').config();

const PROPOSALS_DB  = path.join(__dirname, '../../proposals_db.json');
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN  || '';
const GITHUB_REPO   = process.env.GITHUB_REPO   || 'agem2024/SEGURITI-USC';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

const M1 = {
  id:          'MP-PROP-4423V-SANDHU',
  client:      'Manjinder S. Sandhu - Gurmeet K. Sandhu',
  address:     '4423 Vistapark Dr, San Jose, CA 95136',
  total:       '$19,671.18 USD',
  file_local:  path.resolve(__dirname, '../../../../../propuestas mp/majinder mahter/propuesta_cotizacion_4423_vistapark_v1.1.html'),
  github_path: 'proposals/sandhu-4423/propuesta_cotizacion_4423_vistapark.html',
  public_url:  'https://agem2024.github.io/SEGURITI-USC/proposals/sandhu-4423/propuesta_cotizacion_4423_vistapark.html',
  contract_url:'https://agem2024.github.io/SEGURITI-USC/proposals/sandhu-4423/contrato_cslb_4423_vistapark.html',
  expires_d:   30,
};

function loadDB() {
  try { return JSON.parse(fs.readFileSync(PROPOSALS_DB, 'utf8')); }
  catch(e) { return { proposals:[], events:[] }; }
}
function saveDB(db) {
  try { fs.writeFileSync(PROPOSALS_DB, JSON.stringify(db,null,2),'utf8'); }
  catch(e) { console.warn('[M1 DB] Could not write DB:', e.message); }
}
function logEv(pid, event, meta) {
  const db = loadDB();
  if (!db.events) db.events = [];
  db.events.push({ proposal_id:pid, event, timestamp:new Date().toISOString(), ...meta });
  saveDB(db);
}

function uploadGH(localPath, repoPath) {
  return new Promise((resolve, reject) => {
    if (!GITHUB_TOKEN) return reject(new Error('GITHUB_TOKEN no configurado en .env'));
    if (!fs.existsSync(localPath)) return reject(new Error('Archivo no encontrado: '+localPath));
    const b64 = fs.readFileSync(localPath).toString('base64');
    const [owner, repo] = GITHUB_REPO.split('/');
    const api = '/repos/'+owner+'/'+repo+'/contents/'+repoPath;
    function sha(cb) {
      const r = https.request({
        hostname:'api.github.com', path:api, method:'GET',
        headers:{'Authorization':'token '+GITHUB_TOKEN,'User-Agent':'MP-Bot','Accept':'application/vnd.github.v3+json'}
      }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{cb(JSON.parse(d).sha||null);}catch(e){cb(null);} }); });
      r.on('error',()=>cb(null)); r.end();
    }
    sha(s => {
      const body = JSON.stringify({
        message:'[MP] Upload '+M1.id, content:b64, branch:GITHUB_BRANCH, ...(s?{sha:s}:{})
      });
      const r = https.request({
        hostname:'api.github.com', path:api, method:'PUT',
        headers:{
          'Authorization':'token '+GITHUB_TOKEN,'User-Agent':'MP-Bot',
          'Accept':'application/vnd.github.v3+json',
          'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)
        }
      }, res => {
        let d=''; res.on('data',c=>d+=c);
        res.on('end',()=>(res.statusCode===200||res.statusCode===201)?resolve(true):reject(new Error('GH '+res.statusCode)));
      });
      r.on('error',reject); r.write(body); r.end();
    });
  });
}

function handleM1Command(bot, msg) {
  const chatId = msg.chat.id;
  const exp = new Date(); exp.setDate(exp.getDate()+M1.expires_d);
  const expStr = exp.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  bot.sendMessage(chatId,
    '*MORALES PLUMBING - ENVIAR PROPUESTA*\n\n'+
    'Propuesta: `'+M1.id+'`\n'+
    'Cliente: '+M1.client+'\n'+
    'Total: *'+M1.total+'*\n'+
    'Vencimiento: '+expStr+'\n\n'+
    '*Confirmas el envio?*',
    { parse_mode:'Markdown', reply_markup:{ inline_keyboard:[[
      {text:'ENVIAR PROPUESTA', callback_data:'mp1_confirm'},
      {text:'CANCELAR',         callback_data:'mp1_cancel'}
    ]]}}
  );
  logEv(M1.id, 'M1_TRIGGERED', {chat_id:chatId});
}

async function handleM1Callback(bot, cbq) {
  const chatId = cbq.message.chat.id;
  const msgId  = cbq.message.message_id;
  await bot.answerCallbackQuery(cbq.id);

  if (cbq.data === 'mp1_cancel') {
    bot.editMessageText('Envio cancelado.',{chat_id:chatId,message_id:msgId});
    logEv(M1.id,'M1_CANCELLED'); return;
  }

  if (cbq.data === 'mp1_confirm') {
    bot.editMessageText('Subiendo propuesta a GitHub Pages...',{chat_id:chatId,message_id:msgId});
    let ok = false;
    try { await uploadGH(M1.file_local, M1.github_path); ok = true; }
    catch(e) { console.warn('[M1] GitHub:', e.message); }

    const db = loadDB();
    if (!db.proposals) db.proposals = [];
    const rec = {
      id:M1.id, client:M1.client, address:M1.address, total:M1.total,
      status:'SENT', receipt_status:'PENDING', accept_status:'PENDING',
      sent_at:new Date().toISOString(), url:M1.public_url, github:ok, version:1
    };
    const idx = db.proposals.findIndex(p=>p.id===M1.id);
    if(idx>=0) db.proposals[idx]=rec; else db.proposals.push(rec);
    saveDB(db);
    logEv(M1.id,'PROPOSAL_SENT',{url:M1.public_url,github:ok});

    const statusTxt = ok ? 'Subido a GitHub Pages exitosamente' : 'Sin GITHUB_TOKEN - sube manualmente y usa el link';

    const clientMsg = `*PROPUESTA OFICIAL - MORALES PLUMBING*\n` +
      `AI-INTEGRATED SERVICES\n` +
      `Lic. C-36 #1156542 | San Jose, CA\n` +
      `Tel: (669) 213-4422 | Web: www.morales-plumbing.com\n\n` +
      `*DETALLES DE LA PROPUESTA:*\n` +
      `• Cliente: ${M1.client}\n` +
      `• Referencia: ${M1.id}\n` +
      `• Total Estimado: ${M1.total}\n\n` +
      `*INSTRUCCIONES PARA EL CLIENTE:*\n` +
      `1. Abra el enlace para acceder a su propuesta digital.\n` +
      `2. Firme el Acuso de Recibo para desbloquear los precios y detalles.\n` +
      `3. Revise la cotizacion y firme al final si autoriza los trabajos.\n\n` +
      `*Acceda y firme digitalmente su propuesta aqui:*\n${M1.public_url}\n\n` +
      `*Contrato Legal CSLB (Mejoras del Hogar):*\n${M1.contract_url}`;

    bot.editMessageText(
      (ok?'PROPUESTA ENVIADA':'LINK LISTO')+' - '+M1.id+'\n\n'+
      'Estado: '+statusTxt+'\n\n'+
      'LINK DEL CLIENTE:\n'+M1.public_url+'\n\n'+
      '--- COPIAR PARA EL CLIENTE ---\n'+
      clientMsg + '\n\n'+
      'Recibiras email en moralesplumbing026@gmail.com cuando el cliente firme.',
      {chat_id:chatId, message_id:msgId,
       reply_markup:{inline_keyboard:[[{text:'Ver Status',callback_data:'mp1_status'}]]}}
    );
  }

  if (cbq.data === 'mp1_status') {
    const db = loadDB();
    const p  = (db.proposals||[]).find(x=>x.id===M1.id);
    if (!p) { bot.sendMessage(chatId,'Sin registros para '+M1.id); return; }
    const evts = (db.events||[]).filter(e=>e.proposal_id===M1.id).slice(-8)
      .map(e=>e.event+' '+e.timestamp.substring(0,19)).join('\n')||'Sin eventos';
    bot.sendMessage(chatId,
      'STATUS '+M1.id+'\n'+
      'Estado: '+p.status+'\nRecibo: '+p.receipt_status+'\nAceptacion: '+p.accept_status+'\n'+
      'Enviado: '+(p.sent_at||'N/A').substring(0,19)+'\nURL: '+p.url+'\n\nEventos:\n'+evts
    );
  }
}

module.exports = { handleM1Command, handleM1Callback };
