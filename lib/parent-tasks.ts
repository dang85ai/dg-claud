type Player={id:string;first_name:string};
type Event={id:string;starts_at:string;status?:string|null};
type Attendance={event_id:string;player_id:string;status:string};
export function parentTasks(data:{players:Player[];events:Event[];attendance:Attendance[];kit_orders:Array<{payment_status:string}>},now=Date.now()){
 const upcoming=data.events.filter(e=>e.status!=="cancelled"&&Date.parse(e.starts_at)>=now&&Date.parse(e.starts_at)<=now+7*86400000);
 const replies=upcoming.flatMap(e=>data.players.filter(p=>!data.attendance.some(a=>a.event_id===e.id&&a.player_id===p.id&&a.status!=="unknown")));
 return {attendanceReplies:replies.length,unlinked:data.players.length===0,ordersToReview:data.kit_orders.filter(o=>["unpaid","partial"].includes(o.payment_status)).length,nextEvent:data.events.filter(e=>e.status!=="cancelled"&&Date.parse(e.starts_at)>=now).sort((a,b)=>Date.parse(a.starts_at)-Date.parse(b.starts_at))[0]};
}

