"use client";
import Link from 'next/link';
export function ChildLinkRequest({accountId}:{accountId:string}){return <section className="card mt-6 p-6" id="my-children"><h2 className="text-2xl font-black uppercase">My Players</h2><p className="mt-3 text-sm text-neutral-600">Request a verified link to your child, track manager approval and manage linked player details in My Players.</p><Link href="/portal/players" className="btn btn-primary mt-4">Add My Child / My Players</Link></section>;}
