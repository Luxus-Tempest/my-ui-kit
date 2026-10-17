import type { Metadata } from "next";
import { Heading, Text } from "@rovia/ui";
import { DocumentsTable } from "@/components/documents-table";
import { getDocuments } from "@/lib/donnees";

export const metadata: Metadata = { title: "Documents" };

export default function DocumentsPage() {
  const documents = getDocuments();
  return (
    <>
      <div className="grid gap-1">
        <Heading level={1} size="lg">Documents</Heading>
        <Text tone="muted">{documents.length} documents dans l'espace de l'équipe</Text>
      </div>
      <DocumentsTable documents={documents} />
    </>
  );
}
