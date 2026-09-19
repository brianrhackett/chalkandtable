export function canManageLeague(role: string): boolean {
	return ["owner", "admin"].includes(role);
}