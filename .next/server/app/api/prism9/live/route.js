(()=>{var e={};e.id=2751,e.ids=[2751],e.modules={846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},4870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},9294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},3033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},7115:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>y,routeModule:()=>p,serverHooks:()=>m,workAsyncStorage:()=>u,workUnitAsyncStorage:()=>h});var i={};r.r(i),r.d(i,{POST:()=>d});var s=r(2706),a=r(8203),n=r(5994),o=r(9187);let c=process.env.ANTHROPIC_API_KEY??"",l=`You are a biomedical knowledge graph expert powering a FastScience! Prism9 visualisation tool.

Given any biological topic, disease, gene, pathway, or concept, produce a causal graph structured into exactly four layers:

NORMAL — The healthy biological system before any disease or disruption.
  • Describe normal physiology only. No reference to disease, disorder, or therapy.
  • Include key proteins, pathways, cells, and regulatory mechanisms.

DYSFUNCTION — How the disease or condition disrupts normal function.
  • Show the causal chain of breakdown: what fails, what it causes, what cascades.
  • Named the disease clearly. Be mechanistic and specific.

FIX — Therapy pathways and treatment strategies.
  • Specific named drugs, procedures, gene therapies, or interventions.
  • Include confidence (0.0–1.0) and mechanism for each node.

COPE — Strategies for living with or managing the condition.
  • Quality of life, rehabilitation, adaptive strategies, support, lifestyle.
  • No therapy targets — this is about living well, not curing.

Return ONLY valid JSON in this exact schema (no markdown, no backticks, no commentary):

{
  "subject": "<canonical subject name>",
  "prism9": {
    "normal": {
      "title": "<title>",
      "summary": "<2–3 sentences describing the healthy system>",
      "nodes": [
        { "id": "n1", "label": "<entity name>", "definition": "<one clear sentence>", "role": "<physiological role>" }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    },
    "dysfunction": {
      "title": "<disease or condition name>",
      "summary": "<2–3 sentences on how the system fails>",
      "nodes": [
        { "id": "d1", "label": "<entity name>", "definition": "<one clear sentence>", "role": "<dysfunction role>" }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    },
    "fix": {
      "title": "Therapy Pathways",
      "summary": "<2–3 sentences on treatment approach>",
      "nodes": [
        { "id": "f1", "label": "<therapy / drug>", "definition": "<one clear sentence>", "role": "<mechanism>", "confidence": 0.0 }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    },
    "cope": {
      "title": "Living with <subject>",
      "summary": "<2–3 sentences on quality of life>",
      "nodes": [
        { "id": "c1", "label": "<strategy or resource>", "definition": "<one clear sentence>", "role": "<category>" }
      ],
      "edges": [
        { "from": "<id>", "to": "<id>", "relation": "<active verb phrase>" }
      ]
    }
  }
}

Rules:
• 4–9 nodes per layer; 2–8 edges per layer.
• Use real biomedical entities and accurate current knowledge.
• Edge "from"/"to" must match node ids within the same layer.
• Keep definitions concise — one sentence only.
• Output pure JSON, nothing else.`;async function d(e){let t=await e.json().catch(()=>({})),r=String(t?.keyword??"").trim();if(!r)return o.NextResponse.json({ok:!1,error:"keyword required"},{status:400});if(!c)return o.NextResponse.json({ok:!1,error:"LLM not configured"},{status:503});try{let e;let t=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"x-api-key":c,"anthropic-version":"2023-06-01","content-type":"application/json"},body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:4096,system:l,messages:[{role:"user",content:`Build a Prism9 causal graph for: ${r}`}]}),signal:AbortSignal.timeout(45e3)});if(!t.ok){let e=await t.text();throw Error(`Anthropic ${t.status}: ${e.slice(0,200)}`)}let i=await t.json(),s=i?.content?.[0]?.text??"";try{e=JSON.parse(s)}catch{let t=s.match(/\{[\s\S]*\}/);if(!t)throw Error("LLM did not return parseable JSON");e=JSON.parse(t[0])}return o.NextResponse.json({ok:!0,...e})}catch(t){let e=t instanceof Error?t.message:String(t);return console.error("[prism9/live]",e),o.NextResponse.json({ok:!1,error:e},{status:503})}}let p=new s.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/prism9/live/route",pathname:"/api/prism9/live",filename:"route",bundlePath:"app/api/prism9/live/route"},resolvedPagePath:"/opt/jewel/kwikbio-web/app/api/prism9/live/route.ts",nextConfigOutput:"",userland:i}),{workAsyncStorage:u,workUnitAsyncStorage:h,serverHooks:m}=p;function y(){return(0,n.patchFetch)({workAsyncStorage:u,workUnitAsyncStorage:h})}},6487:()=>{},8335:()=>{}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),i=t.X(0,[5994,5452],()=>r(7115));module.exports=i})();