/**
 * Used to identify attributes to show of in the invoices section. Information like size of the 
 * File (Bill) and when it was modified etc. 
 * @author Casper Zielinski
 */
export interface Files {
  key: string | undefined;
  size: number | undefined;
  lastModified: Date | undefined;
  url: string;
}
