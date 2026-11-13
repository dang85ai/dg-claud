"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, ShieldCheck, ExternalLink, Home, Users, CalendarDays, ClipboardList, BookOpenCheck, Shirt, Package, SlidersHorizontal, Camera, Heart, Wallet, Car, UserRound, Megaphone, MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ApprovedPageBanner, type ApprovedBannerId } from "@/components/ApprovedPageBanner";

type Item = { label: string; href: string; external?: boolean; icon: typeof Home };
type Group = { heading: string; items: Item[] };
const parentGroups: Group[] = [
 { heading: "Team", items: [
  {label:"Dashboard",href:"/portal",icon:Home},
  {label:"My Players",href:"/portal/players",icon:Users},
  {label:"Team Schedule",href:"/portal/schedule",icon:CalendarDays},
  {label:"Schedule & Attendance",href:"/portal/activity/attendance",icon:CalendarDays},
  {label:"Training",href:"/portal/training",icon:BookOpenCheck}
 ]},
 { heading: "Family Tools", items: [
  {label:"Parent Tools",href:"/portal/tools",icon:ClipboardList},
  {label:"Forms & Consent",href:"/portal/tools#consent",icon:ClipboardList},
  {label:"Signed Forms",href:"/portal/activity/forms",icon:ClipboardList},
  {label:"Code of Conduct Sign-Off",href:"/portal/conduct",icon:ClipboardList},
  {label:"My Account",href:"/portal/activity/account",icon:UserRound},
  {label:"Kit & Payments",href:"/portal/activity/payments",icon:Wallet},
  {label:"Team Budget & Accounts",href:"/portal/finances",icon:Wallet},
  {label:"Team Kit",href:"/kit",icon:Shirt},
  {label:"Kit Request",href:"/order",icon:Package}
 ]},
 { heading: "Team Community", items: [
  {label:"Photos",href:"/portal/media",icon:Camera},
  {label:"Game Duties",href:"/portal/activity/duties",icon:ClipboardList},
  {label:"Carpool",href:"/portal/activity/carpool",icon:Car},
  {label:"Recognition",href:"/portal/activity/sisterhood",icon:Heart},
  {label:"Spond",href:"https://spond.com/client",external:true,icon:ExternalLink}
 ]}
];
const managerGroups: Group[] = [
 {heading:"Team Operations",items:[
  {label:"Dashboard",href:"/admin",icon:Home},
  {label:"Team Operations",href:"/admin/operations",icon:SlidersHorizontal},
  {label:"Player Administration",href:"/admin/players",icon:Users},
  {label:"Field & Formation",href:"/admin/formation",icon:ClipboardList},
  {label:"Spond",href:"/admin/spond",icon:CalendarDays},
  {label:"Schedule",href:"/admin/modules/schedule",icon:CalendarDays},
  {label:"Attendance",href:"/admin/modules/attendance",icon:ClipboardList},
  {label:"Game Duties",href:"/admin/modules/duties",icon:ClipboardList},
  {label:"Equipment",href:"/admin/modules/equipment",icon:Package},
  {label:"Referees",href:"/admin/modules/referees",icon:Users}
 ]},
 {heading:"Families & Accounts",items:[
  {label:"Family Links",href:"/admin/families",icon:Users},
  {label:"Accounts & Invites",href:"/admin/accounts",icon:UserRound},
  {label:"Parent Tools",href:"/portal/tools",icon:ClipboardList},
  {label:"Forms",href:"/admin/modules/forms",icon:ClipboardList},
  {label:"Conduct Sign-Offs",href:"/admin/conduct",icon:ClipboardList},
  {label:"Payments",href:"/admin/modules/payments",icon:Wallet},
  {label:"Team Budget & Accounts",href:"/admin/finances",icon:Wallet},
  {label:"Kit Orders",href:"/admin/modules/orders",icon:Package}
 ]},
 {heading:"Community & Kit",items:[
  {label:"Sponsors",href:"/admin/sponsors",icon:Heart},
  {label:"Media Library",href:"/admin/media",icon:Camera},
  {label:"Sisterhood",href:"/admin/modules/sisterhood",icon:Heart},
  {label:"Announcements",href:"/admin/modules/announcements",icon:Megaphone},
  {label:"Team Kit",href:"/kit",icon:Shirt},
  {label:"Kit Request",href:"/order",icon:Package}
 ]},
 {heading:"Administration",items:[
  {label:"Management Tools",href:"/admin/manage",icon:SlidersHorizontal},
  {label:"Email Notifications",href:"/admin/notifications",icon:MailCheck},
  {label:"Team Settings",href:"/admin/modules/settings",icon:SlidersHorizontal},
  {label:"Data Export",href:"/admin/manage#export",icon:ClipboardList}
 ]}
];


const pageBanners: Partial<Record<string,ApprovedBannerId>> = {
 "/portal":"parent-portal",
 "/portal/players":"roster",
 "/portal/schedule":"schedule",
 "/portal/training":"training",
 "/portal/tools":"parent-portal",
 "/portal/conduct":"conduct",
 "/portal/finances":"finance",
 "/portal/media":"media",
 "/portal/activity/media":"media",
 "/admin/players":"roster",
 "/admin/formation":"roster",
 "/admin/finances":"finance",
 "/admin/media":"media",
 "/admin/modules/media":"media",
 "/admin/sponsors":"sponsors",
 "/admin/conduct":"conduct"
};

export function PortalHeader({ title, isAdmin = false }: { title: string; isAdmin?: boolean }) {
 const router = useRouter(), pathname = usePathname(), drawer = useRef<HTMLDialogElement>(null);
 const [roles,setRoles]=useState<string[]>([]),[accessChecked,setAccessChecked]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{
  let live=true;
  async function readAccess(){
   const user=await supabase.auth.getUser();
   if(!live)return;
   if(user.error||!user.data.user){setRoles([]);setAccessChecked(true);return;}
   const data=await supabase.from("user_roles").select("role").eq("user_id",user.data.user.id);
   if(live){setRoles(data.error?[]:(data.data||[]).map(x=>x.role));setAccessChecked(true);}
  }
  void readAccess();
  const {data:subscription}=supabase.auth.onAuthStateChange(()=>{void readAccess();});
  return ()=>{live=false;subscription.subscription.unsubscribe();};
 },[]);
 useEffect(()=>{if(drawer.current?.open)drawer.current.close();},[pathname]);
 const manager=roles.some(r=>r==="admin"||r==="manager");
 const showManagement=isAdmin&&manager;
 const groups=showManagement?managerGroups:parentGroups;
 async function signOut(){
  setError("");
  const result=await supabase.auth.signOut();
  if(result.error){setError("Unable to sign out. Try again.");return;}
  setRoles([]);drawer.current?.close();router.replace("/login");
 }
 function active(href:string){
  const path=href.split("#")[0];
  return path===pathname||(path!=="/portal"&&path!=="/admin"&&pathname.startsWith(path+"/"));
 }
 function renderGroups(){
  return <>
   {groups.map(group=><section key={group.heading} className="mb-6">
    <h2 className="px-3 pb-2 text-[11px] font-black uppercase tracking-[.16em] text-neutral-500">{group.heading}</h2>
    <div className="grid gap-1">{group.items.map(({label,href,external,icon:Icon})=>{
     const cls="portal-nav-item "+(active(href)?"portal-nav-item-current":"");
     return external
      ?<a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={()=>drawer.current?.close()}><Icon size={17} aria-hidden="true"/>{label}<ExternalLink size={13} aria-hidden="true" className="ml-auto"/></a>
      :<Link key={href} href={href} aria-current={active(href)?"page":undefined} className={cls} onClick={()=>drawer.current?.close()}><Icon size={17} aria-hidden="true"/>{label}</Link>;
    })}</div>
   </section>)}
   {manager&&<div className="border-t pt-4">
    <Link href={isAdmin?"/portal":"/admin"} onClick={()=>drawer.current?.close()} className="portal-nav-item">
      <ShieldCheck size={17}/>{isAdmin?"Switch to Parent Portal":"Switch to Management"}
    </Link>
   </div>}
  </>;
 }
 const selectedBanner = pageBanners[pathname];
 return <>
 <header className="portal-header sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-sm">
  <a className="sr-only focus:not-sr-only focus:block focus:p-3" href="#portal-main">Skip to portal content</a>
  <div className="container flex min-h-20 items-center justify-between gap-3 py-3">
   <div className="flex min-w-0 items-center gap-3">
    <button type="button" className="portal-menu-button btn btn-light !p-3" aria-label="Open portal navigation" aria-expanded={Boolean(drawer.current?.open)}
      onClick={()=>drawer.current?.showModal()}><Menu size={20}/></button>
    <div className="min-w-0"><p className="text-xs font-black uppercase tracking-wide text-red-600">{isAdmin?"Team Management":"Family Portal"}</p>
     <div className="mt-1 truncate text-lg font-black">{title}</div></div>
   </div>
   <div className="flex shrink-0 items-center gap-2">
    {isAdmin?<span className="hidden items-center gap-1 text-xs font-bold text-neutral-600 md:flex"><ShieldCheck size={15}/> MFA protected</span>:null}
    <Link href="/" className="btn btn-light !px-3 text-xs sm:text-sm">Team Site</Link>
    <button type="button" onClick={()=>void signOut()} className="btn btn-dark !px-3 text-xs sm:text-sm"><LogOut size={17}/><span className="hidden sm:inline">Sign Out</span></button>
   </div>
  </div>
  <aside aria-label={isAdmin?"Management sidebar":"Parent sidebar"} className="portal-sidebar">
   {accessChecked&&(!isAdmin||manager)?renderGroups():<p className="p-3 text-sm text-neutral-500">Management access requires a verified team account.</p>}
  </aside>
  <dialog ref={drawer} className="portal-drawer" aria-label="Team portal navigation" onClick={event=>{if(event.target===drawer.current)drawer.current?.close();}}>
   <div className="mb-5 flex items-center justify-between"><h2 className="font-black uppercase">{isAdmin?"Management":"Family"} Menu</h2>
    <button className="btn btn-light !p-2" aria-label="Close navigation" onClick={()=>drawer.current?.close()}><X size={20}/></button></div>
   {accessChecked&&(!isAdmin||manager)?renderGroups():<p className="text-sm text-neutral-600">Sign in with your team account to access navigation.</p>}
  </dialog>
  {error?<p role="alert" className="container pb-3 text-sm text-red-700">{error}</p>:null}
 </header>
 <ApprovedPageBanner
   banner={selectedBanner || "parent-portal"}
   portal
   titleOverride={title}
   subtitleOverride={isAdmin ? "Team Management · Secure Workspace" : "Family Portal · Team Resources"}
   neutralBackground={isAdmin && !selectedBanner}
 />
 </>;
}
