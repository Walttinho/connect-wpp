export class SalesforceService {
  static async openContact(leadId: string): Promise<void> {
    console.log(`Abrindo Salesforce para lead: ${leadId}`);

    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }

  static async syncContact(leadId: string): Promise<any> {
    console.log(`Sincronizando dados do lead: ${leadId}`);
    return new Promise((resolve) => {
      setTimeout(() => resolve({ synced: true }), 1000);
    });
  }
}
