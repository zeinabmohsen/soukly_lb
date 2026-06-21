// Lebanon administrative divisions: 8 governorates (محافظات) and the 25
// districts (أقضية) under them. Beirut is its own governorate and isn't
// subdivided, so its single "district" is Beirut itself.
//
// Used by the seller application form's location picker; safe to reuse for a
// marketplace location filter later.

export type Governorate = {
  /** English name (also the stored value). */
  name: string
  /** Arabic name, for bilingual display. */
  ar: string
  /** Districts (qadaa) within this governorate. */
  districts: { name: string; ar: string }[]
}

export const LEBANON: Governorate[] = [
  {
    name: "Beirut",
    ar: "بيروت",
    districts: [{ name: "Beirut", ar: "بيروت" }],
  },
  {
    name: "Mount Lebanon",
    ar: "جبل لبنان",
    districts: [
      { name: "Jbeil (Byblos)", ar: "جبيل" },
      { name: "Keserwan", ar: "كسروان" },
      { name: "Matn", ar: "المتن" },
      { name: "Baabda", ar: "بعبدا" },
      { name: "Aley", ar: "عاليه" },
      { name: "Chouf", ar: "الشوف" },
    ],
  },
  {
    name: "North",
    ar: "الشمال",
    districts: [
      { name: "Tripoli", ar: "طرابلس" },
      { name: "Koura", ar: "الكورة" },
      { name: "Zgharta", ar: "زغرتا" },
      { name: "Bsharri", ar: "بشري" },
      { name: "Batroun", ar: "البترون" },
      { name: "Miniyeh-Danniyeh", ar: "المنية-الضنية" },
    ],
  },
  {
    name: "Akkar",
    ar: "عكار",
    districts: [{ name: "Akkar", ar: "عكار" }],
  },
  {
    name: "Beqaa",
    ar: "البقاع",
    districts: [
      { name: "Zahle", ar: "زحلة" },
      { name: "Western Beqaa", ar: "البقاع الغربي" },
      { name: "Rashaya", ar: "راشيا" },
    ],
  },
  {
    name: "Baalbek-Hermel",
    ar: "بعلبك-الهرمل",
    districts: [
      { name: "Baalbek", ar: "بعلبك" },
      { name: "Hermel", ar: "الهرمل" },
    ],
  },
  {
    name: "South",
    ar: "الجنوب",
    districts: [
      { name: "Sidon", ar: "صيدا" },
      { name: "Tyre", ar: "صور" },
      { name: "Jezzine", ar: "جزين" },
    ],
  },
  {
    name: "Nabatieh",
    ar: "النبطية",
    districts: [
      { name: "Nabatieh", ar: "النبطية" },
      { name: "Marjeyoun", ar: "مرجعيون" },
      { name: "Hasbaya", ar: "حاصبيا" },
      { name: "Bint Jbeil", ar: "بنت جبيل" },
    ],
  },
]

export const GOVERNORATES = LEBANON.map((g) => g.name)

export function districtsOf(governorate: string): { name: string; ar: string }[] {
  return LEBANON.find((g) => g.name === governorate)?.districts ?? []
}

/**
 * Human-readable location string stored on the seller's store. Collapses the
 * redundant "Beirut, Beirut" / "Akkar, Akkar" cases where the district name
 * equals the governorate.
 */
export function formatLocation(governorate: string, district: string): string {
  if (!governorate) return ""
  if (!district || district === governorate) return governorate
  return `${district}, ${governorate}`
}
