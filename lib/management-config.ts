export type Field = { key: string; label: string; type?: "text" | "number" | "checkbox"; required?: boolean; options?: string[]; source?: string };
export type Section = { title: string; table: string; columns: string; order: string; fields?: Field[]; action?: string; createLabel?: string; secondary?: boolean };
export type ModuleConfig = { title: string; description: string; sections: Section[] };
const player = { key: "player_id", label: "Player", source: "players", required: true };
const event = { key: "event_id", label: "Event", source: "events", required: true };
export const moduleConfigs: Record<string, ModuleConfig> = {
  players:{title:"Players",description:"Manage private squad records. Changing a player here does not grant public-profile or photo consent.",sections:[
 {title:"Players",table:"players",columns:"id,first_name,last_name,jersey_number,position,active,created_at",order:"created_at",action:"player.create",createLabel:"Add Player",fields:[{key:"first_name",label:"First name",required:true},{key:"last_name",label:"Last name",required:true},{key:"jersey_number",label:"Jersey number",type:"number"},{key:"position",label:"Position"}]}
 ]},
 schedule:{title:"Schedule",description:"Create and edit team events. Enter date/time with a timezone, for example 2026-10-06T18:00:00-04:00.",sections:[
 {title:"Events",table:"events",columns:"id,event_type,title,starts_at,ends_at,arrival_at,venue_name,venue_address,opponent,uniform,notes,status,public_visible,created_at",order:"starts_at",action:"event.create",createLabel:"Add Event",fields:[{key:"title",label:"Title",required:true},{key:"event_type",label:"Event type",options:["practice","game","team_event"],required:true},{key:"starts_at",label:"Start date/time including timezone",required:true},{key:"ends_at",label:"End date/time including timezone"},{key:"arrival_at",label:"Arrival date/time including timezone"},{key:"opponent",label:"Opponent"},{key:"venue_name",label:"Venue"},{key:"venue_address",label:"Venue address"},{key:"uniform",label:"Kit"},{key:"notes",label:"Notes"},{key:"status",label:"Status",options:["scheduled","cancelled","completed"],required:true},{key:"public_visible",label:"Show publicly when public access is enabled",type:"checkbox"}]}
 ]},
 announcements:{title:"Announcements",description:"Create and edit announcements for the private team or public site.",sections:[
 {title:"Announcements",table:"announcements",columns:"id,title,body,visibility,pinned,published_at,expires_at,created_at",order:"published_at",action:"announcement.create",createLabel:"Post Announcement",fields:[{key:"title",label:"Title",required:true},{key:"body",label:"Message",required:true},{key:"visibility",label:"Visibility",options:["team","public"],required:true},{key:"pinned",label:"Pin announcement",type:"checkbox"}]}
 ]},

  attendance: { title: "Attendance", description: "Review responses and record attendance for a player and event.", sections: [
    { title: "Attendance Records", table: "attendance", columns: "event_id,player_id,status,note,updated_at", order: "updated_at", action: "attendance.set", createLabel: "Save Attendance", fields: [event, player, { key: "status", label: "Attendance", options: ["unknown","attending","not_attending","maybe"], required: true }, { key: "note", label: "Note" }] }
  ] },
  duties: { title: "Game Duties", description: "Create event duties and review family claims.", sections: [
    { title: "Event Duties", table: "event_duties", columns: "id,event_id,duty_type,instructions,is_claimed,created_at,duty_claims(id)", order: "created_at", createLabel: "Add Duty", fields: [event, { key:"duty_type",label:"Duty",required:true }, { key:"instructions",label:"Instructions" }] },
    { title: "Claimed Duties", table: "duty_claims", columns:"id,duty_id,guardian_id,claimed_at",order:"claimed_at",secondary:true }
  ] },
  forms: { title: "Forms", description: "Review signed forms and download their PDFs. Final form wording must be approved by the club before launch.", sections: [
    { title:"Signed Forms",table:"form_submissions",columns:"id,form_template_id,player_id,guardian_id,signature_name,signed_at",order:"signed_at" },
    { title:"Form Templates",table:"form_templates",columns:"id,title,form_key,version,active,description",order:"created_at",secondary:true }
  ] },
  payments: { title: "Payments", description: "Review recorded payments and update kit order payment status after checking the payment. These controls do not charge, refund or transfer money.", sections: [
    { title:"Kit Payment Status",table:"kit_orders",columns:"id,player_id,guardian_id,total_cad,payment_status,ordered_at",order:"ordered_at" },
    { title:"Payment Records",table:"payments",columns:"id,order_id,provider,amount_cad,status,paid_at,created_at",order:"created_at",secondary:true }
  ] },
  orders: { title:"Kit Orders",description:"Review submitted kit orders, sizes and payment status. Ordering and payment-provider checkout are not enabled in this preview.",sections:[
    { title:"Orders",table:"kit_orders",columns:"id,player_id,guardian_id,total_cad,payment_status,ordered_at",order:"ordered_at" },
    { title:"Order Items",table:"kit_order_items",columns:"id,order_id,item_name,size,quantity",order:"id",secondary:true }
  ]},
  media:{title:"Media Review",description:"View private uploaded images before reviewing them. Approval here keeps images inside the private team portal.",sections:[
    {title:"Media",table:"media_items",columns:"id,media_type,caption,status,visibility,processed_private_path,processed_public_path,thumbnail_path,exif_stripped,consent_reviewed,created_at",order:"created_at"}
  ]},
  sisterhood:{title:"Sisterhood",description:"Review teammate recognition before it appears in the private portal.",sections:[
    {title:"Recognition Posts",table:"sisterhood_posts",columns:"id,player_id,category,body,status,created_at",order:"created_at"}
  ]},
  equipment:{title:"Equipment",description:"Track team equipment, issue items and record returns.",sections:[
    {title:"Inventory",table:"equipment",columns:"id,item_name,asset_tag,description,status,created_at",order:"created_at",action:"equipment.create",createLabel:"Add Equipment",fields:[{key:"item_name",label:"Item",required:true},{key:"asset_tag",label:"Asset tag"},{key:"description",label:"Description"}]},
    {title:"Assignments",table:"equipment_assignments",columns:"id,equipment_id,player_id,assigned_to_text,issued_at,returned_at,note",order:"issued_at",action:"equipment.assign",createLabel:"Issue Equipment",fields:[{key:"equipment_id",label:"Available equipment",source:"availableEquipment",required:true},{...player,required:false},{key:"assigned_to_text",label:"Recipient name"},{key:"note",label:"Note"}]}
  ]},
  referees:{title:"Referees",description:"Assign a referee to an event and track confirmation.",sections:[
    {title:"Referee Assignments",table:"referee_assignments",columns:"id,event_id,guardian_id,display_label,role_label,confirmed,created_at",order:"created_at",action:"referee.assign",createLabel:"Assign Referee",fields:[event,{key:"display_label",label:"Referee name",required:true},{key:"role_label",label:"Role",required:true},{key:"confirmed",label:"Confirmed",type:"checkbox"}]}
  ]},
  settings:{title:"Settings",description:"Review team settings and manage optional recognition features. Site publishing is controlled separately.",sections:[
    {title:"Team Settings",table:"site_settings",columns:"key,value,updated_at",order:"key"},
    {title:"Team Links",table:"team_links",columns:"id,label,description,enabled",order:"sort_order",secondary:true}
  ]}
};
