import type { MessagerieConversation, MessagerieProps } from "./Messagerie";

/**
 * Données d'exemple : quatre conversations datées par rapport à aujourd'hui, et des réponses
 * simulées pour la démonstration. Remplace-les par tes conversations ; retire `autoReplies`.
 */
function at(daysAgo: number, hours: number, minutes: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

const CONVERSATIONS: MessagerieConversation[] = [
  {
    id: "ines",
    name: "Inès Benali",
    role: "Responsable financière",
    online: true,
    unread: 2,
    email: "ines.benali@acme.ma",
    messages: [
      { id: "i1", from: "me", text: "Tu as reçu les relevés de septembre ?", time: at(1, 17, 40), status: "read" },
      { id: "i2", from: "them", text: "Oui, tout est rapproché sauf deux virements.", time: at(1, 17, 52) },
      { id: "i3", from: "them", text: "Voici le budget 2027 mis à jour.", time: at(0, 9, 12), file: { name: "Budget 2027.xlsx", meta: "Feuille de calcul · 284 Ko" } },
      { id: "i4", from: "them", text: "J'ai ajouté l'onglet Marrakech. Tu me dis si ça te va ?", time: at(0, 9, 13) },
    ],
  },
  {
    id: "karim",
    name: "Karim Alaoui",
    role: "Commercial, région Nord",
    unread: 0,
    email: "karim.alaoui@acme.ma",
    messages: [
      { id: "k1", from: "them", text: "Atlas Négoce valide le devis D-2026-114.", time: at(0, 8, 30) },
      { id: "k2", from: "me", text: "Super, je prépare la facture.", time: at(0, 8, 41), status: "read" },
    ],
  },
  {
    id: "fatima",
    name: "Fatima Zahra El Idrissi",
    role: "Juriste",
    online: true,
    unread: 1,
    email: "fz.elidrissi@acme.ma",
    messages: [
      { id: "f1", from: "them", text: "Le contrat cadre est prêt à signer.", time: at(2, 15, 5), file: { name: "Contrat cadre.pdf", meta: "PDF · 1,2 Mo" } },
    ],
  },
  {
    id: "youssef",
    name: "Youssef Tazi",
    role: "Logistique",
    unread: 0,
    email: "youssef.tazi@acme.ma",
    messages: [
      { id: "y1", from: "me", text: "La livraison de Tanger part demain ?", time: at(5, 10, 2), status: "read" },
      { id: "y2", from: "them", text: "Oui, départ 7 h, arrivée prévue jeudi.", time: at(5, 10, 20) },
    ],
  },
];


export const messagerieSample = {
  conversations: CONVERSATIONS,
  defaultActiveId: "ines",
  localTimeCity: "Casablanca",
  autoReplies: ["Parfait, merci !", "Je regarde et je te dis.", "Top, on en parle à 14 h."],
} satisfies MessagerieProps;
