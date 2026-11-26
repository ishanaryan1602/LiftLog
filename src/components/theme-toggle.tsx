"use client";
import { useEffect, useState } from "react";

function SunIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3.5"/><path strokeLinecap="round" d="M12 2.5v2M12 19.5v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2.5 12h2M19.5 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42"/></svg>;
}

function MoonIcon() {
  return <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20.5 15.2A8.5 8.5 0 0 1 8.8 3.5 8.5 8.5 0 1 0 20.5 15.2Z"/></svg>;
}

export function ThemeToggle(){
  const [light,setLight]=useState(false);

  useEffect(()=>{
    const saved=localStorage.getItem("form-mode");
    const next=saved?saved==="light":false;
    setLight(next);
    document.documentElement.classList.toggle("light",next);
  },[]);

  function toggle(){
    const next=!light;
    setLight(next);
    document.documentElement.classList.toggle("light",next);
    localStorage.setItem("form-mode",next?"light":"dark");
  }

  return <button type="button" onClick={toggle} aria-label={`Switch to ${light?"dark":"light"} mode`} className="inline-flex h-9 items-center gap-2 rounded-md border border-line bg-panel px-3 text-sm text-ink shadow-sm transition-colors hover:border-purple hover:bg-purple/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-panel">
    {light?<SunIcon/>:<MoonIcon/>}
    <span>{light?"Light":"Dark"}</span>
  </button>;
}
