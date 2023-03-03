import { CacheResult, QueryType } from "../utilities/Types";
import World from "../World";

export default class Query {

    private world: World;
    private archeTypeCache : Map<string, any>;
    private entitiesCache : Map<string, any>;

    constructor(world: World) {
        this.world = world;
        this.archeTypeCache = new Map<string, CacheResult>();
        this.entitiesCache = new Map<string, CacheResult>();
    }

    get(componentDefinitions: Array<number>, queryType: QueryType, mask: Uint16Array | null | Array<number> = null) {
       
        if(!mask) {
            mask = this.getMask(componentDefinitions);
        }

        const maskString = mask.join(",");
        
        const archsInCache = this.archeTypeCache.get(maskString + queryType);

        if(archsInCache && !archsInCache.isDirty) {
            return archsInCache;
        }

        let result: any = [];

        if(queryType === QueryType.WITH) {
            result = this.world.archeTypeManager.getWithComponents(mask);
        } else if(queryType === QueryType.WITHOUT) {
            result = this.world.archeTypeManager.getWithoutComponents(mask);
        }  else if(queryType === QueryType.ONLY) {
            result = [this.world.archeTypeManager.get(maskString)];
        }
        
        if(archsInCache) {
            archsInCache.isDirty = false;
            archsInCache.result = result;
        } else {
            this.archeTypeCache.set(maskString, {isDirty: false, result: result});
        }

        return result;
    }

    getEntities(componentDefinitions: Array<number>, queryType: QueryType) {

        const mask = this.getMask(componentDefinitions);
        const maskString = mask.join(",");
        
        const entsInCache: CacheResult = this.entitiesCache.get(maskString + queryType);

        if(entsInCache && !entsInCache.isDirty) {
           return this.entitiesCache.get(maskString + queryType);
        }

        let archeTypes = [];
        
        const archsInCache: CacheResult = this.archeTypeCache.get(maskString + queryType);

        if(archsInCache && !archsInCache.isDirty) {
            archeTypes = this.archeTypeCache.get(maskString + queryType);
        } else {
            if(queryType === QueryType.WITH) {
                archeTypes = this.get(componentDefinitions, QueryType.WITH);
            } else if(queryType === QueryType.WITHOUT) {
                archeTypes = this.get(componentDefinitions, QueryType.WITHOUT);
            }

            if(archsInCache) {
                archsInCache.isDirty = false;
                archsInCache.result = archeTypes;
            } else {
                this.archeTypeCache.set(maskString, {isDirty: false, result: archeTypes});
            }
        }
        
        if(queryType === QueryType.ONLY) {
            archeTypes = this.get(componentDefinitions, QueryType.ONLY); 

            if(entsInCache) {
                entsInCache.isDirty = false;
                entsInCache.result = archeTypes.getEntities().getValues();
            } else {
                this.entitiesCache.set(maskString, {isDirty: false, result: archeTypes.getEntities().getValues()});
            }
            return archeTypes.getEntities().getValues().subarray(0, archeTypes.getEntities().length());
        }

        if (archeTypes.length > 0) {
            
            let length = 0;

            for (let index = 0; index < archeTypes!.length; index++) {
                length += archeTypes[index]!.getEntities().length();
            }

            const entities = new Uint32Array(length);

            let startIndex = 0;

            for (let index = startIndex; index < archeTypes!.length; index++) {
                const archEntities = archeTypes[index]!.getEntities();

                for(let entIndex = 0; entIndex < archeTypes[index]!.getEntities().length(); entIndex ++) {
                    entities[startIndex + entIndex] = archeTypes[index]!.getEntities().getSparseId(entIndex);
                }

                startIndex += archEntities.length();
            }

            if(entsInCache) {
                entsInCache.result = entities;
                entsInCache.isDirty = false;
            } else {
                this.entitiesCache.set(maskString, {isDirty: false, result: entities});
            }
            return entities;
        } else {
            return [];
        }
    }

    private getMask(componentDefinitions: Array<number>) {
        // const mask = new Uint8Array(componentDefinitions.length); //number of components it will have

        // for (let index = 0; index < componentDefinitions.length; index++) {
        //     mask[index] = componentDefinitions[index];
        // }
        return componentDefinitions.sort();
    }

    clearArcheTypeCache() {
        for(let index = 0; index < this.archeTypeCache.size; index ++) {
            this.archeTypeCache.values().next().value.isDirty = true;
        }
    }

    clearEntitiesCache() {
        for(let index = 0; index < this.entitiesCache.size; index ++) {
            this.entitiesCache.values().next().value.isDirty = true;
        }
    }

    clearAllCache() {
        this.clearArcheTypeCache();
        this.clearEntitiesCache();
    }
}