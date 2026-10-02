"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { LogOut,ShieldCheck } from "lucide-react";
import { usePathname,useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { activePortalLink,navigationForRoles } from "@/lib/portal-navigation";
export function PortalHeader({title,isAdmin=false}:{title:string;isAdmin?:boolean}){
 const router=useRouter(), pathname=usePathname();
 const [roles,setRoles]=useState<string[]>([]);
 const [hash,setHash]=useState("");
 const [error,setError]=useState("");
 useEffect(()=>{
   let live=true;
   async function load(){
     const {data,error}=await supabase.auth.getUser();
     if(error||!data.user){if(live)setRoles([]);return;}
     const result=await supabase.from("user_roles").select("role").eq("user_id",data.user.id);
     if(live)setRoles(result.error?[]:(result.data??[]).map(r=>r.role));
   }
   void load();
   const {data}=supabase.auth.onAuthStateChange(()=>{void load();});
   const change=()=>setHash(window.location.hash);change();window.addEventListener("hashchange",change);
   return()=>{live=false;data.subscription.unsubscribe();window.removeEventListener("hashchange",change);};
 },[]);
 const navigation=navigationForRoles(roles);
 async function signOut(){setError("");const result=await supabase.auth.signOut();if(result.error){setError("Unable to sign out. Please retry.");return;}setRoles([]);router.replace("/login");}
 function links(items:Array<{label:string;href:string}>){return items.map(item=><Link key={item.href} href={item.href} aria-current={activePortalLink(item.href,pathname,hash)?"page":undefined} className={"shrink-0 rounded-xl px-3 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600 "+(activePortalLink(item.href,pathname,hash)?"bg-red-600 text-white":"bg-neutral-100 text-neutral-800 hover:bg-neutral-200")}>{item.label}</Link>);}
 return <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 shadow-sm backdrop-blur">
 <a href="#portal-main" className="sr-only focus:not-sr-only focus:block focus:p-3">Skip to portal content</a>
 <div className="container flex min-h-18 flex-wrap items-center justify-between gap-3 py-3">
 <div><div className="text-xs font-black uppercase tracking-[.16em] text-red-600">{isAdmin?"Command Centre":"Private Team Portal"}</div><div className="mt-1 text-lg font-black uppercase">{title}</div></div>
 <div className="flex flex-wrap items-center gap-2">{navigation.management.length?<Link href={isAdmin?"/portal":"/admin"} className="btn btn-light !min-h-11 !px-4 text-sm">{isAdmin?"Family Portal":"Manager Dashboard"}</Link>:null}
 {isAdmin?<span className="hidden items-center gap-2 rounded-full bg-black px-3 py-2 text-xs font-bold text-white sm:flex"><ShieldCheck size={15}/>MFA Protected</span>:null}
 <Link href="/" className="btn btn-light !min-h-11 !px-4 text-sm">Team Site</Link><button onClick={()=>void signOut()} className="btn btn-dark !min-h-11 !px-4 text-sm"><LogOut size={16}/><span>Sign Out</span></button></div></div>
 {navigation.family.length?<nav aria-label="Family portal" className="container flex gap-2 overflow-x-auto pb-3">{links(navigation.family)}</nav>:null}
 {navigation.management.length?<details className="container pb-3" open={isAdmin?true:undefined}><summary className="cursor-pointer py-2 text-sm font-black">Management options</summary><nav aria-label="Manager portal" className="flex gap-2 overflow-x-auto py-1">{links(navigation.management)}</nav></details>:null}
 {error?<p role="alert" className="container pb-3 text-red-700">{error}</p>:null}
 </header>;
}
