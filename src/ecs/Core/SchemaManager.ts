import World from "../World";

export default class SchemaManager {
    
    private schemaDefinitions : Array<any>;
    private schemaId : number;
    private world: World;
    
    constructor(world: World) {
        
        this.schemaDefinitions = [];
        this.schemaId = 1;
        this.world = world;
    }

    register(schema: any) {

        this.schemaDefinitions[this.schemaId] = schema;

        this.schemaId += 1;

        return this.schemaId - 1;
    }

    generate(schema: any) {

        let component : any;

        if(schema === null) { 
            //this handles tags, might need to be revised
            component = null;
        } else if(typeof schema !== 'function') { 
            //case when the schema is a struct

            component = {};

            let keys = Object.keys(schema);
    
            for(let index = 0; index < keys.length; index ++) {
                
                if(schema[keys[index]] === Array) {
                    component[keys[index]] = [];
                } else if(typeof schema[keys[index]] === 'function') {
                    component[keys[index]] = new (schema[keys[index]] as any)(this.world.maxEntities);
                }
            }    
        } else {
            //case when schema is a single variable.
            if(schema === Array) {
                component = [];
            } else if(typeof schema === 'function'){
                component = new schema(this.world.maxEntities);
            } 
        }
        
        return component;
    }

    get(schemaId: number) {
        return this.schemaDefinitions[schemaId];
    }
}