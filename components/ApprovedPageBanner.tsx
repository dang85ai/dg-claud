import Image from "next/image";

export type ApprovedBannerId =
  | "home" | "parent-portal" | "roster" | "schedule" | "training" | "kit"
  | "sponsors" | "conduct" | "media" | "finance" | "about" | "contact";

const artwork: Record<ApprovedBannerId,{ title:string; sub:string; width:number; height:number }> = {
  home: {title:"Caledon United FC",sub:"U9 Girls 2018",width:1506,height:246},
  "parent-portal": {title:"Parent Portal",sub:"Team · Information · Resources",width:1482,height:246},
  roster: {title:"Team Roster",sub:"Meet the Team",width:1506,height:244},
  schedule: {title:"Schedule",sub:"Practices · Games · Events",width:1482,height:244},
  training: {title:"Training & Development",sub:"Skills · Growth · Game IQ",width:1506,height:216},
  kit: {title:"Team Kit",sub:"Uniforms · Apparel · Accessories",width:1482,height:216},
  sponsors: {title:"Sponsors",sub:"Support Our Team",width:1506,height:206},
  conduct: {title:"Code of Conduct",sub:"Respect · Inclusion · Zero Bullying",width:1482,height:206},
  media: {title:"Media",sub:"Photos · Videos · Highlights",width:1506,height:224},
  finance: {title:"Team Budget & Accounts",sub:"Budget · Payments · Transparency",width:1482,height:224},
  about: {title:"Our Team",sub:"Coaches · Staff · Our Club",width:1506,height:234},
  contact: {title:"Contact",sub:"Get in Touch",width:1482,height:234}
};

/**
 * The desktop art is cropped directly from the user-approved banner board.
 * Mobile rebuilds the same crest/title over the right-hand part of that art,
 * rather than shrinking the baked-in lettering below readability.
 * Using this in private pages never sends player information to an image API.
 */
export function ApprovedPageBanner({
  banner, heading, description, portal = false, asHeading = false
}:{
  banner:ApprovedBannerId; heading?:string; description?:string;
  portal?:boolean; asHeading?:boolean;
}){
  const item=artwork[banner];
  const src="/assets/banners/2026-27/"+banner+".webp";
  return (
    <section
      aria-label={item.title+" · 2026–27 approved banner"}
      className={"approved-page-banner relative border-b border-neutral-700 bg-[#0b0c10] "+(portal?"approved-page-banner--portal":"")}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="hidden sm:block" aria-hidden="true">
          <Image src={src} width={item.width} height={item.height}
            alt="" unoptimized priority={banner==="home"} sizes="(min-width: 1600px) 1500px, 100vw"
            className="block h-auto w-full" />
        </div>
        <div className="relative flex min-h-44 items-center overflow-hidden px-5 py-7 text-white sm:hidden"
          style={{
            backgroundImage:"linear-gradient(90deg, rgba(4,5,8,.98) 0%, rgba(6,7,11,.88) 54%, rgba(6,7,11,.42) 100%), url('"+src+"')",
            backgroundSize:"cover",backgroundPosition:"right center"
          }} aria-hidden="true">
          <div className="relative z-10 flex items-center gap-4">
            <Image src="/assets/brand/caledon-united-crest.webp" alt="" width={66} height={66}
              className="h-14 w-14 shrink-0 rounded-full bg-white object-contain ring-2 ring-[#d71930]" unoptimized />
            <div className="min-w-0 border-l border-white/40 pl-4">
              <div className="text-xl font-black uppercase leading-tight tracking-tight">{item.title}</div>
              <div className="mt-2 text-[10px] font-bold uppercase tracking-[.12em] text-white/80">{item.sub}</div>
            </div>
          </div>
        </div>
      </div>
      {asHeading?<h1 className="sr-only">{heading||item.title}</h1>:null}
      {description?<p className="sr-only">{description}</p>:null}
    </section>
  );
}
