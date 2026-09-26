// Navigation menu types. The menus come from the content API (src/lib/content.ts); without it, the
// products menu lists the local product families and the sectors menu links to the sectors page.
export type Datasheet = { label: string; url: string };
export type MenuFamily = { slug: string; name: string; category: "Shaped" | "Unshaped"; groups: { name: string | null; sheets: Datasheet[] }[] };
