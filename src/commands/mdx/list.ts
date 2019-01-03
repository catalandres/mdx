import { core, flags, SfdxCommand, TableOptions } from '@salesforce/command';
import { MetadataExplorer } from '../../lib/MetadataExplorer';
import { MetadataExplorerResult } from '../../lib/MetadataExplorer';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-mdx', 'mdx.list');

export default class MetadataList extends SfdxCommand {

  public static description = messages.getMessage('description');

  public static examples = [
    '   $ sfdx mdx:list -u targetusername',
    '   $ sfdx mdx:list -t CustomObject -u targetusername'
    ];

  protected static flagsConfig = {
    type: flags.string({
      char: 't',
      description: messages.getMessage('type')}),
    all: flags.boolean({
      default: false,
      description: messages.getMessage('all')}),
    // createdby: flags.string({
    //   char: 'c',
    //   description: messages.getMessage('createdby')}),
    // lastmodifiedby: flags.string({
    //   char: 'm',
    //   description: messages.getMessage('lastmodifiedby')}),  
  };

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    const conn = await this.org.getConnection();
    const mdx: MetadataExplorer = new MetadataExplorer(conn, this.flags.apiversion);

    const options: TableOptions = (this.flags.type || this.flags.all) ? {
      columns: [
        {key: 'type', label: 'TYPE'},
        {key: 'fullName', label: 'FULL NAME'},
        // {key: 'fileName', label: 'FILE NAME'},
        {key: 'createdDate', label: 'CREATED ON'},
        {key: 'createdByName', label: 'CREATED BY'},
        {key: 'lastModifiedDate', label: 'LAST MODIFIED ON'},
        {key: 'lastModifiedByName', label: 'LAST MODIFIED BY'}
      ]
    } : {
      columns: [
        {key: 'xmlName', label: 'XML NAME'}
      ]
    };

    this.result = new MetadataExplorerResult(
      await mdx.list(
        this.flags.all, 
        this.flags.type, 
        this.flags.json,
        // this.flags.createdby,
        // this.flags.lastmodifiedby
        ), 
      options, 
      this.ux
    );
    
    if (this.flags.json) {
        return this.result.data;
    }
  }
}
