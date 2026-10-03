"use client";
import {useState} from 'react';
import {PortalHeader} from '@/components/PortalHeader';
import {MediaLibrary} from '@/components/MediaLibrary';
export function MediaPortal(){
 const [role,setRole]=useState<'parent'|'admin'|null>(null);
 return <div className="min-h-screen bg-neutral-100"><PortalHeader title="Media Library" isAdmin={role==='admin'}/><main id="portal-main" className="container py-8"><MediaLibrary privateMode onRole={setRole}/></main></div>;
}
