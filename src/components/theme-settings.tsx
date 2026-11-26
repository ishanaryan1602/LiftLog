"use client";
import { useEffect, useState } from "react";

const fonts=[{id:"system",label:"System"},{id:"inter",label:"Inter"},{id:"mono",label:"Mono"}] as const;
type FontId=typeof fonts[number]["id"];
const modes=["light","dark","system"] as const;
type Mode=typeof modes[number];

function applyMode(mode:Mode){const light=mode==="light"||(mode==="system"&&window.matchMedia("(prefers-color-scheme: light)").matches);document.documentElement.classList.toggle("light",light);document.documentElement.style.colorScheme=light?"light":"dark"}

export function ThemeSettings(){
  const [mode,setMode]=useState<Mode>("dark");
  const [font,setFont]=useState<FontId>("system");
  const [hydrated,setHydrated]=useState(false);
  useEffect(()=>{const savedMode=localStorage.getItem("form-mode");const nextMode=modes.includes(savedMode as Mode)?savedMode as Mode:"dark";const savedFont=localStorage.getItem("form-font");const nextFont=fonts.some((option)=>option.id===savedFont)?savedFont as FontId:"system";setMode(nextMode);setFont(nextFont);applyMode(nextMode);localStorage.setItem("form-accent","purple");document.documentElement.dataset.accent="purple";document.documentElement.dataset.font=nextFont;setHydrated(true);if(nextMode==="system"){const media=window.matchMedia("(prefers-color-scheme: light)");const sync=()=>applyMode("system");media.addEventListener("change",sync);return()=>media.removeEventListener("change",sync)}},[]);
  function chooseMode(next:Mode){setMode(next);localStorage.setItem("form-mode",next);applyMode(next)}
  function chooseFont(id:FontId){setFont(id);document.documentElement.dataset.font=id;localStorage.setItem("form-font",id)}
  const modeIndex=modes.indexOf(mode);
  return <div className={`w-full transition-opacity ${hydrated?"opacity-100":"pointer-events-none opacity-0"}`}><div className="stagger">
    <div><div className="relative mt-3 grid grid-cols-3 pb-2">
      {modes.map((option)=><button type="button" key={option} onClick={()=>chooseMode(option)} className={`rounded-xl border-0 bg-transparent p-2 text-center transition ${mode===option?"text-ink":"text-muted hover:text-ink"}`}>
        <span className={`mx-auto flex h-8 w-16 flex-col gap-0.5 overflow-hidden rounded-md border border-line p-1 ${option==="light"?"bg-white":"bg-zinc-800"}`}><span className={`block h-0.5 w-2/5 rounded-full ${option==="light"?"bg-zinc-300":"bg-zinc-600"}`}/><span className={`block h-0.5 w-4/5 rounded-full ${option==="light"?"bg-zinc-200":"bg-zinc-700"}`}/><span className={`block h-0.5 w-3/5 rounded-full ${option==="light"?"bg-zinc-200":"bg-zinc-700"}`}/><span className={`mt-auto block h-1 w-2/5 rounded-full ${option==="system"?"bg-gradient-to-r from-white to-zinc-700":"bg-purple"}`}/></span>
        <span className="mt-1 block text-xs capitalize text-muted">{option}</span>
      </button>)}
      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 h-1 w-[13px] rounded-full bg-purple transition-[left] duration-300 ease-out" style={{left:`${(modeIndex+0.5)*33.333}%`,transform:"translateX(-50%)"}} />
    </div></div>
    <div className="mt-8">
    <div className="relative mt-3 grid grid-cols-3 pb-2">
      {fonts.map((option)=><button type="button" key={option.id} aria-pressed={font===option.id} onClick={()=>chooseFont(option.id)} className={`rounded-xl border-0 bg-transparent p-2 text-center transition ${font===option.id?"text-ink":"text-muted hover:text-ink"}`}><span className="block text-lg" style={{fontFamily:option.id==="mono"?"ui-monospace, SFMono-Regular, Menlo, monospace":option.id==="inter"?"Inter, ui-sans-serif, sans-serif":"ui-sans-serif, system-ui, sans-serif"}}>Aa</span><span className="mt-1 block text-xs">{option.label}</span></button>)}
      <span aria-hidden="true" className="pointer-events-none absolute bottom-0 h-1 w-[13px] rounded-full bg-purple transition-[left] duration-300 ease-out" style={{left:`${(fonts.findIndex((option)=>option.id===font)+0.5)*33.333}%`,transform:"translateX(-50%)"}} />
    </div>
  </div></div>
  </div>;
}
