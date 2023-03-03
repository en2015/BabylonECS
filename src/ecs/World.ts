import SchemaManager from "./Core/SchemaManager";
import EntityManager from "./Core/EntityManager";
import ArcheTypeManager from "./Core/ArcheTypeManager";
import Query from "./Core/Query";
import { SystemManager } from "./Core/SystemManager";
import { Engine, Scene } from "@babylonjs/core"

export default class World {

    public maxEntities: number;
    public maxComponentDefinitions: number;

    public entityManager: EntityManager;
    public schemaManager: SchemaManager;
    public archeTypeManager: ArcheTypeManager;
    public systemManager: SystemManager;
    public query: Query;

    public canvas: HTMLCanvasElement;
    public engine: Engine;
    public scene: Scene;

    constructor(maxEntities: number = 1e4) {
        this.maxEntities = maxEntities;
        this.entityManager = new EntityManager(this);
        this.schemaManager = new SchemaManager(this);
        this.archeTypeManager = new ArcheTypeManager(this);
        this.systemManager = new SystemManager(this);
        this.query = new Query(this);

        this.setupBabylon();
    }

    setupBabylon() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        window.onresize = this.onResize;
    }

    
    initRender() {
        this.engine.runRenderLoop(this.renderLoop);
    }

    onResize = () => {
        this.engine.resize();
    }

    renderLoop = () => {
        this.scene.render();
    }
}