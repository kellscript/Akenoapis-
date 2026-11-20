// akenoapis — servidor único para o Render (site + API + YouTube com yt-dlp)
// Sem dependências npm. Precisa de yt-dlp e ffmpeg (o Dockerfile instala).
const http = require("http");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const HTML = "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n<title>akenoapis – endpoints prontos pro seu projeto</title>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Unbounded:wght@700;800&family=Outfit:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap\">\n<style>\n:root{--bg:#0e0618;--panel:#1a0f2e;--ink:#f6eeff;--mute:#a99bc4;--line:#35205a;--acc:#ff2e63;--acc2:#8b5cf6;--gold:#ffd166;--code:#090412;--codeink:#e9defa;--get:#2dd4a0;--post:#ffb020;--ok:#2dd4a0;\n--head:\"Unbounded\",system-ui,sans-serif;--body:\"Outfit\",system-ui,sans-serif;--mono:\"JetBrains Mono\",ui-monospace,monospace;\nbox-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}\n:root[data-theme=\"light\"]{--bg:#fbf6ff;--panel:#fff;--ink:#2a1245;--mute:#6f5c8d;--line:#e4d2f6;--code:#1a0f2e;--get:#0f9d76;--post:#c77700;--ok:#0f9d76}\nhtml{scroll-padding-top:calc(70px + env(safe-area-inset-top,0px));color-scheme:dark;scroll-behavior:smooth}\n:root[data-theme=\"light\"]{color-scheme:light}\n*{box-sizing:border-box}\nbody{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 var(--body);\nbackground-image:radial-gradient(60rem 30rem at 85% -10%,rgba(255,46,99,.22),transparent 60%),radial-gradient(50rem 30rem at -10% 15%,rgba(139,92,246,.24),transparent 60%);background-attachment:fixed}\nbody::before{content:\"\";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);background:var(--bg);z-index:10}\na{color:var(--acc)}\nbutton,input,select{font:inherit;color:inherit}\n:focus-visible{outline:3px solid var(--gold);outline-offset:2px}\nheader.top{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;display:flex;gap:12px;align-items:center;padding:12px 20px;backdrop-filter:blur(14px);background:color-mix(in srgb,var(--bg) 78%,transparent);border-bottom:1px solid var(--line)}\n.logo{font:800 17px var(--head);letter-spacing:-.03em;margin-right:auto;display:flex;align-items:center;gap:8px}\n.logo svg{width:22px;height:22px;fill:var(--gold)}\n.top a.nav{color:var(--mute);text-decoration:none;font-weight:500;padding:6px 10px;border-radius:10px}\n.top a.nav:hover{color:var(--ink)}\n.top button{border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:6px 14px;cursor:pointer}\n.hero{max-width:1120px;margin:0 auto;padding:64px 20px 36px;display:grid;grid-template-columns:1.15fr 1fr;gap:36px;align-items:center}\nh1{font:800 clamp(40px,8.4vw,86px)/.95 var(--head);letter-spacing:-.05em;margin:0 0 20px;background:linear-gradient(95deg,var(--acc) 0%,#ff8a3d 55%,var(--gold) 100%);-webkit-background-clip:text;background-clip:text;color:transparent;word-break:break-word}\nh1 svg{height:.82em;width:.58em;vertical-align:-.06em;fill:var(--gold);filter:drop-shadow(0 0 14px rgba(255,209,102,.7));margin:0 .02em;animation:zap 1.1s .3s 2}\n@keyframes zap{0%,100%{opacity:1}20%{opacity:.15}40%{opacity:1}60%{opacity:.3}}\n.hero p{color:var(--mute);font-size:19px;max-width:44ch;margin:0 0 26px}\n.cta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:30px}\n.cta a{text-decoration:none;font-weight:700;padding:12px 22px;border-radius:14px}\n.cta .a{background:var(--acc);color:#fff;box-shadow:0 10px 30px -8px var(--acc)}\n.cta .b{border:1.5px solid var(--line);color:var(--ink);background:var(--panel)}\n.stats{display:flex;gap:10px;flex-wrap:wrap}\n.stats div{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:8px 16px;font-size:13px;color:var(--mute)}\n.stats b{display:block;font:700 22px var(--head);color:var(--ink);letter-spacing:-.03em}\n.term{position:relative;background:var(--code);color:var(--codeink);border-radius:20px;font:14px/1.65 var(--mono);padding:18px;min-height:250px;overflow-x:auto;border:1px solid var(--line);box-shadow:0 0 0 1px rgba(255,46,99,.25),0 30px 80px -20px rgba(255,46,99,.45),0 0 60px -10px rgba(139,92,246,.5)}\n.term .dots{display:flex;gap:7px;margin-bottom:12px}.term .dots span{width:11px;height:11px;border-radius:50%;background:#ff5f57}.term .dots span:nth-child(2){background:#febc2e}.term .dots span:nth-child(3){background:#28c840}\n.caret{display:inline-block;width:8px;height:1em;background:var(--gold);vertical-align:-2px;animation:b 1s steps(1) infinite}\n@keyframes b{50%{opacity:0}}\nmain{max-width:1120px;margin:0 auto;padding:20px 20px 70px;display:grid;grid-template-columns:230px 1fr;gap:28px}\naside{position:sticky;top:calc(76px + env(safe-area-inset-top,0px));align-self:start}\naside button{display:flex;justify-content:space-between;width:100%;text-align:left;border:0;background:none;padding:9px 14px;border-radius:12px;cursor:pointer;color:var(--mute);font-weight:500}\naside button:hover{background:var(--panel)}\naside button.on{background:linear-gradient(95deg,var(--acc),#c026d3);color:#fff;font-weight:700}\naside small{opacity:.75}\n.search{width:100%;border:1.5px solid var(--line);background:var(--panel);border-radius:14px;padding:11px 16px;margin-bottom:12px}\n.keybox{margin-top:16px;padding:14px;border:1.5px dashed var(--line);border-radius:14px;font-size:14px;color:var(--mute)}\n.keybox input{width:100%;margin-top:8px;border:1px solid var(--line);background:var(--panel);border-radius:10px;padding:8px 10px;font:13px var(--mono)}\n.ep{background:var(--panel);border:1px solid var(--line);border-left:4px solid var(--get);border-radius:16px;margin-bottom:12px;overflow:hidden;transition:box-shadow .2s,border-color .2s}\n.ep:has(.m.POST){border-left-color:var(--post)}\n.ep:hover,.ep.open{border-color:var(--acc2);box-shadow:0 12px 40px -18px var(--acc2)}\n.ep>.h{display:flex;gap:12px;align-items:center;padding:14px 16px;cursor:pointer;flex-wrap:wrap;width:100%;border:0;background:none;text-align:left}\n.m{font:700 11px var(--mono);padding:4px 10px;border-radius:999px;color:#0b1a14;background:var(--get);letter-spacing:.04em}\n.m.POST{background:var(--post);color:#241600}\n.path{font:500 14px var(--mono);word-break:break-all}\n.ep .d{color:var(--mute);font-size:15px;margin-left:auto}\n.body{display:none;padding:6px 16px 18px;border-top:1px solid var(--line)}\n.ep.open .body{display:block}\n.row{display:grid;grid-template-columns:130px 1fr;gap:8px;align-items:center;margin:10px 0;font-size:14px}\n.row label{font:500 13px var(--mono)}\n.row label em{color:var(--acc);font-style:normal}\n.row input{border:1px solid var(--line);background:var(--bg);border-radius:10px;padding:9px 12px;font:14px var(--mono);width:100%}\n.row small{grid-column:2;color:var(--mute);margin-top:-4px}\n.tabs{display:flex;gap:6px;margin:16px 0 8px}\n.tabs button{border:1px solid var(--line);background:none;border-radius:999px;padding:5px 14px;cursor:pointer;font-size:13px;color:var(--mute)}\n.tabs button.on{background:var(--ink);color:var(--bg);border-color:var(--ink);font-weight:700}\npre{background:var(--code);color:var(--codeink);border-radius:14px;padding:14px 16px;font:13px/1.6 var(--mono);overflow-x:auto;margin:0;white-space:pre-wrap;word-break:break-word;border:1px solid var(--line)}\n.k{color:#ff8fb1}.s{color:#7ef0c4}.n{color:#ffd166}\n.act{display:flex;gap:10px;margin:14px 0 10px;align-items:center;flex-wrap:wrap}\n.run{background:var(--acc);color:#fff;border:0;border-radius:12px;padding:10px 22px;cursor:pointer;font-weight:700;box-shadow:0 8px 22px -8px var(--acc)}\n.run:active{transform:translateY(1px)}\n.ghost{border:1.5px solid var(--line);background:none;border-radius:12px;padding:9px 16px;cursor:pointer}\n.stat{font:500 13px var(--mono);color:var(--mute)}.stat b{color:var(--ok)}\n.empty{text-align:center;padding:48px;color:var(--mute)}\n.toast{position:fixed;left:50%;bottom:calc(22px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);background:var(--gold);color:#2a1a00;font-weight:700;padding:9px 18px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .2s;z-index:20}\n.toast.on{opacity:1}\nfooter{text-align:center;color:var(--mute);font-size:14px;padding:30px 16px 40px;border-top:1px solid var(--line)}\n@media (max-width:820px){.hero{grid-template-columns:1fr;padding-top:40px}main{grid-template-columns:1fr}aside{position:static}aside .cats{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}aside button{width:auto;white-space:nowrap;border:1px solid var(--line)}.row{grid-template-columns:1fr}.row small{grid-column:1}.ep .d{margin-left:0;width:100%}.top a.nav{display:none}}\n@media (prefers-reduced-motion:reduce){.caret,h1 svg{animation:none}html{scroll-behavior:auto}}\n</style>\n</head>\n<body>\n<header class=\"top\">\n  <div class=\"logo\"><svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M13 2 3 14h7l-1 8 11-13h-7z\"/></svg>akenoapis</div>\n  <a class=\"nav\" href=\"#list\">Endpoints</a>\n  <a class=\"nav\" href=\"#chave\">Minha chave</a>\n  <button id=\"theme\" aria-label=\"Alternar tema\">Tema</button>\n</header>\n\n<section class=\"hero\">\n  <div>\n    <h1>akeno<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path d=\"M13 2 3 14h7l-1 8 11-13h-7z\"/></svg>apis</h1>\n    <p>APIs rápidas pro seu bot, app ou site. Escolha o endpoint, teste aqui mesmo e copie o código pronto.</p>\n    <div class=\"cta\"><a class=\"a\" href=\"#list\">Ver endpoints</a><a class=\"b\" href=\"#chave\">Colocar minha chave</a></div>\n    <div class=\"stats\">\n      <div><b id=\"sCount\">0</b>endpoints</div>\n      <div><b id=\"sCats\">0</b>categorias</div>\n      <div><b id=\"sReq\">0</b>testes agora</div>\n    </div>\n  </div>\n  <div class=\"term\" aria-live=\"polite\"><div class=\"dots\"><span></span><span></span><span></span></div><div id=\"demo\"></div></div>\n</section>\n\n<main>\n  <aside id=\"chave\">\n    <input class=\"search\" id=\"q\" type=\"search\" placeholder=\"Buscar endpoint…\" aria-label=\"Buscar endpoint\">\n    <div class=\"cats\" id=\"cats\"></div>\n    <div class=\"keybox\">Sua chave de API\n      <input id=\"key\" placeholder=\"cole sua apikey aqui\" autocomplete=\"off\">\n    </div>\n  </aside>\n  <section id=\"list\" aria-label=\"Lista de endpoints\"></section>\n</main>\n\n<footer>akenoapis · os testes desta prévia são simulados. No Cloudflare Workers eles chamam a API de verdade.</footer>\n<div class=\"toast\" id=\"toast\"></div>\n\n<script>\n/* ===== CONFIG: edite aqui ===== */\nconst BASE_URL = location.origin;\nconst LIVE = true;  /* true = chama a API de verdade (use quando estiver no Cloudflare) */\nconst ENDPOINTS = [\n {cat:\"Download\",m:\"GET\",path:\"/api/youtube/mp3\",title:\"YouTube para MP3\",desc:\"Baixa o áudio de um vídeo.\",params:[{n:\"url\",req:1,ex:\"https://youtu.be/dQw4w9WgXcQ\",d:\"Link do vídeo\"}],res:{status:true,titulo:\"Never Gonna Give You Up\",duracao:\"3:33\",download:\"{url}\"}},\n {cat:\"Download\",m:\"GET\",path:\"/api/youtube/mp4\",title:\"YouTube para MP4\",desc:\"Baixa o vídeo em qualidade escolhida.\",params:[{n:\"url\",req:1,ex:\"https://youtu.be/dQw4w9WgXcQ\",d:\"Link do vídeo\"},{n:\"qualidade\",ex:\"720\",d:\"360, 720 ou 1080\"}],res:{status:true,qualidade:\"{qualidade}\",download:\"{url}\"}},\n {cat:\"Download\",m:\"GET\",path:\"/api/tiktok\",title:\"TikTok sem marca d’água\",desc:\"Retorna o vídeo limpo.\",params:[{n:\"url\",req:1,ex:\"https://vm.tiktok.com/abc123\",d:\"Link do TikTok\"}],res:{status:true,autor:\"@usuario\",semMarca:\"{url}\"}},\n {cat:\"Pesquisa\",m:\"GET\",path:\"/api/google\",title:\"Busca Google\",desc:\"Resultados de pesquisa em JSON.\",params:[{n:\"q\",req:1,ex:\"receita de bolo\",d:\"Termo buscado\"}],res:{status:true,busca:\"{q}\",resultados:[{titulo:\"Bolo simples e fofinho\",link:\"https://exemplo.com/bolo\"},{titulo:\"10 bolos fáceis\",link:\"https://exemplo.com/10\"}]}},\n {cat:\"Pesquisa\",m:\"GET\",path:\"/api/wikipedia\",title:\"Wikipedia\",desc:\"Resumo de um artigo.\",params:[{n:\"q\",req:1,ex:\"Brasil\",d:\"Assunto\"}],res:{status:true,titulo:\"{q}\",resumo:\"Texto resumido do artigo sobre {q}.\"}},\n {cat:\"Imagens\",m:\"GET\",path:\"/api/qrcode\",title:\"Gerar QR Code\",desc:\"Cria um QR Code a partir de um texto.\",params:[{n:\"texto\",req:1,ex:\"https://meusite.com\",d:\"Conteúdo do QR\"},{n:\"tamanho\",ex:\"300\",d:\"Pixels (padrão 256)\"}],res:{status:true,imagem:\"{BASE}/img/qr_x9f2.png\",tamanho:\"{tamanho}\"}},\n {cat:\"Imagens\",m:\"POST\",path:\"/api/ia/imagem\",title:\"Imagem por IA\",desc:\"Gera uma imagem a partir de um prompt.\",params:[{n:\"prompt\",req:1,ex:\"um gato astronauta\",d:\"Descrição da imagem\"}],res:{status:true,prompt:\"{prompt}\",imagem:\"{BASE}/img/ia_77ab.png\"}},\n {cat:\"Utilidades\",m:\"GET\",path:\"/api/cep\",title:\"Consultar CEP\",desc:\"Endereço completo a partir do CEP.\",params:[{n:\"cep\",req:1,ex:\"01001000\",d:\"Só números\"}],res:{status:true,cep:\"{cep}\",rua:\"Praça da Sé\",bairro:\"Sé\",cidade:\"São Paulo\",uf:\"SP\"}},\n {cat:\"Utilidades\",m:\"GET\",path:\"/api/clima\",title:\"Previsão do tempo\",desc:\"Clima atual de uma cidade.\",params:[{n:\"cidade\",req:1,ex:\"Recife\",d:\"Nome da cidade\"}],res:{status:true,cidade:\"{cidade}\",temp:\"29°C\",condicao:\"Ensolarado\"}},\n {cat:\"Utilidades\",m:\"GET\",path:\"/api/encurtar\",title:\"Encurtador de link\",desc:\"Gera um link curto.\",params:[{n:\"url\",req:1,ex:\"https://meusite.com/pagina-enorme\",d:\"Link original\"}],res:{status:true,curto:\"{BASE}/s/aB3xY\"}},\n {cat:\"Utilidades\",m:\"GET\",path:\"/api/traduzir\",title:\"Tradutor\",desc:\"Traduz texto entre idiomas.\",params:[{n:\"texto\",req:1,ex:\"Bom dia\",d:\"Texto\"},{n:\"para\",ex:\"en\",d:\"Código do idioma\"}],res:{status:true,original:\"{texto}\",idioma:\"{para}\",traducao:\"Good morning\"}},\n {cat:\"Diversão\",m:\"GET\",path:\"/api/piada\",title:\"Piada aleatória\",desc:\"Uma piada ruim pra cada chamada kkkk.\",params:[],res:{status:true,piada:\"Por que o JSON foi ao médico? Porque estava com chave quebrada.\"}},\n {cat:\"Diversão\",m:\"GET\",path:\"/api/frase\",title:\"Frase do dia\",desc:\"Frase motivacional aleatória.\",params:[],res:{status:true,frase:\"Se compilou de primeira, desconfie.\"}}\n];\n/* ================================= */\nconst $=s=>document.querySelector(s);\nlet cat=\"Todos\",term=\"\",reqs=0;\nconst store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};\nconst cats=[\"Todos\",...new Set(ENDPOINTS.map(e=>e.cat))];\n$(\"#sCount\").textContent=ENDPOINTS.length;$(\"#sCats\").textContent=cats.length-1;\nconst toast=t=>{const e=$(\"#toast\");e.textContent=t;e.classList.add(\"on\");setTimeout(()=>e.classList.remove(\"on\"),1600)};\nconst esc=s=>String(s).replace(/[&<>]/g,c=>({\"&\":\"&amp;\",\"<\":\"&lt;\",\">\":\"&gt;\"}[c]));\nconst color=j=>esc(JSON.stringify(j,null,2)).replace(/(\"[^\"]*\")(\\s*:)?|\\b(true|false|null)\\b|(-?\\d+\\.?\\d*)/g,(m,a,b,c,d)=>a?(b?`<span class=\"k\">${a}</span>${b}`:`<span class=\"s\">${a}</span>`):`<span class=\"n\">${m}</span>`);\n\nfunction vals(box,ep){const o={};ep.params.forEach((p,i)=>{const v=box.querySelector(`[data-i=\"${i}\"]`).value.trim();if(v)o[p.n]=v});return o}\nfunction fullUrl(ep,v){const k=$(\"#key\").value.trim();const p=new URLSearchParams({...v,...(k?{apikey:k}:{})});const q=p.toString();return BASE_URL+ep.path+(q?\"?\"+q:\"\")}\nfunction snippet(ep,v,t){const u=fullUrl(ep,v);\n if(t===\"curl\")return ep.m===\"POST\"?`curl -X POST \"${u}\"`:`curl \"${u}\"`;\n if(t===\"js\")return `const res = await fetch(\"${u}\"${ep.m===\"POST\"?`, { method: \"POST\" }`:\"\"});\\nconst data = await res.json();\\nconsole.log(data);`;\n return `import requests\\n\\nr = requests.${ep.m.toLowerCase()}(\"${u}\")\\nprint(r.json())`}\nfunction mock(ep,v){let s=JSON.stringify(ep.res).replace(/\\{(\\w+)\\}/g,(m,k)=>k===\"BASE\"?BASE_URL:(v[k]??(ep.params.find(p=>p.n===k)||{}).ex??\"\"));return JSON.parse(s)}\n\nfunction render(){\n $(\"#cats\").innerHTML=cats.map(c=>`<button class=\"${c===cat?\"on\":\"\"}\" data-c=\"${c}\">${c}<small>${c===\"Todos\"?ENDPOINTS.length:ENDPOINTS.filter(e=>e.cat===c).length}</small></button>`).join(\"\");\n const l=ENDPOINTS.filter(e=>(cat===\"Todos\"||e.cat===cat)&&(e.title+e.path+e.desc).toLowerCase().includes(term));\n $(\"#list\").innerHTML=l.length?l.map(e=>{const i=ENDPOINTS.indexOf(e);return `<article class=\"ep\" data-e=\"${i}\">\n <button class=\"h\"><span class=\"m ${e.m}\">${e.m}</span><span class=\"path\">${e.path}</span><span class=\"d\">${e.title}</span></button>\n <div class=\"body\"><p>${e.desc}</p>\n ${e.params.length?e.params.map((p,j)=>`<div class=\"row\"><label for=\"p${i}_${j}\">${p.n}${p.req?\" <em>*</em>\":\"\"}</label><input id=\"p${i}_${j}\" data-i=\"${j}\" value=\"${esc(p.ex)}\" placeholder=\"${esc(p.ex)}\"><small>${p.d}</small></div>`).join(\"\"):`<div class=\"stat\">Sem parâmetros. Fácil demais kkkk</div>`}\n <div class=\"tabs\">${[\"curl\",\"js\",\"python\"].map((t,x)=>`<button data-t=\"${t}\" class=\"${x?\"\":\"on\"}\">${t===\"js\"?\"JavaScript\":t===\"curl\"?\"cURL\":\"Python\"}</button>`).join(\"\")}</div>\n <pre class=\"code\"></pre>\n <div class=\"act\"><button class=\"run\">Executar teste</button><button class=\"ghost cp\">Copiar código</button><span class=\"stat st\"></span></div>\n <pre class=\"out\" hidden></pre></div></article>`}).join(\"\"):`<div class=\"empty\">Nenhum endpoint encontrado. Tenta outra palavra 🔎</div>`}\n\nfunction refresh(a){const ep=ENDPOINTS[a.dataset.e];const t=a.querySelector(\".tabs .on\").dataset.t;a.querySelector(\".code\").textContent=snippet(ep,vals(a,ep),t)}\n\n$(\"#cats\").onclick=e=>{const b=e.target.closest(\"button\");if(b){cat=b.dataset.c;render()}};\n$(\"#q\").oninput=e=>{term=e.target.value.toLowerCase();render()};\n$(\"#key\").value=store.get(\"apihub_key\")||\"\";\n$(\"#key\").oninput=e=>{store.set(\"apihub_key\",e.target.value);document.querySelectorAll(\".ep.open\").forEach(refresh)};\n$(\"#list\").addEventListener(\"input\",e=>{const a=e.target.closest(\".ep\");if(a)refresh(a)});\n$(\"#list\").addEventListener(\"click\",e=>{\n const a=e.target.closest(\".ep\");if(!a)return;const ep=ENDPOINTS[a.dataset.e];\n if(e.target.closest(\".h\")){a.classList.toggle(\"open\");refresh(a)}\n else if(e.target.closest(\".tabs button\")){a.querySelectorAll(\".tabs button\").forEach(b=>b.classList.remove(\"on\"));e.target.classList.add(\"on\");refresh(a)}\n else if(e.target.closest(\".cp\")){const t=a.querySelector(\".code\").textContent;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast(\"Copiado!\"),()=>toast(\"Seleciona e copia na mão\"))}\n else if(e.target.closest(\".run\")){\n  const v=vals(a,ep),miss=ep.params.find(p=>p.req&&!v[p.n]),out=a.querySelector(\".out\"),st=a.querySelector(\".st\");\n  out.hidden=false;\n  if(miss){out.innerHTML=color({status:false,erro:`Parâmetro obrigatório ausente: ${miss.n}`});st.innerHTML=\"<b style='color:#e11d48'>400</b> Bad Request\";return}\n  st.textContent=\"Executando…\";out.textContent=\"…\";const t0=performance.now();\n  const fin=(code,j)=>{const ms=Math.round(performance.now()-t0);out.innerHTML=color(j);st.innerHTML=`<b style=\"color:${code<400?\"var(--ok)\":\"#e11d48\"}\">${code}</b> · ${ms} ms`;$(\"#sReq\").textContent=++reqs};\n  if(LIVE){fetch(fullUrl(ep,v),{method:ep.m}).then(async r=>fin(r.status,await r.json())).catch(()=>fin(500,{status:false,erro:\"Falha ao chamar a API\"}))}\n  else setTimeout(()=>fin(200,mock(ep,v)),350+Math.random()*450)}\n});\n$(\"#theme\").onclick=()=>{const r=document.documentElement,d=getComputedStyle(r).getPropertyValue(\"--bg\").trim()===\"#0f1328\";r.dataset.theme=d?\"light\":\"dark\"};\n\n/* demo digitando no hero */\nconst lines=[[\"GET /api/cep?cep=01001000\",{status:true,cidade:\"São Paulo\",uf:\"SP\"}],[\"GET /api/piada\",{status:true,piada:\"O bug não é bug, é feature kkkk\"}],[\"GET /api/clima?cidade=Recife\",{status:true,temp:\"29°C\",condicao:\"Ensolarado\"}]];\nlet li=0;async function demo(){const d=$(\"#demo\");if(matchMedia(\"(prefers-reduced-motion:reduce)\").matches){d.innerHTML=`$ ${lines[0][0]}\\n<pre style=\"background:none;padding:0\">${color(lines[0][1])}</pre>`;return}\n for(;;){const [c,r]=lines[li++%lines.length];let s=\"\";for(const ch of c){s+=ch;d.innerHTML=`$ ${esc(s)}<span class=\"caret\"></span>`;await new Promise(r=>setTimeout(r,45))}\n await new Promise(r=>setTimeout(r,400));d.innerHTML=`$ ${esc(c)}\\n<pre style=\"background:none;padding:6px 0 0\">${color(r)}</pre>`;await new Promise(r=>setTimeout(r,2600))}}\nrender();demo();\n</script>\n</body>\n</html>\n";

const PORT = process.env.PORT || 3000;
const KEYS = (process.env.API_KEYS || "").split(",").map((s) => s.trim()).filter(Boolean); // vazio = API aberta
const LIMITE = +(process.env.LIMITE_DIA || 50); // downloads por chave por dia
const MAX_DUR = +(process.env.MAX_DURACAO || 1200); // 20 min
const MAX_JOBS = +(process.env.MAX_JOBS || 1); // plano grátis tem pouca RAM
const DIR = "/tmp/akeno-files";
const TTL = 15 * 60 * 1000;
fs.mkdirSync(DIR, { recursive: true });

// cookies do YouTube (opcional): cole o conteúdo do cookies.txt na variável YT_COOKIES
let COOKIES = [];
if (process.env.YT_COOKIES) {
  fs.writeFileSync("/tmp/cookies.txt", process.env.YT_COOKIES);
  COOKIES = ["--cookies", "/tmp/cookies.txt"];
}

const uso = new Map(); // contagem diária (zera ao reiniciar)
const links = new Map(); // encurtador (zera ao reiniciar)
let jobs = 0;

const PIADAS = [
  "Por que o JSON foi ao médico? Porque estava com chave quebrada.",
  "O bug não é bug, é feature kkkk",
  "Programador não erra, ele descobre casos de teste novos.",
  "Funciona na minha máquina. Então vamos entregar a sua máquina.",
];
const FRASES = [
  "Se compilou de primeira, desconfie.",
  "Todo grande sistema começou com um console.log.",
  "Faça funcionar, faça certo, faça rápido. Nessa ordem.",
];
const WMO = { 0: "Céu limpo", 1: "Quase limpo", 2: "Parcialmente nublado", 3: "Nublado", 45: "Neblina", 61: "Chuva fraca", 63: "Chuva", 65: "Chuva forte", 80: "Pancadas de chuva", 95: "Tempestade" };

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const need = (q, ...ks) => ks.find((k) => !(q.get(k) || "").trim());
const miss = (k) => [400, { status: false, erro: `Parâmetro obrigatório ausente: ${k}` }];
const soon = () => [501, { status: false, erro: "Endpoint em desenvolvimento" }];
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const J = (res, s, o) => {
  res.writeHead(s, { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" });
  res.end(JSON.stringify(o, null, 2));
};
const getJson = async (u) => (await fetch(u)).json();
const okUrl = (u) => {
  try {
    const h = new URL(u).hostname.replace(/^(www|m)\./, "");
    return ["youtube.com", "youtu.be", "music.youtube.com"].includes(h);
  } catch { return false; }
};
const run = (args) =>
  new Promise((ok, no) =>
    execFile("yt-dlp", [...COOKIES, ...args], { timeout: 180000, maxBuffer: 20 * 1024 * 1024 }, (e, out, err) =>
      e ? no(new Error((err || e.message).split("\n").filter(Boolean).pop())) : ok(out)
    )
  );

async function yt(tipo, q, ctx) {
  const k = need(q, "url"); if (k) return miss(k);
  const url = q.get("url");
  if (!okUrl(url)) return [400, { status: false, erro: "Use um link válido do YouTube" }];
  const kk = `${ctx.key || "anon"}:${new Date().toISOString().slice(0, 10)}`;
  const n = uso.get(kk) || 0;
  if (n >= LIMITE) return [429, { status: false, erro: `Limite diário de ${LIMITE} downloads atingido` }];
  if (jobs >= MAX_JOBS) return [429, { status: false, erro: "Servidor ocupado, tente em instantes" }];
  jobs++;
  try {
    const info = JSON.parse(await run(["--no-playlist", "-j", "--skip-download", url]));
    if (info.duration > MAX_DUR) return [413, { status: false, erro: `Vídeo muito longo (máx ${fmt(MAX_DUR)})` }];
    const id = crypto.randomBytes(8).toString("hex");
    const mp3 = tipo === "mp3";
    const ql = [360, 720, 1080].includes(+q.get("qualidade")) ? +q.get("qualidade") : 720;
    const out = path.join(DIR, id + ".%(ext)s");
    await run(
      mp3
        ? ["--no-playlist", "-x", "--audio-format", "mp3", "--audio-quality", "0", "-o", out, url]
        : ["--no-playlist", "-f", `bv*[height<=${ql}]+ba/b[height<=${ql}]`, "--merge-output-format", "mp4", "-o", out, url]
    );
    uso.set(kk, n + 1);
    return [200, { status: true, titulo: info.title, canal: info.uploader, duracao: fmt(info.duration), ...(mp3 ? {} : { qualidade: ql + "p" }), download: `${ctx.origin}/files/${id}.${mp3 ? "mp3" : "mp4"}`, expira_em: "15 minutos" }];
  } catch (e) {
    return [500, { status: false, erro: "Falha ao processar o vídeo", detalhe: e.message.slice(0, 200) }];
  } finally { jobs--; }
}

const ROTAS = {
  "/api": async () => [200, { status: true, nome: "akenoapis", rotas: Object.keys(ROTAS) }],
  "/api/status": async () => [200, { status: true, nome: "akenoapis", hora: new Date().toISOString() }],
  "/api/piada": async () => [200, { status: true, piada: pick(PIADAS) }],
  "/api/frase": async () => [200, { status: true, frase: pick(FRASES) }],

  "/api/cep": async (q) => {
    const k = need(q, "cep"); if (k) return miss(k);
    const c = q.get("cep").replace(/\D/g, "");
    if (c.length !== 8) return [400, { status: false, erro: "CEP inválido (use 8 números)" }];
    const d = await getJson(`https://viacep.com.br/ws/${c}/json/`);
    if (d.erro) return [404, { status: false, erro: "CEP não encontrado" }];
    return [200, { status: true, cep: d.cep, rua: d.logradouro, bairro: d.bairro, cidade: d.localidade, uf: d.uf }];
  },
  "/api/clima": async (q) => {
    const k = need(q, "cidade"); if (k) return miss(k);
    const g = await getJson(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.get("cidade"))}&count=1&language=pt`);
    const l = g.results && g.results[0];
    if (!l) return [404, { status: false, erro: "Cidade não encontrada" }];
    const w = await getJson(`https://api.open-meteo.com/v1/forecast?latitude=${l.latitude}&longitude=${l.longitude}&current=temperature_2m,weather_code`);
    return [200, { status: true, cidade: `${l.name} - ${l.admin1 || l.country}`, temp: `${Math.round(w.current.temperature_2m)}°C`, condicao: WMO[w.current.weather_code] || "Variável" }];
  },
  "/api/wikipedia": async (q) => {
    const k = need(q, "q"); if (k) return miss(k);
    const r = await fetch(`https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q.get("q"))}`);
    if (!r.ok) return [404, { status: false, erro: "Artigo não encontrado" }];
    const d = await r.json();
    return [200, { status: true, titulo: d.title, resumo: d.extract, link: d.content_urls && d.content_urls.desktop && d.content_urls.desktop.page }];
  },
  "/api/traduzir": async (q) => {
    const k = need(q, "texto"); if (k) return miss(k);
    const para = q.get("para") || "en";
    const d = await getJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q.get("texto"))}&langpair=pt|${encodeURIComponent(para)}`);
    return [200, { status: true, original: q.get("texto"), idioma: para, traducao: d.responseData.translatedText }];
  },
  "/api/qrcode": async (q) => {
    const k = need(q, "texto"); if (k) return miss(k);
    const t = Math.min(Math.max(parseInt(q.get("tamanho")) || 256, 64), 1000);
    return [200, { status: true, tamanho: t, imagem: `https://api.qrserver.com/v1/create-qr-code/?size=${t}x${t}&data=${encodeURIComponent(q.get("texto"))}` }];
  },
  "/api/encurtar": async (q, ctx) => {
    const k = need(q, "url"); if (k) return miss(k);
    try { new URL(q.get("url")); } catch { return [400, { status: false, erro: "URL inválida" }]; }
    const code = Math.random().toString(36).slice(2, 7);
    links.set(code, q.get("url"));
    return [200, { status: true, curto: `${ctx.origin}/s/${code}` }];
  },
  "/api/youtube/mp3": async (q, ctx) => yt("mp3", q, ctx),
  "/api/youtube/mp4": async (q, ctx) => yt("mp4", q, ctx),
  "/api/tiktok": async () => soon(),
  "/api/google": async () => soon(),
  "/api/ia/imagem": async () => soon(),
};

// limpa arquivos antigos do YouTube
setInterval(() => {
  for (const f of fs.readdirSync(DIR)) {
    const p = path.join(DIR, f);
    try { if (Date.now() - fs.statSync(p).mtimeMs > TTL) fs.unlinkSync(p); } catch {}
  }
}, 60 * 1000);

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  const q = u.searchParams;
  const p = u.pathname.length > 1 ? u.pathname.replace(/\/$/, "") : u.pathname;
  const origin = `${(req.headers["x-forwarded-proto"] || "http").split(",")[0]}://${req.headers.host}`;

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "access-control-allow-origin": "*", "access-control-allow-headers": "x-api-key", "access-control-allow-methods": "GET,POST" });
    return res.end();
  }
  if (p === "/" || p === "/index.html") {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    return res.end(HTML);
  }
  if (p === "/ping") return J(res, 200, { status: true, pong: true });

  if (p.startsWith("/s/")) {
    const alvo = links.get(p.slice(3));
    if (!alvo) return J(res, 404, { status: false, erro: "Link não existe (ou expirou)" });
    res.writeHead(302, { location: alvo });
    return res.end();
  }
  if (p.startsWith("/files/")) {
    const f = path.basename(p), fp = path.join(DIR, f);
    if (!/^[a-f0-9]{16}\.(mp3|mp4)$/.test(f) || !fs.existsSync(fp)) return J(res, 404, { status: false, erro: "Arquivo expirou ou não existe" });
    res.writeHead(200, { "content-type": f.endsWith(".mp3") ? "audio/mpeg" : "video/mp4", "content-length": fs.statSync(fp).size, "content-disposition": `attachment; filename="${f}"` });
    return fs.createReadStream(fp).pipe(res);
  }
  if (p === "/api" || p.startsWith("/api/")) {
    const key = q.get("apikey") || req.headers["x-api-key"] || "";
    if (KEYS.length && !["/api", "/api/status"].includes(p) && !KEYS.includes(key))
      return J(res, 401, { status: false, erro: "apikey inválida ou ausente" });
    const rota = ROTAS[p];
    if (!rota) return J(res, 404, { status: false, erro: "Endpoint não existe" });
    try {
      const [s, corpo] = await rota(q, { key, origin });
      return J(res, s, corpo);
    } catch (e) {
      return J(res, 500, { status: false, erro: "Erro interno" });
    }
  }
  J(res, 404, { status: false, erro: "Página não encontrada" });
}).listen(PORT, () => console.log("akenoapis rodando na porta " + PORT));
