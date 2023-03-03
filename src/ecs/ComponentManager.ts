import World from "./World";

export class ComponentManager {
    
    private componentDefinitions : Array<any>;
    private componentId : number;
    private world: World;
    
    constructor(world: World) {
        this.componentDefinitions = [];
        this.componentId = 0;
        this.world = world;
    }
    
    registerComponent(schema: any) {
        
        // const $componentId = Symbol("componentId");

        if(Object.keys(schema).length <= 0) {
            throw "invalid component schema";
        }

        const component : any = {};

        for(let index of Object.getOwnPropertyNames(schema)) {
            
            if(schema[index] === Array) {
                component[index] = [];
            } else if(typeof schema[index] === 'function') {
                component[index] = new (schema[index] as any)(this.world.maxEntities);
            }
        }

        this.componentDefinitions[this.componentId] = component;

        this.componentId += 1;
        console.log(component);

        return component;
    }

    
    getComponentById(componentId: number) {
        return this.componentDefinitions[componentId];
    }
}