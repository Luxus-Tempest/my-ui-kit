/* Icônes du bloc Drive (16 px, trait). Remplace-les par ta librairie d'icônes si tu préfères. */
import * as React from "react";

const base = { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export const PlusIcon = () => <svg {...base}><path d="M8 3.5v9M3.5 8h9" /></svg>;
export const TrashIcon = () => <svg {...base}><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" /></svg>;
export const DownloadIcon = () => <svg {...base}><path d="M8 2.5v7.5M5 7l3 3 3-3M3 12.5h10" /></svg>;
export const MoreIcon = () => <svg {...base}><circle cx="3.5" cy="8" r=".6" /><circle cx="8" cy="8" r=".6" /><circle cx="12.5" cy="8" r=".6" /></svg>;
export const CopyIcon = () => <svg {...base}><rect x="5.5" y="5.5" width="8" height="8" rx="1.5" /><path d="M10.5 5.5V3.75A1.25 1.25 0 0 0 9.25 2.5h-5.5A1.25 1.25 0 0 0 2.5 3.75v5.5a1.25 1.25 0 0 0 1.25 1.25H5.5" /></svg>;
export const EditIcon = () => <svg {...base}><path d="M10.5 2.75 13.25 5.5 6 12.75 2.75 13.25 3.25 10z" /></svg>;
export const HomeIcon = () => <svg {...base}><path d="M2.5 7 8 2.5 13.5 7v6a.5.5 0 0 1-.5.5H10V10H6v3.5H3a.5.5 0 0 1-.5-.5z" /></svg>;
export const FolderIcon = () => <svg {...base}><path d="M2 4.5A1.5 1.5 0 0 1 3.5 3h2.6l1.4 1.5h5A1.5 1.5 0 0 1 14 6v5.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 11.5z" /></svg>;
export const ClockIcon = () => <svg {...base}><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3l2 1.5" /></svg>;
export const StarIcon = () => <svg {...base}><path d="m8 2.5 1.7 3.5 3.8.5-2.8 2.6.7 3.8L8 11.1l-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z" /></svg>;
export const CloudIcon = () => <svg {...base}><path d="M4.5 12.5a3 3 0 0 1-.3-6A4 4 0 0 1 12 6.8a2.9 2.9 0 0 1-.5 5.7z" /></svg>;
export const FileIcon = () => <svg {...base}><path d="M4 2.5h5l3 3v8H4z" /><path d="M9 2.5v3h3M6 9h4M6 11h3" /></svg>;
export const GridIcon = () => <svg {...base}><rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" /><rect x="9" y="2.5" width="4.5" height="4.5" rx="1" /><rect x="2.5" y="9" width="4.5" height="4.5" rx="1" /><rect x="9" y="9" width="4.5" height="4.5" rx="1" /></svg>;
