import ArcheType from "./ArcheType";
import World from "../World";

export default class EntityManager {

    private currentEntityId: number;
    private deletedEntityIds: Array<number>;
    private entityArcheTypes: Array<ArcheType>;
    private world: World;

    constructor(world: World) {
        this.world = world;
        this.currentEntityId = 1;
        this.deletedEntityIds = [];
        this.entityArcheTypes = new Array<ArcheType>(this.world.maxEntities);
    }

    create() {
        if (this.deletedEntityIds.length > 0) {
            const entity = this.deletedEntityIds[this.deletedEntityIds.length - 1];
            this.deletedEntityIds.pop();

            const archeType = this.world.archeTypeManager.findOrCreateArcheType([]);
            archeType.addEntity(entity);

            this.entityArcheTypes[entity] = archeType;

            return entity;
        } else {
            const entity = this.currentEntityId;

            const archeType = this.world.archeTypeManager.findOrCreateArcheType([]);
            archeType.addEntity(entity);

            this.entityArcheTypes[entity] = archeType;

            this.currentEntityId += 1;
            return entity;
        }
    }

    destroy(entityId: number) {
        if(!this.entityArcheTypes[entityId] || !this.entityArcheTypes[entityId].hasEntity(entityId)) {
            return;
        }
        this.world.query.clearEntitiesCache();
        this.entityArcheTypes[entityId].removeEntity(entityId, true);
        this.deletedEntityIds.push(entityId);
    }

    setComponents(entityId: number, components: Array<number>) {
        const oldArcheType = this.entityArcheTypes[entityId];
        const archeType = this.world.archeTypeManager.findOrCreateArcheType(components);
        archeType.transferEntity(entityId, oldArcheType);
        this.entityArcheTypes[entityId] =  archeType;
    }

    addComponent(entityId: number, componentId: number, value: any = null) {

        const oldArcheType = this.entityArcheTypes[entityId];

        if(!oldArcheType || oldArcheType.hasComponent(componentId)) {
            return;
        }

        const components =  [...oldArcheType.getComponentDefinitions().getValues()];
        components.push(componentId);
        components.sort();

        let length = oldArcheType.getMask().length;

        if(componentId >= length) {
            length = componentId + 1;
        }

        let mask = new Uint16Array(length);
        mask.set(oldArcheType.getMask(), 0);
        mask[componentId] |= 1 << componentId;

        const archeType = this.world.archeTypeManager.findOrCreateArcheType(components, mask);

        archeType.transferEntity(entityId, oldArcheType);

        this.entityArcheTypes[entityId] = archeType;

        const column = archeType.getColumn(componentId);

        //setting initial value to the component
        if (value && value !== 0) {
            const entity = archeType.getEntityIndex(entityId);

            if (column.constructor === Object) {
                const keys = Object.keys(value);

                for (let index = 0; index < keys.length; index++) {
                    column[keys[index]][entity] = value[keys[index]];
                }
            } else {
                column[entity] = value;
            }
        }

        return column;
    }

    removeComponent(entityId: number, component: number) {
        const oldArcheType = this.entityArcheTypes[entityId];

        if (!oldArcheType || !oldArcheType.hasComponent(component)) {
            return;
        }

        const denseId = oldArcheType.getComponentDefinitions().getDenseId(component);

        const oldComponents = [...oldArcheType.getComponentDefinitions().getValues()];
        oldComponents[denseId] = oldComponents[oldComponents.length - 1];
        oldComponents.pop();
        oldComponents.sort();
        
        const mask = oldArcheType.getMask().slice();
        mask[component] ^= 1 << component;

        const archeType = this.world.archeTypeManager.findOrCreateArcheType(oldComponents, mask);

        archeType.transferEntity(entityId, oldArcheType);

        this.entityArcheTypes[entityId] = archeType;
    }

    getArchTypeId(entityId: number) {
        return this.entityArcheTypes[entityId].getEntityIndex(entityId);
    }

    getArcheType(entityId: number) {
        return (this.entityArcheTypes[entityId].hasEntity(entityId)) ? this.entityArcheTypes[entityId] : null;
    }

    getComponent(entityId: number, componentId: number) {
        return (this.entityArcheTypes[entityId].hasEntity(entityId)) ? this.entityArcheTypes[entityId].getColumn(componentId) : null;
    }

    clone(entityId: number) {
        const archeType = this.entityArcheTypes[entityId];

        const newEntity = this.create();

        const oldArcheType = this.getArcheType(newEntity)!;

        archeType.transferEntity(newEntity, oldArcheType);

        this.entityArcheTypes[newEntity] = archeType;

        archeType.copyEntity(entityId, newEntity);

        return newEntity;
    }
}