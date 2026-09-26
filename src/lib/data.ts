import type { Locale } from "@/i18n/config";

// Local catalogue, used when the content API has no data (see src/lib/content.ts).
// TODO: add Ajyad's grade names and datasheet links; the product pages hide these sections while empty.
export type Product = {
  slug: string; name: string; category: "Shaped" | "Unshaped"; short: string; description: string; grades: string[]; image: string; datasheet?: { label: string; url: string };
};
export type Industry = { name: string; slug: string; text: string; icon: string };

type ProductText = Pick<Product, "name" | "short" | "description">;
type IndustryText = Pick<Industry, "name" | "text">;

const productBase: Omit<Product, keyof ProductText>[] = [
  { slug: "lightweight-bricks", category: "Shaped", grades: [], image: "/images/production.jpg" },
  { slug: "dense-alumina-bricks", category: "Shaped", grades: [], image: "/images/production.jpg" },
  { slug: "cordierite-mullite-bricks", category: "Shaped", grades: [], image: "/images/kiln.jpg" },
  { slug: "chemical-bond-bricks", category: "Shaped", grades: [], image: "/images/production.jpg" },
  { slug: "acid-resistant-bricks", category: "Shaped", grades: [], image: "/images/kiln.jpg" },
  { slug: "castables", category: "Unshaped", grades: [], image: "/images/about.jpg" },
  { slug: "mortars", category: "Unshaped", grades: [], image: "/images/about.jpg" },
  { slug: "chamotte", category: "Unshaped", grades: [], image: "/images/hero.jpg" },
  { slug: "calcined-bauxite", category: "Unshaped", grades: [], image: "/images/about.jpg" },
];

const productText: Record<Locale, Record<string, ProductText>> = {
  en: {
    "lightweight-bricks": { name: "Lightweight bricks", short: "Insulation for demanding thermal environments.", description: "A range of insulating refractory bricks for applications where thermal insulation and low weight are priorities. Discuss your operating conditions with our team to select the appropriate grade." },
    "dense-alumina-bricks": { name: "Dense alumina bricks", short: "Fireclay and high-alumina refractory solutions.", description: "Our dense brick range includes fireclay and high-alumina products in a selection of grades. Share your furnace design and process requirements for guidance on material selection." },
    "cordierite-mullite-bricks": { name: "Cordierite–mullite bricks", short: "Specialist compositions for your thermal process.", description: "Cordierite–mullite refractory bricks are available in a range of compositions. Our team can help match your application to a suitable product specification." },
    "chemical-bond-bricks": { name: "Chemically bonded bricks", short: "Alternative bonding systems for specific requirements.", description: "Chemically bonded refractory bricks offer additional options within the shaped range. Contact our specialists to discuss process compatibility and grade selection." },
    "acid-resistant-bricks": { name: "Acid-resistant bricks", short: "Materials selected for chemically demanding conditions.", description: "Acid-resistant bricks are available in multiple grades for specialist applications. Provide details of the chemical environment and operating conditions to establish suitability." },
    castables: { name: "Refractory castables", short: "Versatile materials. Application-led specifications.", description: "Choose from lightweight, low-cement, traditional alumina, and cordierite castables. Our team supports material selection around the requirements of your installation." },
    mortars: { name: "Refractory mortars", short: "The right connection between refractory components.", description: "Our mortar range includes heat-setting, air-setting, acid-resistant, and phosphate-bonded materials. Discuss the brick grade and installation requirements with our team." },
    chamotte: { name: "Chamotte", short: "Raw materials for refractory and ceramic production.", description: "Chamotte is supplied across refractory, lightweight, and sanitary-ware ranges. Ask our sales team about available particle sizes and compositions for your production process." },
    "calcined-bauxite": { name: "Calcined bauxite", short: "A selection of particle sizes for your process.", description: "Calcined bauxite is offered in fine and aggregate sizes to meet a range of production requirements. Request current technical specifications and availability from our team." },
  },
  ar: {
    "lightweight-bricks": { name: "الطوب العازل خفيف الوزن", short: "عزل حراري لأكثر البيئات الحرارية تطلبًا.", description: "مجموعة من الطوب الحراري العازل للتطبيقات التي يُعدّ فيها العزل الحراري وخفة الوزن أولوية. ناقش ظروف التشغيل مع فريقنا لاختيار الدرجة المناسبة." },
    "dense-alumina-bricks": { name: "طوب الألومينا الكثيف", short: "حلول حرارية من الطين الناري والألومينا العالية.", description: "تضم مجموعة الطوب الكثيف لدينا منتجات من الطين الناري والألومينا العالية بدرجات متعددة. شاركنا تصميم الفرن ومتطلبات العملية لنساعدك في اختيار المادة." },
    "cordierite-mullite-bricks": { name: "طوب الكورديريت–موليت", short: "تركيبات متخصصة لعمليتك الحرارية.", description: "يتوفر طوب الكورديريت–موليت الحراري بتركيبات متعددة، ويمكن لفريقنا مساعدتك في مطابقة تطبيقك مع المواصفات المناسبة." },
    "chemical-bond-bricks": { name: "الطوب المترابط كيميائيًا", short: "أنظمة ربط بديلة لمتطلبات محددة.", description: "يوفّر الطوب الحراري المترابط كيميائيًا خيارات إضافية ضمن مجموعة المنتجات المشكّلة. تواصل مع متخصصينا لمناقشة توافقه مع عمليتك واختيار الدرجة." },
    "acid-resistant-bricks": { name: "الطوب المقاوم للأحماض", short: "مواد مختارة للظروف الكيميائية القاسية.", description: "يتوفر الطوب المقاوم للأحماض بدرجات متعددة للتطبيقات المتخصصة. زوّدنا بتفاصيل البيئة الكيميائية وظروف التشغيل لتحديد مدى الملاءمة." },
    castables: { name: "الخرسانات الحرارية", short: "مواد متعددة الاستخدامات بمواصفات تناسب التطبيق.", description: "اختر من بين الخرسانات الحرارية خفيفة الوزن، ومنخفضة الأسمنت، والألومينية التقليدية، وخرسانات الكورديريت. يدعمك فريقنا في اختيار المادة وفق متطلبات التركيب." },
    mortars: { name: "المونة الحرارية", short: "الرابط الصحيح بين المكوّنات الحرارية.", description: "تشمل مجموعة المونة لدينا مواد تتصلّب بالحرارة، وأخرى تتصلّب بالهواء، ومونة مقاومة للأحماض، ومونة مترابطة بالفوسفات. ناقش درجة الطوب ومتطلبات التركيب مع فريقنا." },
    chamotte: { name: "الشاموت", short: "مواد خام لإنتاج المواد الحرارية والسيراميك.", description: "يتوفر الشاموت بأنواع حرارية وخفيفة الوزن ولصناعة الأدوات الصحية. اسأل فريق المبيعات عن أحجام الحبيبات والتركيبات المتاحة لعملية الإنتاج لديك." },
    "calcined-bauxite": { name: "البوكسيت المكلسن", short: "مجموعة من أحجام الحبيبات لعمليتك.", description: "يتوفر البوكسيت المكلسن بأحجام ناعمة وحبيبية لتلبية مجموعة من متطلبات الإنتاج. اطلب المواصفات الفنية الحالية والتوافر من فريقنا." },
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

export const localProducts = (lang: Locale): Product[] => productBase.map(p => ({ ...p, ...productText[lang][p.slug] }));
export const localIndustries = (lang: Locale): Industry[] => industryBase.map(i => ({ ...i, ...industryText[lang][i.slug] }));
