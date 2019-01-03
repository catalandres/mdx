import { DescribeGlobalSObjectResult, DescribeSObjectResult, Field, ActionOverride, NamedLayoutInfo, RecordTypeInfo, ScopeInfo, ChildRelationship } from 'jsforce';

type maybe<T> = (T | null | undefined)

export class MetadataSObjectResult implements DescribeGlobalSObjectResult, DescribeSObjectResult {
    actionOverrides?: maybe<ActionOverride[]>;
    activateable: boolean;
    childRelationships: ChildRelationship[];
    compactLayoutable: boolean;
    createable: boolean;
    custom: boolean;
    customSetting: boolean;
    deletable: boolean;
    deleteable: boolean;
    deprecatedAndHidden: boolean;
    feedEnabled: boolean;
    fields: Field[];
    hasSubtypes: boolean;
    isSubtype: boolean;
    keyPrefix: string | null;
    label: string;
    labelPlural: string;
    layoutable: boolean;
    listviewable?: maybe<boolean>;
    lookupLayoutable?: maybe<boolean>;
    mergeable: boolean;
    mruEnabled: boolean;
    name: string;
    namedLayoutInfos: NamedLayoutInfo[];
    namespace: string;
    networkScopeFieldName?: maybe<string>;
    queryable: boolean;
    recordTypeInfos: RecordTypeInfo[];
    replicateable: boolean;
    retrieveable: boolean;
    searchable: boolean;
    searchLayoutable: boolean;
    suffix: string;
    supportedScopes: ScopeInfo[];
    triggerable: boolean;
    type: string;
    undeletable: boolean;
    undeleteable: boolean;
    updateable: boolean;
    urlDetail?: string;
    urlEdit?: string;
    urlNew?: string;
    urls: Record<string, string>;
}