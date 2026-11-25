// SPDX-License-Identifier: Apache-2.0
export const fixtureHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Edynora Demo Dashboard</title>
<style>*{box-sizing:border-box}body{margin:0;background:#eef3f8;color:#152438;font:18px system-ui}header{padding:26px 48px;background:#12243a;color:white}header p{color:#b9d8ed;margin-bottom:0;font-size:16px}nav{padding:24px 48px;background:white;display:flex;gap:16px}button,select,input{font:inherit;padding:12px 20px;border-radius:8px;border:1px solid #8b9bad}button{background:#0a6275;color:white;cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid #ed9b40;outline-offset:4px}main{padding:24px 48px;max-width:1100px}section{background:white;border-radius:16px;padding:24px 32px;margin:12px 0}h1{font-size:28px;margin:0}h2{font-size:24px}label{display:inline-flex;flex-direction:column;gap:8px;margin-right:24px}ul{padding:0;list-style:none}li{padding:18px;border-bottom:1px solid #d7e1eb}.spacer{height:300px}.badge{color:#0a6275;font-weight:bold}footer{padding:24px 48px}</style></head>
<body><header><h1>Edynora Demo Dashboard</h1><p>AI Workflows. Intelligent Automation. Smarter Work.</p></header>
<nav aria-label="Main"><button id="overview">Overview</button><button id="reports">Reports</button><button id="dialog">Show dialog</button></nav>
<main><section id="home"><h2>Overview</h2><p>Automate. Demonstrate. Record. Teach.</p><p>This local dashboard uses synthetic data. Open Reports to explore your tutorial.</p><p class="badge">Ready to record</p></section>
<section id="report-panel" hidden><h2>Reports</h2><label>Filter reports<input id="filter" aria-label="Filter reports" placeholder="Search reports"></label><label>Period<select aria-label="Period"><option value="week">This week</option><option value="month">This month</option></select></label>
<ul data-testid="report-list"><li>Revenue report</li><li>Activity report</li><li>Automation report</li></ul><p role="status" id="status">3 reports available</p><button id="export">Prepare report</button></section>
<section><h2>Privacy preview</h2><p>Synthetic account: <span data-private>private-demo@example.invalid</span></p><label>Demo password<input type="password" value="synthetic-secret-never-real" aria-label="Demo password"></label></section>
<div class="spacer"></div><button id="submit">Submit test data</button><button id="disabled" disabled>Unavailable action</button></main><footer>Local fixture only. Review every recording before sharing.</footer>
<script>
document.querySelector('#reports').onclick=()=>{document.querySelector('#home').hidden=true;document.querySelector('#report-panel').hidden=false};
document.querySelector('#overview').onclick=()=>{document.querySelector('#home').hidden=false;document.querySelector('#report-panel').hidden=true};
document.querySelector('#filter').oninput=e=>{let count=0;document.querySelectorAll('[data-testid="report-list"] li').forEach(li=>{li.hidden=!li.textContent.toLowerCase().includes(e.target.value.toLowerCase());if(!li.hidden)count++});document.querySelector('#status').textContent=count+' reports available'};
document.querySelector('#export').onclick=()=>document.querySelector('#status').textContent='Report prepared for review';
document.querySelector('#dialog').onclick=()=>confirm('Synthetic demonstration dialog');
document.querySelector('#submit').onclick=async()=>{await fetch('/submit',{method:'POST',body:'synthetic demo'});document.querySelector('#status').textContent='Submitted'};
</script></body></html>`;
