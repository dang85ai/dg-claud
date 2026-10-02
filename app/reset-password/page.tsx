"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
import {AuthShell} from "@/components/AuthShell";
import {supabase} from "@/lib/supabase";
export default function ResetPasswordPage(){
 const [busy,setBusy]=useState(false),[sent,setSent]=useState(false),[error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setError("");try{const result=await supabase.auth.resetPasswordForEmail(String(form.get("email")).trim().toLowerCase(),{redirectTo:window.location.origin+"/auth/finish"});if(result.error)throw result.error;setSent(true);}catch{setError("The reset request could not be sent. Please wait a moment and retry, or contact the team manager.");}finally{setBusy(false);}}
 return <AuthShell eyebrow="Parent account" title="Reset your password">{sent?<p role="status" className="notice">If an account exists for that email, you’ll receive a password reset link. Check your inbox and spam folder. Use the latest link.</p>:<form onSubmit={submit}><p className="mb-5 text-sm text-neutral-600">Enter the email used for your team account.</p><label className="field-label" htmlFor="reset-email">Email</label><input id="reset-email" name="email" type="email" autoComplete="email" className="field" required/><button className="btn btn-primary mt-5" disabled={busy}>{busy?"Requesting…":"Send password reset link"}</button></form>}{error?<p className="notice mt-5" role="alert">{error}</p>:null}<Link href="/login" className="mt-6 block text-sm font-bold underline">Back to sign in</Link></AuthShell>;
}

