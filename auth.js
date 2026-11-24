(function(){
"use strict";
var cfg=window.KITTEN_CONFIG||{};
var panel=document.getElementById("loginPanel"), shell=document.getElementById("appShell"), form=document.getElementById("loginForm"), err=document.getElementById("loginError");
if(!window.supabase||!cfg.supabaseUrl||!cfg.supabaseKey){panel.hidden=true;shell.hidden=false;window.MIO_AUTH_READY=Promise.resolve();return;}
var client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseKey);
window.MIO_SUPABASE=client;
window.MIO_AUTH_READY=new Promise(function(resolve){
 function show(session){if(session&&session.access_token){window.MIO_AUTH_TOKEN=session.access_token;panel.hidden=true;shell.hidden=false;resolve();}else{window.MIO_AUTH_TOKEN="";shell.hidden=true;panel.hidden=false;}}
 client.auth.getSession().then(function(r){show(r.data.session);});
 client.auth.onAuthStateChange(function(event,session){if(session){window.MIO_AUTH_TOKEN=session.access_token;panel.hidden=true;shell.hidden=false;resolve();}else{window.MIO_AUTH_TOKEN="";shell.hidden=true;panel.hidden=false;}});
});
form.addEventListener("submit",async function(e){e.preventDefault();err.textContent="Signing in…";var r=await client.auth.signInWithPassword({email:document.getElementById("loginEmail").value.trim(),password:document.getElementById("loginPassword").value});if(r.error){err.textContent="Sign-in failed. Check the email and password.";return;}window.MIO_AUTH_TOKEN=r.data.session.access_token;panel.hidden=true;shell.hidden=false;});
})();