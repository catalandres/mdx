import { Dictionary, AnyJson } from "@salesforce/ts-types";

export class Transformer {

    public static filter(table: Dictionary[], field: string, operation: Operation, value: AnyJson) {
        let include: boolean;
        for (let i = table.length - 1; i >= 0; i--) {
            switch (operation) {
                case Operation.Contains:
                    include = (table[i][field] as string).includes(value as string) || false;
                case Operation.NotContains:
                    include = !(table[i][field] as string).includes(value as string) || false;
                case Operation.Equals:
                    include = (table[i][field] == value) || false;
                case Operation.NotEquals:
                    include = (table[i][field] != value) || false;
            }
            if (!include) {
                table.splice(i, 1);
            }
        }
    }
}

export enum Operation {
    Equals,
    NotEquals,
    Contains,
    NotContains,
}