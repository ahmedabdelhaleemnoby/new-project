import type { Locale } from "@/i18n/config";

// Local catalogue from the Ajyad Thermotech product catalogue (public/catalogue/ajyad-catalogue.pdf), used when the
// content API has no data (see src/lib/content.ts). Technical values are copied as printed in the catalogue.
export type SpecSection = { name: string; rows: [string, string][] };
export type Product = {
  slug: string; name: string; category: "Shaped" | "Unshaped"; short: string; description: string; grades: string[]; image: string;
  datasheet?: { label: string; url: string };
  applications?: string[];
  /** Technical data table from the catalogue. */
  specs?: { title: string; sections: SpecSection[] };
};
export type Industry = { name: string; slug: string; text: string; icon: string };

type ProductText = Pick<Product, "name" | "short" | "description" | "applications">;
type IndustryText = Pick<Industry, "name" | "text">;

/** The full catalogue; each product's datasheet is its page, split into its own PDF. */
export const CATALOGUE_PDF = "/catalogue/ajyad-catalogue.pdf";
const sheet = (slug: string) => `/catalogue/${slug}.pdf`;

type Base = Pick<Product, "slug" | "category" | "grades" | "image"> & { grade: string | null; specs?: Record<Locale, SpecSection[]> };

// Spec labels and text values per language.
const L = {
  en: { chem: "Chemical properties", phys: "Physical properties", grain: "Grain size, mm", bonding: "Type of bonding", method: "Method of application", maxTemp: "Max service temperature, °C", refract: "Refractoriness, °C", grainDensity: "Grain density, g/cm³", bulkDensity: "Bulk density, g/cm³", expiry: "Expiration", moisture: "Moisture", chemical: "Chemical", ceramic: "Ceramic", coldRamming: "Cold ramming", hotRepair: "Hot repair", dryRamming: "Dry ramming", ramming: "Ramming", anySize: "Any size", months: "12 months", application: "Application" },
  ar: { chem: "الخواص الكيميائية", phys: "الخواص الفيزيائية", grain: "حجم الحبيبات، مم", bonding: "نوع الترابط", method: "طريقة التطبيق", maxTemp: "أقصى درجة حرارة تشغيل، °م", refract: "مقاومة الحرارة، °م", grainDensity: "كثافة الحبيبات، جم/سم³", bulkDensity: "الكثافة الظاهرية، جم/سم³", expiry: "مدة الصلاحية", moisture: "الرطوبة", chemical: "كيميائي", ceramic: "سيراميكي", coldRamming: "دك على البارد", hotRepair: "إصلاح على الساخن", dryRamming: "دك جاف", ramming: "دك", anySize: "أي حجم", months: "12 شهرًا", application: "التطبيق" },
};
const both = (build: (l: (typeof L)["en"]) => SpecSection[]): Record<Locale, SpecSection[]> => ({ en: build(L.en), ar: build(L.ar) });

const productBase: Base[] = [
  { slug: "ebt-olivine-sand", category: "Unshaped", grade: "EBT Olivine Sand", grades: ["EBT Olivine Sand"], image: "/images/catalogue/olivine-sand.jpg",
    specs: both(l => [{ name: l.chem, rows: [["MgO", "47–50 %"], ["CaO", "0.5–1 %"], ["SiO₂", "39 %"], ["Fe₂O₃", "6–10 %"]] }, { name: l.phys, rows: [[l.bonding, l.chemical], [l.grain, "2–6"]] }]) },
  { slug: "dry-backfill-mixes", category: "Unshaped", grade: "Dry Backfill Mix", grades: ["Dry Backfill Mix"], image: "/images/catalogue/backfill.jpg",
    specs: both(l => [{ name: l.chem, rows: [["MgO", "90 %"], ["CaO", "3–5 %"], ["SiO₂", "5 %"], ["Fe₂O₃", "1–3 %"]] }, { name: l.phys, rows: [[l.bonding, l.chemical], [l.grain, "0–3"], [l.refract, "1610"], [l.maxTemp, "1560"]] }]) },
  { slug: "silica-ramming-mass", category: "Unshaped", grade: "Silica Ramming Mass", grades: ["Silica Ramming Mass"], image: "/images/catalogue/silica-ramming.jpg",
    specs: both(l => [{ name: l.chem, rows: [[l.moisture, "≥ 0.10 %"], ["SiO₂", "98.00 %"], ["Fe₂O₃", "≥ 0.01 %"], ["H₃BO₃", "≥ 1.30 %"]] }, { name: l.phys, rows: [[l.application, l.dryRamming], [l.method, l.ramming], [l.maxTemp, "1715"], [l.grain, l.anySize]] }]) },
  { slug: "hearth-ramming-mass", category: "Unshaped", grade: "ProRam-G", grades: ["ProRam-G"], image: "/images/catalogue/hearth.jpg",
    specs: both(l => [{ name: l.chem, rows: [["MgO", "80–85 %"], ["SiO₂", "1–2 %"], ["Fe₂O₃", "1.5 %"], ["Al₂O₃", "0.8 %"], ["CaO", "15 %"]] }, { name: l.phys, rows: [[l.grain, "0–8"], [l.method, l.coldRamming], [l.maxTemp, "1750"], [l.grainDensity, "3.20"], [l.bonding, l.ceramic], [l.expiry, l.months]] }]) },
  { slug: "hot-fettling-mass", category: "Unshaped", grade: "PT1700-85L", grades: ["PT1700-85L"], image: "/images/catalogue/ladle-glow.jpg",
    specs: both(l => [{ name: l.chem, rows: [["MgO", "80–85 %"], ["SiO₂", "1–2 %"], ["Fe₂O₃", "1.5 %"], ["Al₂O₃", "0.8 %"], ["CaO", "5–10 %"]] }, { name: l.phys, rows: [[l.grain, "0–8"], [l.method, l.hotRepair], [l.maxTemp, "1750"], [l.grainDensity, "3.20"], [l.bonding, l.ceramic], [l.expiry, l.months]] }]) },
  { slug: "hot-gunning-mass", category: "Unshaped", grade: "MgPT-90H", grades: ["MgPT-90H"], image: "/images/catalogue/furnace-slag.jpg",
    specs: both(l => [{ name: l.chem, rows: [["MgO", "88–92 %"], ["SiO₂", "3.5 %"], ["Fe₂O₃", "1.5 %"], ["Al₂O₃", "0.8 %"], ["CaO", "2.5 %"]] }, { name: l.phys, rows: [[l.grain, "0–3"], [l.method, l.hotRepair], [l.maxTemp, "1750"], [l.bulkDensity, "2.50"], [l.bonding, l.ceramic], [l.expiry, l.months]] }]) },
  { slug: "tundish-spray-mass", category: "Unshaped", grade: "PT5001-HM", grades: ["PT5001-HM"], image: "/images/catalogue/tundish.jpg",
    specs: both(l => [{ name: l.chem, rows: [["MgO", "90.0 %"], ["CaO", "3.0 %"], ["Fe₂O₃", "1.5 %"], ["SiO₂", "5.0 %"]] }, { name: l.phys, rows: [[l.grain, "0–0.5"], [l.bulkDensity, "1.4–1.7"], [l.expiry, l.months]] }]) },
  { slug: "blast-furnace-monolithics", category: "Unshaped", grade: null, grades: [], image: "/images/catalogue/blast-furnace.jpg" },
  { slug: "pre-shaped-castables", category: "Shaped", grade: null, grades: [], image: "/images/catalogue/preshaped.jpg" },
];

const productText: Record<Locale, Record<string, ProductText>> = {
  en: {
    "ebt-olivine-sand": { name: "EBT olivine sand", short: "Olivine filling sand for eccentric bottom tapping.", description: "Olivine sand combines a high melting point and sintering temperature with low heat loss and good resistance to thermal shock. It is used across refractory and steel production, most often to fill the EBT taphole of electric arc furnaces.", applications: ["Filling the EBT taphole of electric arc furnaces", "Producing tundish cover", "Producing magnesia-chrome and low-magnesia bricks", "Covering the back wall of AOD converters"] },
    "dry-backfill-mixes": { name: "Dry backfill mixes", short: "Dry lining mixes that stop infiltration behind the safety lining.", description: "High-quality magnesia- or alumina-based dry lining mixes with a ceramic bond. They are simply poured between the brick rings and the safety lining while the wall is bricked, with no further preparation, preventing metal infiltration and run-out behind the lining." },
    "silica-ramming-mass": { name: "Silica ramming mass", short: "Acidic ramming mass for induction furnace linings.", description: "A high-purity silica mass for lining induction furnaces. Its grading is matched to each furnace’s make and capacity, and magnetic separation removes free iron. With fewer binders, less fireclay and less moisture than plastic masses, it gives a thermally stable, corrosion- and wear-resistant lining, reaching 17–18 heats per lining in typical operation." },
    "hearth-ramming-mass": { name: "Hearth ramming mass", short: "Magnesia mass for the bottom of electric arc furnaces.", description: "A magnesia-based mass applied by cold ramming. On heating it forms a strong ceramic bond that withstands impact, wear and abrasion at the bottom of the electric arc furnace at temperatures up to 1750 °C." },
    "hot-fettling-mass": { name: "Hot fettling mass", short: "Magnesia fettling for hot repair of the EAF hearth.", description: "A magnesia-based monolithic applied hot with a fettling machine to cover the sloped banks and repair the hearth ramming mass at the bottom of the electric arc furnace. It is chemically adjusted to form a ceramic bond while heating up, and graded to spray easily." },
    "hot-gunning-mass": { name: "Hot gunning mass", short: "Magnesia gunning mix for hot repair of EAF walls.", description: "A magnesia gunning mass with special binders that give it the stickiness needed for hot repairs, sealing leaks and cracks in the walls of the electric arc furnace." },
    "tundish-spray-mass": { name: "Tundish spray mass", short: "Magnesia working lining sprayed onto the tundish.", description: "A magnesia-based material graded below 1 mm and sprayed as the working lining of the tundish, protecting it during casting and making it easier to clean afterwards." },
    "blast-furnace-monolithics": { name: "Blast furnace monolithics", short: "Monolithic refractories for blast furnace operation and repair.", description: "The blast furnace uses more monolithic refractories in continuous operation than any other stage of steel production, from taphole mixes and runner masses to preshapes for skimmers and tilting troughs. Hot metal ladles also vary widely between plants, so we supply individual solutions, including highly adhesive mortars for insulation and maintenance mixes.", applications: ["Gunning mixes", "Taphole mixes", "Castables", "Mortar", "Preshapes"] },
    "pre-shaped-castables": { name: "Pre-shaped castables", short: "Precast refractory shapes for the molten steel flow system.", description: "Special refractory shapes designed and made for the flow system of molten steel. Each is formulated to resist severe abrasion from flowing steel and attack by slag, then cast and carefully dried to reach its full properties. We have wide experience in producing and fabricating these shapes." },
  },
  ar: {
    "ebt-olivine-sand": { name: "رمل الأوليفين لفتحة الصب EBT", short: "رمل أوليفين لملء فتحة الصب السفلية اللامركزية.", description: "يجمع رمل الأوليفين بين ارتفاع درجة الانصهار والتلبيد وانخفاض الفقد الحراري ومقاومة جيدة للصدمات الحرارية، لذلك يُستخدم في صناعتي المواد الحرارية والصلب، وأكثر استخداماته ملء فتحة الصب EBT في أفران القوس الكهربائي.", applications: ["ملء فتحة الصب EBT في أفران القوس الكهربائي", "إنتاج غطاء التنديش", "إنتاج طوب الماغنسيا-كروم والطوب منخفض الماغنسيا", "تغطية الجدار الخلفي في محولات AOD"] },
    "dry-backfill-mixes": { name: "خلطات الردم الجافة", short: "خلطات تبطين جافة تمنع التسرب خلف بطانة الأمان.", description: "خلطات تبطين جافة عالية الجودة أساسها الماغنسيا أو الألومينا وتترابط سيراميكيًا. تُصب مباشرة بين حلقات الطوب وبطانة الأمان أثناء بناء الجدار دون أي تجهيز إضافي، فتمنع تسرب المعدن وجريانه خلف البطانة." },
    "silica-ramming-mass": { name: "كتلة الدك السيليكا", short: "كتلة دك حمضية لتبطين أفران الحث.", description: "كتلة سيليكا عالية النقاء لتبطين أفران الحث، يُضبط تدرج حبيباتها وفق طراز الفرن وسعته، ويُزال الحديد الحر منها بالفصل المغناطيسي. ولأنها تحتوي على مواد رابطة وطين ناري ورطوبة أقل من الكتل اللدنة، فهي تمنح بطانة مستقرة حراريًا ومقاومة للتآكل والبري، وتصل إلى 17–18 صبة للبطانة في التشغيل المعتاد." },
    "hearth-ramming-mass": { name: "كتلة دك قاع الفرن", short: "كتلة ماغنسيا لقاع أفران القوس الكهربائي.", description: "كتلة أساسها الماغنسيا تُطبق بالدك على البارد، وعند التسخين تكوّن ترابطًا سيراميكيًا قويًا يتحمل الصدم والتآكل والبري في قاع فرن القوس الكهربائي حتى 1750 °م." },
    "hot-fettling-mass": { name: "كتلة الترميم على الساخن", short: "ماغنسيا لإصلاح قاع فرن القوس الكهربائي وهو ساخن.", description: "مادة مونوليثية أساسها الماغنسيا تُرش على الساخن بماكينة الترميم لتغطية الجوانب المائلة وإصلاح كتلة دك القاع في فرن القوس الكهربائي. تركيبها معدّل كيميائيًا لتكوين ترابط سيراميكي أثناء التسخين، وتدرج حبيباتها يسهّل رشها." },
    "hot-gunning-mass": { name: "كتلة الرش على الساخن", short: "خلطة ماغنسيا لإصلاح جدران الفرن وهو ساخن.", description: "كتلة رش أساسها الماغنسيا مع مواد رابطة خاصة تمنحها قابلية الالتصاق اللازمة للإصلاح على الساخن، لسد التسريبات والشقوق في جدران فرن القوس الكهربائي." },
    "tundish-spray-mass": { name: "كتلة رش التنديش", short: "بطانة عمل من الماغنسيا تُرش على التنديش.", description: "مادة أساسها الماغنسيا بحبيبات أقل من 1 مم، تُرش كبطانة عمل للتنديش لحمايته أثناء الصب وتسهيل تنظيفه بعد ذلك." },
    "blast-furnace-monolithics": { name: "مونوليثيات الفرن العالي", short: "مواد حرارية مونوليثية لتشغيل الفرن العالي وإصلاحه.", description: "يستهلك الفرن العالي من المواد الحرارية المونوليثية في التشغيل المستمر أكثر من أي مرحلة أخرى في إنتاج الصلب، من خلطات فتحة الصب وكتل المجاري إلى القطع الجاهزة للكاشطات والمجاري المائلة. وتختلف بواتق نقل الحديد الزهر كثيرًا من مصنع لآخر، لذلك نقدم حلولًا خاصة بكل مصنع، منها مونة عالية الالتصاق للعزل وخلطات الصيانة.", applications: ["خلطات الرش", "خلطات فتحة الصب", "الخرسانات الحرارية", "المونة", "القطع الجاهزة"] },
    "pre-shaped-castables": { name: "الخرسانات مسبقة التشكيل", short: "قطع حرارية مصبوبة مسبقًا لنظام تدفق الصلب المنصهر.", description: "أشكال حرارية خاصة مصممة ومصنعة لنظام تدفق الصلب المنصهر. تُركّب كل قطعة كيميائيًا لمقاومة البري الشديد من الصلب المتدفق وهجوم الخبث، ثم تُصب وتُجفف بعناية لتصل إلى كامل خواصها. ولدينا خبرة واسعة في إنتاج هذه القطع وتصنيعها." },
  },
};

const industryBase: Omit<Industry, keyof IndustryText>[] = [
  { slug: "iron-steel", icon: "steel" },
  { slug: "cement-lime", icon: "cement" },
  { slug: "glass-ceramics", icon: "glass" },
  { slug: "aluminium", icon: "aluminium" },
  { slug: "chemicals", icon: "chemical" },
  { slug: "power", icon: "power" },
];

const industryText: Record<Locale, Record<string, IndustryText>> = {
  en: {
    "iron-steel": { name: "Iron & steel", text: "Refractory and insulation solutions for steel production and casting." },
    "cement-lime": { name: "Cement & lime", text: "Refractory material selection for demanding kiln operations." },
    "glass-ceramics": { name: "Glass & ceramics", text: "Materials for thermal processes in glass and ceramic manufacturing." },
    aluminium: { name: "Aluminium & non-ferrous", text: "Refractory solutions developed around metal processing requirements." },
    chemicals: { name: "Chemicals & petrochemicals", text: "Application-led solutions for industrial processing environments." },
    power: { name: "Power & other industries", text: "Serving power generation, sugar, coke ovens, and refractory manufacturing." },
  },
  ar: {
    "iron-steel": { name: "الحديد والصلب", text: "حلول حرارية وعازلة لإنتاج الصلب وعمليات الصب." },
    "cement-lime": { name: "الأسمنت والجير", text: "اختيار المواد الحرارية لعمليات الأفران الأكثر تطلبًا." },
    "glass-ceramics": { name: "الزجاج والسيراميك", text: "مواد للعمليات الحرارية في صناعة الزجاج والسيراميك." },
    aluminium: { name: "الألومنيوم والمعادن غير الحديدية", text: "حلول حرارية مطوّرة وفق متطلبات معالجة المعادن." },
    chemicals: { name: "الكيماويات والبتروكيماويات", text: "حلول تناسب التطبيق لبيئات المعالجة الصناعية." },
    power: { name: "الطاقة وصناعات أخرى", text: "نخدم توليد الطاقة وصناعة السكر وأفران الكوك وصناعة المواد الحرارية." },
  },
};

export function localProducts(lang: Locale): Product[] {
  return productBase.map(({ grade, specs, ...base }) => {
    const text = productText[lang][base.slug];
    const label = lang === "ar" ? `النشرة الفنية — ${text.name}` : `${text.name} technical datasheet`;
    return {
      ...base,
      ...text,
      datasheet: { label, url: sheet(base.slug) },
      ...(specs ? { specs: { title: grade ?? text.name, sections: specs[lang] } } : {}),
    };
  });
}
export const localIndustries = (lang: Locale): Industry[] => industryBase.map(i => ({ ...i, ...industryText[lang][i.slug] }));
