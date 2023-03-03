import { ExecutionTime } from "../utilities/Types";
import World from "../World";

export class SystemManager {

    private world: World;
    private systems: Array<Array<any>>; //to be fixed the type

    constructor(world: World) {
        this.world = world;
        this.systems = [];
    }

    register(system: any, executionTime: ExecutionTime) {

        if (!this.systems[executionTime]) {
            this.systems[executionTime] = [];
        }

        switch (executionTime) {
            case ExecutionTime.BEFORE_RENDER:
                this.systems[executionTime].push(this.world.scene.onBeforeRenderObservable.add(system));
                break;
            case ExecutionTime.POST_RENDER:
                this.systems[executionTime].push(this.world.scene.onAfterRenderObservable.add(system));
                break;
            case ExecutionTime.BEFORE_STEP:
                this.systems[executionTime].push(this.world.scene.onBeforeStepObservable.add(system));
                break;
            case ExecutionTime.POST_STEP:
                this.systems[executionTime].push(this.world.scene.onAfterStepObservable.add(system));
                break;
            case ExecutionTime.KEYBOARD:
                this.systems[executionTime].push(this.world.scene.onKeyboardObservable.add(system));
                break;
            case ExecutionTime.POINTER:
                this.systems[executionTime].push(this.world.scene.onPointerObservable.add(system));
                break;
            case ExecutionTime.WINDOW_MOUSE_DOWN:
                this.systems[executionTime].push(system);
                document.addEventListener("pointerdown", system, false);
                break;
            case ExecutionTime.WINDOW_MOUSE_MOVE:
                this.systems[executionTime].push(system);
                document.addEventListener("pointermove", system, false);
                break;
            case ExecutionTime.WINDOW_MOUSE_UP:
                this.systems[executionTime].push(system);
                document.addEventListener("pointerup", system, false);
                break;
            case ExecutionTime.WINDOW_SCROLL:
                this.systems[executionTime].push(system);
                document.addEventListener("wheel", system, false);
                break;
            case ExecutionTime.SCENE_READY:
                this.systems[executionTime].push(this.world.scene.onReadyObservable.add(system));
                break;
        }
    }

    unregister(system: any, executionTime: ExecutionTime) {

        for (let index = 0; index < this.systems[executionTime].length; index++) {
            if (system === this.systems[executionTime][index]) {
                switch (executionTime) {
                    case ExecutionTime.BEFORE_RENDER:
                        this.world.scene.onBeforeRenderObservable.remove(system);
                        break;
                    case ExecutionTime.POST_RENDER:
                        this.world.scene.onAfterRenderObservable.remove(system);
                        break;
                    case ExecutionTime.BEFORE_STEP:
                        this.world.scene.onBeforeStepObservable.remove(system);
                        break;
                    case ExecutionTime.POST_STEP:
                        this.world.scene.onAfterStepObservable.remove(system);
                        break;
                    case ExecutionTime.KEYBOARD:
                        this.world.scene.onKeyboardObservable.remove(system);
                        break;
                    case ExecutionTime.POINTER:
                        this.world.scene.onPointerObservable.remove(system);
                        break;
                    case ExecutionTime.WINDOW_MOUSE_DOWN:
                        document.removeEventListener("pointerdown", system);
                        break;
                    case ExecutionTime.WINDOW_MOUSE_MOVE:
                        document.removeEventListener("pointermove", system);
                        break;
                    case ExecutionTime.WINDOW_MOUSE_UP:
                        document.removeEventListener("pointerup", system);
                        break;
                    case ExecutionTime.WINDOW_SCROLL:
                        document.removeEventListener("wheel", system);
                        break;
                    case ExecutionTime.SCENE_READY:
                        this.world.scene.onReadyObservable.remove(system);
                        break;
                }
            }
        }
    }
}