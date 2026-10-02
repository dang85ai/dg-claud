"use client";
import Link from "next/link";
import {useRef} from "react";
import {CalendarDays,Home,Menu,Shield,Users,X} from "lucide-react";
export function MobileNav(){
 const menu=useRef<HTMLDialogElement>(null);
 return <><nav className="mobile-bottom-nav" aria-label="Quick mobile navigation">{[{href:"/",label:"Home",Icon:Home},{href:"/schedule",label:"Schedule",Icon:CalendarDays},{href:"/roster",label:"Team",Icon:Users},{href:"/login",label:"Portal",Icon:Shield}].map(({href,label,Icon})=><Link key={href} href={href}><span className="grid place-items-center gap-1"><Icon size={19} aria-hidden="true"/>{label}</span></Link>)}<button className="grid place-items-center text-white" onClick={()=>menu.current?.showModal()} aria-label="More pages"><span className="grid place-items-center gap-1 text-xs font-bold"><Menu size={19}/>More</span></button></nav><dialog ref={menu} className="public-more-menu" aria-label="More team pages"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">Explore the team</h2><button className="btn btn-light !px-3" aria-label="Close more pages" onClick={()=>menu.current?.close()}><X size={20}/></button></div><nav className="mt-4 grid gap-2" aria-label="More pages">{[["/kit","Team Kit"],["/media","Photos"],["/parents","Parent Resources"],["/game-day","Game Day"],["/development","Development"],["/sponsors","Sponsors"],["/about","About"],["/contact","Contact"],["/faq","FAQ"]].map(([href,label])=><Link className="rounded-xl bg-neutral-100 p-3 font-bold" key={href} href={href} onClick={()=>menu.current?.close()}>{label}</Link>)}</nav></dialog></>;
}

