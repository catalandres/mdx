import { AnyJson, Dictionary, JsonArray } from '@salesforce/ts-types';
import { Result, TableOptions, UX } from "@salesforce/command";
import { DescribeSObjectResult, FileProperties, MetadataObject } from 'jsforce';
import { Connection } from '@salesforce/core';
import { MetadataSObjectResult } from './MetadataSObjectResult';
import { cli } from 'cli-ux';
import _ = require('lodash');

export class MetadataExplorer {
    private conn: Connection;
    private apiversion: string;

    // https://salesforce.stackexchange.com/questions/101844/what-are-the-object-and-field-name-suffixes-that-salesforce-uses-such-as-c-an
    private objectTypeBySuffix = {
        'c' : 'Custom Object or Settings',
        'mdt': 'Custom Metadata Type',
        'e': 'Platform Event',
        'b': 'Big Object',
        'x': 'External Object',
        'xo': 'Salesforce-to-Salesforce Object',
        'ka': 'Knowledge Article',
        'kav': 'Knowledge Article Version',
        'ViewStat': 'Knowledge Article View Statistics',
        'VoteStat': 'Knowledge Article Vote Statistics',
        'DataCategorySelection': 'Data Category Selection',
        'History': 'History',
        'Feed': 'Feed',
        'Share': 'Share',
        'Tag': 'Tag'
    };

    constructor(conn: Connection, apiversion: string) {
        this.conn = conn;
        this.apiversion = apiversion;
    }

    public async list(raw = false, metadataType?: string): Promise<AnyJson> {
        await this.initialize();
        let output: Dictionary[] = [];
        if (metadataType) {
            output = await this.getStandardMetadataTypeObjects(metadataType, raw);
        } else {
            cli.action.start('Fetching all metadata objects');
            const types: MetadataObject[] = await this.getStandardMetadataTypes();
            let objects: FileProperties[]
            for (const type of types) {
                cli.action.status = type.xmlName;
                objects = await this.getStandardMetadataTypeObjects(type.xmlName, raw);
                if (objects && objects.length > 0) {
                    output.push.apply(output, objects);
                }
                if (type.childXmlNames) {
                    for (const name of type.childXmlNames) {
                        objects = await this.getStandardMetadataTypeObjects(name, raw);
                        if (objects && objects.length > 0) {
                            output.push.apply(output, objects);
                        }
                    }
                }
            }
            cli.action.stop()
        }
        return output as AnyJson;
    }

    public async types(): Promise<MetadataObject[]> {
        await this.initialize();
        const output: MetadataObject[] = await this.getStandardMetadataTypes();
        return output;
    }

    public async listObjects(filters: ObjectFilter[]): Promise<AnyJson> {
        await this.initialize();
        let objects: MetadataSObjectResult[] = (await this.conn.describeGlobal()).sobjects as MetadataSObjectResult[];
        objects = _.sortBy(objects, 'name');
        this.classifyObjects(objects);
        this.filterObjects(objects, filters);
        return (objects as Dictionary[]) as JsonArray;
    }

    public async describeObject(objectName: string): Promise<DescribeSObjectResult> {
        await this.initialize();
        const objects: DescribeSObjectResult = (await this.conn.describe(objectName));
        return objects;
    }

    private async initialize() {
        this.apiversion = this.apiversion || await this.conn.retrieveMaxApiVersion();
    }

    private async getStandardMetadataTypes(): Promise<MetadataObject[]> {
        let types: MetadataObject[] = (await this.conn.metadata.describe(this.apiversion)).metadataObjects;
        types = _.sortBy(types, 'xmlName');
        return types;
    }

    private async getStandardMetadataTypeObjects(metadataType: string, raw: boolean): Promise<FileProperties[]> {
        let objects: FileProperties[] = await this.conn.metadata.list(
            { type: metadataType },
            this.apiversion
        ) as Array<FileProperties>;
        if (objects) {
            if (!Array.isArray(objects)) {
                objects = [(objects as Dictionary) as FileProperties];
            } else if (objects.length > 1) {
                objects = _.orderBy((objects as FileProperties[]), 'fullName');
            }
        } 
        if (objects && objects.length > 0 && !raw) {
            this.cleanup(objects as FileProperties[]);
        }
        return objects;
    }

    private cleanup(objects: FileProperties[]) {
        for (const object of objects) {
            if (object.lastModifiedDate === '1970-01-01T00:00:00.000Z') {
                object.lastModifiedDate = '';
                object.lastModifiedByName = '';
            }
            if (object.createdDate === '1970-01-01T00:00:00.000Z') {
                object.createdDate = '';
                object.createdByName = '';
            }
        }
    }
    
    private classifyObjects(objects: MetadataSObjectResult[]) {
        for (const object of objects) {
            if (object.name.split('__').length == 3) {
                object.namespace = object.name.split('__')[0];
                object.suffix = object.name.split('__')[2];
            } else if (object.name.split('__').length == 2) {
                object.suffix = object.name.split('__')[1];
            }

            object.type = this.objectTypeBySuffix[object.suffix];

            if (object.suffix === 'c') {
                if (object.customSetting) {
                    object.type = 'Custom Setting';
                } else if (object.custom) {
                    object.type = 'Custom Object';
                }
            }
        }
    }

    private filterObjects(objects: MetadataSObjectResult[], filters: ObjectFilter[]) {
        for (let filter of filters) {
            let sign: boolean = filter.startsWith('-');
            filter = (filter.startsWith('-') ? filter.substring(1) : filter) as ObjectFilter;
            switch (filter) {
                case ObjectFilter.Activateable:
                    this.removeObjects(objects, 'activateable', sign);
                    break;
                case ObjectFilter.CompactLayoutable:
                    this.removeObjects(objects, 'compactLayoutable', sign);
                    break;
                case ObjectFilter.Createable:
                    this.removeObjects(objects, 'createable', sign);
                    break;
                case ObjectFilter.Custom:
                    this.removeObjects(objects, 'custom', sign);
                    break;
                case ObjectFilter.CustomObject:
                    this.removeObjects(objects, 'type', 'Custom Object', false);
                    break;
                case ObjectFilter.CustomSetting:
                    this.removeObjects(objects, 'customSetting', sign);
                    break;
                case ObjectFilter.Deletable:
                    this.removeObjects(objects, 'deletable', sign);
                    break;
                case ObjectFilter.DeprecatedAndHidden:
                    this.removeObjects(objects, 'deprecatedAndHidden', sign);
                    break;
                case ObjectFilter.FeedEnabled:
                    this.removeObjects(objects, 'feedEnabled', sign);
                    break;
                case ObjectFilter.HasSubtypes:
                    this.removeObjects(objects, 'hasSubtypes', sign);
                    break;
                case ObjectFilter.IsSubtype:
                    this.removeObjects(objects, 'isSubtype', sign);
                    break;
                case ObjectFilter.Layoutable:
                    this.removeObjects(objects, 'layoutable', sign);
                    break;
                case ObjectFilter.Listviewable:
                    this.removeObjects(objects, 'listviewable', sign);
                    break;
                case ObjectFilter.LookupLayoutable:
                    this.removeObjects(objects, 'lookupLayoutable', sign);
                    break;
                case ObjectFilter.Mergeable:
                    this.removeObjects(objects, 'mergeable', sign);
                    break;
                case ObjectFilter.MRUEnabled:
                    this.removeObjects(objects, 'mruEnabled', sign);
                    break;
                case ObjectFilter.Queryable:
                    this.removeObjects(objects, 'queryable', sign);
                    break;
                case ObjectFilter.Replicateable:
                    this.removeObjects(objects, 'replicateable', sign);
                    break;
                case ObjectFilter.Searchable:
                    this.removeObjects(objects, 'searchable', sign);
                    break;
                case ObjectFilter.SearchLayoutable:
                    this.removeObjects(objects, 'searchLayoutable', sign);
                    break;
                case ObjectFilter.Triggerable:
                    this.removeObjects(objects, 'triggerable', sign);
                    break;
                case ObjectFilter.Undeletable:
                    this.removeObjects(objects, 'undeletable', sign);
                    break;
                case ObjectFilter.Updateable:
                    this.removeObjects(objects, 'updateable', sign);
                    break;
            }
        }
    }

    private removeObjects(objects: MetadataSObjectResult[], property: string, value: AnyJson, equals: boolean = true) {
        for (let i = objects.length - 1; i >= 0; i--) {
            if ((objects[i][property] == value) === equals) {
                objects.splice(i, 1);
            }
        }
    }
}

export enum ObjectFilter {
    Activateable = 'activateable',
    CompactLayoutable = 'compactlayoutable',
    Createable = 'createable',
    Custom = 'custom',
    CustomObject = 'customobject',
    CustomSetting = 'customsetting',
    Deletable = 'deletable',
    DeprecatedAndHidden = 'deprecatedandhidden',
    FeedEnabled = 'feedenabled',
    HasSubtypes = 'hassubtypes',
    IsSubtype = 'issubtype',
    Layoutable = 'layoutable',
    Listviewable = 'listviewable',
    LookupLayoutable = 'lookuplayoutable',
    Mergeable = 'mergeable',
    MRUEnabled = 'mruenabled',
    Queryable = 'queryable',
    Replicateable = 'replicateable',
    Searchable = 'searchable',
    SearchLayoutable = 'searchlayoutable',
    Triggerable = 'triggerable',
    Undeletable = 'undeletable',
    Updateable = 'updateable',
    NotActivateable = '-activateable',
    NotCompactLayoutable = '-compactlayoutable',
    NotCreateable = '-createable',
    NotCustom = '-custom',
    NotCustomObject = '-customobject',
    NotCustomSetting = '-customsetting',
    NotDeletable = '-deletable',
    NotDeprecatedAndHidden = '-deprecatedandhidden',
    NotFeedEnabled = '-feedenabled',
    NotHasSubtypes = '-hassubtypes',
    NotIsSubtype = '-issubtype',
    NotLayoutable = '-layoutable',
    NotListviewable = '-listviewable',
    NotLookupLayoutable = '-lookuplayoutable',
    NotMergeable = '-mergeable',
    NotMRUEnabled = '-mruenabled',
    NotQueryable = '-queryable',
    NotReplicateable = '-replicateable',
    NotSearchable = '-searchable',
    NotSearchLayoutable = '-searchlayoutable',
    NotTriggerable = '-triggerable',
    NotUndeletable = '-undeletable',
    NotUpdateable = '-updateable',
}

export class MetadataExplorerResult extends Result{

    constructor(data: AnyJson, tableColumnData: TableOptions, ux: UX) {
        super();
        this.data = data;
        this.display = () => {
            if (this.tableColumnData) {
                if (Array.isArray(this.data) && (this.data as JsonArray).length) {
                    this.ux.table(this.data, this.tableColumnData);
                }
                else {
                    this.ux.log('No results found.');
                }
              }      
        }
        this.tableColumnData = tableColumnData;
        this.ux = ux;
    }
}