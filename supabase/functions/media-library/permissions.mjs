export class MediaError extends Error {
  constructor(message, status = 403) { super(message); this.status = status; }
}
export function actorFromRoles(id, roles, aal) {
  if (!id) throw new MediaError('Please sign in.', 401);
  const admin = roles.some(r => ['admin', 'manager'].includes(r));
  if (admin && aal !== 'aal2') throw new MediaError('Complete multi-factor authentication first.', 403);
  if (!admin && !roles.some(r => ['parent_player', 'photographer'].includes(r))) throw new MediaError('Team access is required.');
  return { id, role: admin ? 'admin' : 'parent', admin };
}
export function canEditAlbum(actor, album) { return !!actor && !album.deleted_at && (actor.admin || album.created_by === actor.id); }
export function canEditPhoto(actor, photo) { return !!actor && !photo.deleted_at && (actor.admin || photo.uploader_id === actor.id); }
export function requireAdmin(actor) { if (!actor.admin) throw new MediaError('Only admins can organize photos or manage sharing.'); }
export function canContribute(actor, album, shared = false) {
  return !album.deleted_at && (actor.admin || album.created_by === actor.id || (album.allow_contributions && shared));
}
export function requirePhotoOwner(actor, photo) { if (!canEditPhoto(actor, photo)) throw new MediaError('You can only change your own uploads.'); }
export function requireAlbumOwner(actor, album) { if (!canEditAlbum(actor, album)) throw new MediaError('You can only change your own albums.'); }
export function validatePatch(input, allowed) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new MediaError('Invalid request.', 400);
  for (const key of Object.keys(input)) if (!allowed.includes(key)) throw new MediaError('This field cannot be changed: ' + key, 400);
}
export function ids(value) {
  if (!Array.isArray(value) || !value.length || value.length > 200 || new Set(value).size !== value.length || value.some(v => !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v))) throw new MediaError('Select 1–200 distinct photos.', 400);
  return value;
}
