import { LinkCache, MetadataCache, TFile } from "obsidian";
import { CustomArrayDict } from "./custom-array-dict";

export interface ExtendedMetadataCache extends MetadataCache {
	getBacklinksForFile(file: TFile): CustomArrayDict<LinkCache>;
}