const formatter=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Toronto",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"});
export function teamTimeInput(value:string){const parts=Object.fromEntries(formatter.formatToParts(new Date(value)).map(p=>[p.type,p.value]));return parts.year+"-"+parts.month+"-"+parts.day+"T"+parts.hour+":"+parts.minute;}
export function teamTimeIso(value:string){
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))throw new Error("Enter a valid date and time in Toronto time.");
 const [year,month,day,hour,minute]=value.split(/[-T:]/).map(Number);const wall=Date.UTC(year,month-1,day,hour,minute);let instant=wall;
 for(let i=0;i<3;i++){const shown=teamTimeInput(new Date(instant).toISOString());const [y,m,d,h,min]=shown.split(/[-T:]/).map(Number);const offset=Date.UTC(y,m-1,d,h,min)-instant;instant=wall-offset;}
 const result=new Date(instant).toISOString();if(teamTimeInput(result)!==value)throw new Error("This Toronto time does not exist because the clocks change. Choose another time.");return result;
}

