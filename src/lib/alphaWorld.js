const endpoint = import.meta.env.VITE_SHADOW_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SHADOW_SUPABASE_PUBLISHABLE_KEY;
async function read(path, accessToken) {
  if (!endpoint || !publishableKey || !accessToken) throw new Error("Sign in to Alpha first.");
  const response = await fetch(endpoint + path, {
    headers: { apikey: publishableKey, Authorization: "Bearer " + accessToken },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || "World request failed");
  return payload;
}
export const readAlphaBases = (token, worldId) =>
  read("/rest/v1/ss_world_members?world_id=eq." + encodeURIComponent(worldId) + "&select=user_id,x,y,level", token);
export const readAlphaTroops = (token, worldId) =>
  read("/rest/v1/ss_troop_stacks?world_id=eq." + encodeURIComponent(worldId) + "&select=unit_type,available,wounded", token);
