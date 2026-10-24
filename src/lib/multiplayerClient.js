// Opt-in read-only multiplayer transport. No secret keys or authoritative writes in browser.
const url = import.meta.env.VITE_SHADOW_SUPABASE_URL;
const key = import.meta.env.VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY;
export const multiplayerConfigured = Boolean(url && key);
export async function readWorldMembers(accessToken, worldId) {
  if (!multiplayerConfigured) throw new Error("Multiplayer backend is not configured.");
  if (!accessToken) throw new Error("Sign in with a server account first.");
  const response = await fetch(`${url}/rest/v1/ss_world_members?world_id=eq.${encodeURIComponent(worldId)}&select=user_id,x,y,level,updated_at`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`World request failed (${response.status})`);
  return response.json();
}
