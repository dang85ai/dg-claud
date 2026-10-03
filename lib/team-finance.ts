export type BudgetLine = {id:string;category:string;label:string;quantity:number;unit_cents:number;planned_cents:number;sort_order:number;updated_at:string};
export type Transaction = {id:string;occurred_on:string;kind:"income"|"expense"|"expense_refund"|"income_refund";description:string;amount_cents:number;budget_line_id:string|null;created_at:string;voided_at:string|null;void_reason:string|null};
export type FinanceSettings = {id:string;season:string;currency:string;source:string;opening_cents:number|null;opening_date:string|null;updated_at:string};
export type FinanceDocument = {id:string;kind:"receipt"|"statement";title:string;storage_path:string;transaction_id:string|null;period_start:string|null;period_end:string|null;closing_cents:number|null;shared:boolean;redaction_confirmed:boolean;created_at:string};
export const money = (cents:number)=>new Intl.NumberFormat("en-CA",{style:"currency",currency:"CAD"}).format(cents/100);
export function parseCents(value:string,allowNegative=false):number {
 if(!/^-?\d+(\.\d{1,2})?$/.test(value.trim())||(!allowNegative&&value.trim().startsWith("-")))throw new Error("Enter a dollar amount with at most two decimal places.");
 const cents=Math.round(Number(value)*100);
 if(!Number.isSafeInteger(cents)||Math.abs(cents)>100000000)throw new Error("Amount must be within $1,000,000.");
 return cents;
}
export const kindLabels={income:"Money received",expense:"Expense",expense_refund:"Expense refund",income_refund:"Money returned"};
export const cashMovement=(t:Transaction)=>["income","expense_refund"].includes(t.kind)?Number(t.amount_cents):-Number(t.amount_cents);
export function financeTotals(lines:BudgetLine[],transactions:Transaction[],settings:FinanceSettings){
 const live=transactions.filter(t=>!t.voided_at);
 const planned=lines.reduce((s,l)=>s+Number(l.planned_cents),0);
 const spent=live.reduce((s,t)=>s+(t.kind==="expense"?Number(t.amount_cents):t.kind==="expense_refund"?-Number(t.amount_cents):0),0);
 const received=live.reduce((s,t)=>s+(t.kind==="income"?Number(t.amount_cents):t.kind==="income_refund"?-Number(t.amount_cents):0),0);
 const balance=settings.opening_cents===null||!settings.opening_date?null:Number(settings.opening_cents)+live.filter(t=>t.occurred_on>=settings.opening_date!).reduce((s,t)=>s+cashMovement(t),0);
 return {planned,spent,received,remaining:planned-spent,balance};
}
export function statementDifference(doc:FinanceDocument,transactions:Transaction[],settings:FinanceSettings){
 if(doc.kind!=="statement"||doc.closing_cents===null||!doc.period_end||settings.opening_cents===null||!settings.opening_date||doc.period_end<settings.opening_date)return null;
 const expected=Number(settings.opening_cents)+transactions.filter(t=>!t.voided_at&&t.occurred_on>=settings.opening_date!&&t.occurred_on<=doc.period_end!).reduce((s,t)=>s+cashMovement(t),0);
 return Number(doc.closing_cents)-expected;
}
export function budgetSpent(lineId:string,transactions:Transaction[]){return transactions.filter(t=>!t.voided_at&&t.budget_line_id===lineId).reduce((s,t)=>s+(t.kind==="expense"?Number(t.amount_cents):t.kind==="expense_refund"?-Number(t.amount_cents):0),0);}
export function csvCell(value:unknown){const text=String(value??"");return '"'+(/^[=+\-@\t\r]/.test(text)?"'":"")+text.replaceAll('"','""')+'"';}
