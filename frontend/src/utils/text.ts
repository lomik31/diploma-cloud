export function trim(input?: string | null, limit = 100): string {
    const s = (input ?? "").trim();
    if (s.length <= limit) return s;
    const cut = s.slice(0, limit);
    // const soft = cut.replace(/\s+\S*$/, "");
    return (cut).trimEnd() + "…";
}
