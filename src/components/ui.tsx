"use client";
import { Footprints, Settings2 } from "lucide-react";
export function Button({children,type="button",...props}:{children:React.ReactNode;type?:"button"|"submit"}&React.ButtonHTMLAttributes<HTMLButtonElement>){return <button type={type} {...props}>{children}</button>}
export function Input(props:React.InputHTMLAttributes<HTMLInputElement>){return <input {...props} />}
export function Textarea(props:React.TextareaHTMLAttributes<HTMLTextAreaElement>){return <textarea {...props} />}
export function Card({children,id}:{children:React.ReactNode;id?:string}) { return <section id={id}>{children}</section> }
export function Badge({children}:{children:React.ReactNode;tone?:"neutral"|"positive"|"caution"|"negative"}) { return <span>{children}</span> }
export function PageHeader({title,description,actions,icon}:{eyebrow?:string;title:React.ReactNode;description?:string;actions?:React.ReactNode;compact?:boolean;icon?:"training"|"settings"}) { const icons = { training: Footprints, settings: Settings2 }; const Icon = icon ? icons[icon] : null; return <header><div><h1>{Icon&&<Icon strokeWidth={1.7} aria-hidden="true" />}{title}</h1>{(description||actions)&&<div>{description&&<p>{description}</p>}{actions&&<div>{actions}</div>}</div>}</div></header> }
