/**
 * Constrain a post-auth redirect to a same-origin relative path so a crafted
 * `?redirect=` can't bounce users to another site. Falls back to the dashboard.
 */
export function safeRedirect(target: string | null | undefined): string {
  if (!target) return "/dashboard";
  // Must be a rooted path, not protocol-relative ("//evil.com") or a scheme.
  if (!target.startsWith("/") || target.startsWith("//")) return "/dashboard";
  if (target.startsWith("/\\")) return "/dashboard";
  return target;
}
