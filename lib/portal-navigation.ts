import { managementModules } from "@/lib/management-modules";
export const familyLinks = [
 {label:"Overview",href:"/portal"},
 {label:"My Players",href:"/portal/players"},
 {label:"Schedule & Attendance",href:"/portal/activity/attendance"},
 {label:"Forms & Consent",href:"/portal/tools#consent"},
 {label:"Signed Forms",href:"/portal/activity/forms"},
 {label:"Photos",href:"/portal/activity/media"},
 {label:"Game Duties",href:"/portal/activity/duties"},
 {label:"Carpool",href:"/portal/activity/carpool"},
 {label:"Recognition",href:"/portal/activity/sisterhood"},
 {label:"Kit & Payments",href:"/portal/activity/payments"},
 {label:"My Account",href:"/portal/activity/account"}
];
export function navigationForRoles(roles:string[]){
 const manager=roles.some(r=>r==="admin"||r==="manager");
 const team=manager||roles.some(r=>r==="parent_player"||r==="photographer");
 return {family:team?familyLinks:[],management:manager?[{label:"Dashboard",href:"/admin"},...managementModules]:[]};
}
export function activePortalLink(href:string,pathname:string,hash=""){
 const [path,fragment]=href.split("#");
 return path===pathname && (!fragment || "#"+fragment===hash);
}
