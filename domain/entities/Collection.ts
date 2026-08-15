import { ColumnSchema } from '../../bootstrap/type';
import { Row } from './Row';

export class Collection {

    constructor(
        public name: string = "default",
        private rows: Map<number, Row>,
        private columns: Map<string, ColumnSchema>,



    ) { }
    setCollectionName(name: string): void {
        this.name = name
    }
    getCollectionName(): string {
        return this.name
    }
    getRows(): Map<number, Row> {
        return this.rows;
    }
    setRows(rows: Map<number, Row>): void {
        this.rows = rows;
    }

    getColumns(): Map<string, ColumnSchema> {
        return this.columns;
    }


}


