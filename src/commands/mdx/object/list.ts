import { core, flags, SfdxCommand, TableOptions } from '@salesforce/command';
import { MetadataExplorer, ObjectFilter } from '../../../lib/MetadataExplorer';
import { MetadataExplorerResult } from '../../../lib/MetadataExplorer';
import { SfdxError } from '@salesforce/core';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-mdx', 'mdx.object.list');

export default class MetadataExplorerObjectList extends SfdxCommand {

  public static description = messages.getMessage('description');

  public static examples = [
    '   $ sfdx mdx:object:list -u targetusername'
    ];

  protected static flagsConfig = {
    filter: flags.array({
      char: 'f',
      description: messages.getMessage('filter')})
  };

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    this.validateFlags();

    const conn = await this.org.getConnection();

    const mdx: MetadataExplorer = new MetadataExplorer(conn, this.flags.apiversion);

    const options: TableOptions = {
      columns: [
        {key: 'keyPrefix', label: 'KEY PREFIX'},
        {key: 'namespace', label: 'NAMESPACE'},
        {key: 'name', label: 'NAME'},
        {key: 'type', label: 'TYPE'},
        {key: 'label', label: 'LABEL'}
        
      ]
    };

    this.result = new MetadataExplorerResult(
      await mdx.listObjects(this.flags.filter), 
      options, 
      this.ux
    );

    if (this.flags.json) {
      return this.result.data;
    }
  }

  private validateFlags() {
    if (this.flags.filter) {
      const filterErrors: string[] = [];
      for (const filter of this.flags.filter) {
        if (!Object.values(ObjectFilter).includes(filter)) {
          filterErrors.push(filter);
        }
      }
      if (filterErrors.length > 0) {
        throw new SfdxError(messages.getMessage('filterError', [filterErrors.join()]));
      }
    }
  }

}
