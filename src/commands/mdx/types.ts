import { core, SfdxCommand } from '@salesforce/command';
import { MetadataExplorer } from '../../lib/MetadataExplorer';
import { MetadataObject } from 'jsforce';

// Initialize Messages with the current plugin directory
core.Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = core.Messages.loadMessages('sfdx-mdx', 'mdx.types');

export default class MetadataTypes extends SfdxCommand {

  public static description = messages.getMessage('description');

  public static examples = [
    '$ sfdx mdx:types -u targetusername',
    '$ sfdx mdx:types -u targetusername --json',
    ];

  protected static requiresUsername = true;
  protected static supportsDevhubUsername = false;
  protected static requiresProject = false;

  public async run(): Promise<any> { // tslint:disable-line:no-any

    const conn = await this.org.getConnection();
    const mdx: MetadataExplorer = new MetadataExplorer(conn, this.flags.apiversion);

    const types: MetadataObject[] = await mdx.types();

    const tree = this.ux.cli.tree();

    for (const type of types) {
      if (type.childXmlNames) {
        let children = this.ux.cli.tree();
        for (const childName of type.childXmlNames) {
          children.insert(childName);
        }
        tree.insert(type.xmlName, children);
      } else {
        tree.insert(type.xmlName);
      }
    }
    
    if (this.flags.json) {
        return types;
    } else {
      tree.display();
    }
  }
}
