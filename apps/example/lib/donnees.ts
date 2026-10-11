/*
 * Données de démonstration, servies par le serveur (pages = composants serveur).
 * Elles franchissent la frontière serveur → client : uniquement des valeurs
 * sérialisables (chaînes, nombres, dates ISO), jamais de fonctions.
 */

export type TypeDocument = "pdf" | "xlsx" | "docx" | "pptx" | "image";
export type StatutDocument = "indexe" | "en_cours" | "erreur";

export interface Document {
  id: string;
  nom: string;
  type: TypeDocument;
  dossier: string;
  proprietaire: string;
  taille: number;
  modifie: string;
  statut: StatutDocument;
}

export type Role = "admin" | "editeur" | "lecteur";
export type StatutUtilisateur = "actif" | "invite" | "suspendu";

export interface Utilisateur {
  id: string;
  nom: string;
  email: string;
  departement: string;
  role: Role;
  statut: StatutUtilisateur;
  derniereConnexion: string | null;
}

/** Pseudo-aléatoire à graine : le rendu serveur et le client voient les mêmes données. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PERSONNES = ["Inès Benali", "Karim Alaoui", "Fatima Zahra El Idrissi", "Youssef Tazi", "Nadia Alami", "Omar Berrada"];
const DOSSIERS = ["Finance", "Juridique", "Ressources humaines", "Commercial", "Direction"];
const MODELES: { nom: string; type: TypeDocument }[] = [
  { nom: "Budget prévisionnel", type: "xlsx" },
  { nom: "Contrat cadre", type: "pdf" },
  { nom: "Procès-verbal du comité", type: "docx" },
  { nom: "Revue trimestrielle", type: "pptx" },
  { nom: "Relevé bancaire", type: "pdf" },
  { nom: "Photo du chantier", type: "image" },
  { nom: "Politique de sécurité", type: "docx" },
  { nom: "Tableau des effectifs", type: "xlsx" },
];
const EXTENSION: Record<TypeDocument, string> = { pdf: "pdf", xlsx: "xlsx", docx: "docx", pptx: "pptx", image: "jpg" };

export function getDocuments(): Document[] {
  const random = seeded(42);
  const debut = Date.UTC(2026, 6, 1);
  return Array.from({ length: 64 }, (_, i) => {
    const modele = MODELES[Math.floor(random() * MODELES.length)]!;
    const statut: StatutDocument = random() < 0.08 ? "erreur" : random() < 0.15 ? "en_cours" : "indexe";
    return {
      id: `doc-${i + 1}`,
      nom: `${modele.nom} ${i + 1}.${EXTENSION[modele.type]}`,
      type: modele.type,
      dossier: DOSSIERS[Math.floor(random() * DOSSIERS.length)]!,
      proprietaire: PERSONNES[Math.floor(random() * PERSONNES.length)]!,
      taille: Math.round(20_000 + random() ** 2 * 18_000_000),
      modifie: new Date(debut + Math.floor(random() * 100) * 86_400_000).toISOString(),
      statut,
    };
  });
}

export function getUtilisateurs(): Utilisateur[] {
  const random = seeded(7);
  const departements = ["Finance", "Juridique", "RH", "Commercial", "Direction", "Informatique"];
  const roles: Role[] = ["admin", "editeur", "editeur", "lecteur", "lecteur", "lecteur"];
  return PERSONNES.concat(["Salma Chraibi", "Mehdi Lahlou", "Rania Bennis", "Hamza Ouazzani", "Leila Fassi", "Anas Kettani"]).map(
    (nom, i) => {
      const statut: StatutUtilisateur = i === 9 ? "suspendu" : i % 5 === 4 ? "invite" : "actif";
      return {
        id: `u-${i + 1}`,
        nom,
        email: `${nom.split(" ")[0]!.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "")}@acme.ma`,
        departement: departements[i % departements.length]!,
        role: roles[Math.floor(random() * roles.length)]!,
        statut,
        derniereConnexion: statut === "invite" ? null : new Date(Date.UTC(2026, 9, 11) - Math.floor(random() * 30) * 86_400_000).toISOString(),
      };
    },
  );
}

/** Activité mensuelle : documents importés et requêtes aux agents. */
export function getActivite() {
  const mois = ["Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct."];
  return mois.map((m, i) => ({
    mois: m,
    documents: Math.round(820 + i * 140 + Math.sin(i * 1.4) * 120),
    requetes: Math.round(2400 + i * 520 + Math.cos(i) * 300),
  }));
}
