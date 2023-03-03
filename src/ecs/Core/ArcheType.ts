import SparseSet from "../utilities/SparseSet";
import World from "../World";

export default class ArcheType {

    private entities: SparseSet;
    private columns: Array<any>;
    private columnDefinitions: SparseSet;
    private mask: Uint16Array;
    private world: World;

    constructor(world: World, componentDefinitions: Array<any> | Uint32Array, mask: Uint16Array) {

        this.entities = new SparseSet(world.maxEntities, world.maxEntities);
        this.columns = [];
        this.world = world;
        this.mask = mask;

        this.columnDefinitions = new SparseSet(20000, componentDefinitions.length);

        //this is not necessary in the case it is empty
        if (componentDefinitions.length <= 0) {
            return;
        }

        for (let index = 0; index < componentDefinitions.length; index++) {

            if (this.columnDefinitions.has(componentDefinitions[index])) {
                throw "ArcheType can not have duplicate components";
            }

            this.columnDefinitions.insert(componentDefinitions[index]);

            const column = this.world.schemaManager.generate(this.world.schemaManager.get(componentDefinitions[index]));

            this.columns[this.columnDefinitions.getDenseId(componentDefinitions[index])] = column;
        }
    }

    addEntity(entityId: number) {
        this.entities.insert(entityId);
        return this.getEntityIndex(entityId)
    }

    transferEntity(entityId: number, oldArcheType: ArcheType) {

        this.entities.insert(entityId);

        const otherComponentDefinitions = oldArcheType.getComponentDefinitions();
        const otherColumns = oldArcheType.getColumns();

        const oldEntity = oldArcheType.getEntityIndex(entityId);
        const newEntity = this.getEntityIndex(entityId);

        for (let index = 0; index < otherComponentDefinitions.length(); index++) {

            const transferSparseId = otherComponentDefinitions.getSparseId(index);
            const columnToTransfer = otherColumns[index];
            const denseId = this.columnDefinitions.getDenseId(transferSparseId);
            const column = this.columns[denseId];

            if (!this.columnDefinitions.has(transferSparseId)) {

                this.clearEntityColumn(columnToTransfer, entityId);
                continue;
            }

            if(columnToTransfer === null) {
                //continuing on tags
                continue;
            }

            if (columnToTransfer.constructor === Object) {

                const keys = Object.keys(column);

                for (let index = 0; index < keys.length; index++) {
                    column[keys[index]][newEntity] = columnToTransfer[keys[index]][oldEntity];

                    if (columnToTransfer[keys[index]].constructor === Array) {

                        const value = columnToTransfer[keys[index]][oldArcheType.getEntities().length() - 1];
                        columnToTransfer[keys[index]][oldEntity] = value;
                        columnToTransfer[keys[index]].pop();
                    } else {
                        columnToTransfer[keys[index]][oldEntity] = 0;
                    }
                }

            } else {

                if (columnToTransfer[oldEntity]) {
                    column[newEntity] = columnToTransfer[oldEntity];

                    const value = columnToTransfer[oldArcheType.getEntities().length() - 1];
                    columnToTransfer[oldEntity] = value;

                    if (columnToTransfer.constructor === Array) {
                        columnToTransfer.pop();
                    } else {
                        columnToTransfer[oldArcheType.getEntities().length() - 1] = 0;
                    }
                }
            }
        }

        oldArcheType.getEntities().delete(entityId);

    }

    copyEntity(fromEntity: number, toEntity: number) {

        const fromEntityDenseId = this.getEntityIndex(fromEntity);
        const toEntityDenseId = this.getEntityIndex(toEntity);

        for (let index = 0; index < this.columnDefinitions.length(); index++) {

            const column: any = this.columns[index];

            if(column === null) {
                //continuing on tags
                continue;
            }

            if (column.constructor === Object) {
                Object.values(column).forEach(
                    (columnValue) => {
                        (columnValue as any)[toEntityDenseId] = (columnValue as any)[fromEntityDenseId];
                    })
            } else {
                if (column[fromEntityDenseId]) {

                    //temporary to clone BJS objects

                    if (typeof column[fromEntityDenseId].clone !== 'undefined') {
                        column[toEntityDenseId] = column[fromEntityDenseId].clone();
                    } else {
                        column[toEntityDenseId] = column[fromEntityDenseId];
                    }
                }
            }
        }
    }

    removeEntity(entityId: number, deleteReference: boolean = false) {

        if (!this.entities.has(entityId)) {
            return;
        }

        const entityDenseId = this.getEntityIndex(entityId);

        for (let index = 0; index < this.columnDefinitions.length(); index++) {

            const column: any = this.columns[index];

            if(column === null) {
                //continuing on tags
                continue;
            }

            if (column.constructor === Object) {

                Object.values(column).forEach(
                    (columnValue) => {
                        const value = (columnValue as any)[this.entities.length() - 1];
                        (columnValue as any)[entityDenseId] = value;

                        if ((columnValue as any).constructor === Array) {
                            (columnValue as any).pop();
                        } else {
                            (columnValue as any)[this.entities.length() - 1] = 0;
                        }
                    }
                )
            } else {
                let oldValue = column[entityDenseId];
                const value = column[this.entities.length() - 1];
                column[entityDenseId] = value;

                if (column.constructor === Array) {
                    column.pop();

                    //temporary to dispose BJS objects, setting to null in order to clean reference

                    if (deleteReference && typeof oldValue.dispose !== 'undefined') {
                        oldValue.dispose();
                        oldValue = null;
                    }
                } else {
                    column[this.entities.length() - 1] = 0;
                }
            }
        }

        this.entities.delete(entityId);

        //Consider removing an archetype for memory optimizations. Is it worth it?
    }

    hasComponent(componentId: number) {
        return (this.mask[componentId] & 1 << componentId);
    }

    hasComponents(components: Uint16Array | Array<number>) {

        if (this.entities.length() === 0) {
            return false;
        }

        for (let index = 0; index < components.length; index++) {
            if (!(this.mask[components[index]] & 1 << components[index])) {
                return false;
            }
        }
        return true;
    }

    hasNotComponents(components: Uint16Array | Array<number>) {

        if (this.entities.length() === 0) {
            return false;
        }

        for (let index = 0; index < components.length; index++) {
            if ((this.mask[components[index]] & 1 << components[index])) {
                return false;
            }
        }
        return true;
    }

    hasEntity(entityId: number) {
        return this.entities.has(entityId);
    }

    getEntityIndex(entityId: number) {
        return this.entities.getDenseId(entityId);
    }

    clearEntityColumn(columnToTransfer: any, entity: number) {
        if (columnToTransfer.constructor === Object) {


            Object.values(columnToTransfer).forEach(
                (columnValue) => {
                    (columnValue as any)[entity] = 0;
                });

        } else {

            if (columnToTransfer[entity]) {

                const value = columnToTransfer[this.getEntities().length() - 1];
                columnToTransfer[entity] = value;

                if (columnToTransfer.constructor === Array) {
                    columnToTransfer.pop();
                } else {
                    columnToTransfer[this.getEntities().length() - 1] = 0;
                }
            }
        }
    }

    getColumn(componentId: number) {
        return this.columns[this.columnDefinitions.getDenseId(componentId)];
    }

    getColumns() {
        return this.columns;
    }

    getComponentDefinitions(): SparseSet {
        return this.columnDefinitions;
    }

    getMask() {
        return this.mask;
    }

    getEntities() {
        return this.entities;
    }

    getEntityIdFromIndex(entityIndex: number) {
        return this.entities.getSparseId(entityIndex);
    }
}