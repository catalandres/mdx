import { core, flags, SfdxCommand, TableOptions } from '@salesforce/command';
import { AnyJson, Dictionary } from '@salesforce/ts-types';
import { MetadataExplorer } from '../../../lib/MetadataExplorer';
import { DescribeSObjectResult } from 'jsforce';
import { MetadataExplorerResult } from '../../../lib/MetadataExplorer';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-mdx', 'mdx.object.describe');

export default class MetadataExplorerObjectFieldsList extends SfdxCommand {

  public static description = messages.getMessage('description');

  public static examples = [
    '   $ sfdx mdx:object:describe -u targetusername -o Account'
    ];

  protected static flagsConfig = {
    object: flags.string({
      char: 'o',
      description: messages.getMessage('objectFlag')})
  };

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  // protected static result: SfdxResult = new Result();

  public async run(): Promise<any> { // tslint:disable-line:no-any

    const conn = await this.org.getConnection();

    const mdx: MetadataExplorer = new MetadataExplorer(conn, this.flags.apiversion);
    const objectDescription: DescribeSObjectResult = await mdx.describeObject(this.flags.object);

    const options: TableOptions ={
      columns: [
        {key: 'label', label: 'LABEL'},
        {key: 'name', label: 'NAME'},
        {key: 'type', label: 'TYPE'},
        {key: 'referenceTo', label: 'REFERENCE TO'},
      ]
    };

    this.result = new MetadataExplorerResult(
      (objectDescription.fields as Dictionary[]) as AnyJson, 
      options, 
      this.ux
    );

    if (this.flags.json) {
      return this.result.data;
    }
  }
}
