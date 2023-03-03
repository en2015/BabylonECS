import World from "../World";

export class PerformanceTester {

  

    static AddRemove(world: World, position: any, velocity: any, movementSystem: any) {
        
        let iterations = 1000000;

        console.time("AddRemove");

        for (let i = 0; i < iterations; i++) {

            PerformanceTester.AddRemoveAction(world, position, velocity, movementSystem);

        }
        console.timeEnd("AddRemove");
    }

    static AddRemoveAction(world: World, position: any, velocity: any, movementSystem: any) {
        const entity1 = world.entityManager.create();
        const entity2 = world.entityManager.create();

        world.entityManager.addComponent(entity1, position);
        world.entityManager.addComponent(entity1, velocity);

        world.entityManager.addComponent(entity2, velocity);
        world.entityManager.addComponent(entity2, position);
       
        movementSystem(world);

        world.entityManager.removeComponent(entity1, position);
        world.entityManager.removeComponent(entity2, position);
       
        movementSystem(world);
        
        world.entityManager.destroy(entity1);
    }

    static Addition(world: World, position: any, velocity: any) {
        
        let iterations = 1000000;

        console.time("Addition");

        for (let i = 0; i < iterations; i++) {

            PerformanceTester.AdditionAction(world, position, velocity);

        }
        console.timeEnd("Addition");
    }

    static AdditionAction(world: World, position: any, velocity: any) {
        const entity1 = world.entityManager.create();

        world.entityManager.addComponent(entity1, position);
        world.entityManager.addComponent(entity1, velocity);
    } 

    static Destroy(world: World, position: any, velocity: any) {
        
        let iterations = 100000;

        console.time("Destroy");

        for (let i = 0; i < iterations; i++) {

            PerformanceTester.DestroyAction(world, position, velocity);

        }
        console.timeEnd("Destroy");
    }

    static DestroyAction(world: World, position: any, velocity: any) {
        const entity1 = world.entityManager.create();

        world.entityManager.addComponent(entity1, position);
        world.entityManager.addComponent(entity1, velocity);

        world.entityManager.destroy(entity1);
    } 

    static Velocity(world: World, position: any, velocity: any, movementSystem: any) {
        
        let iterations = 2000;

        console.time("Velocity");

        for (let i = 0; i < iterations; i++) {

            PerformanceTester.VelocityAction(world, position, velocity, movementSystem);

        }
        console.timeEnd("Velocity");
    }

    static VelocityAction(world: World, position: any, velocity: any, movementSystem: any) {
        const entity1 = world.entityManager.create();

        world.entityManager.addComponent(entity1, position);
        world.entityManager.addComponent(entity1, velocity);

        movementSystem(world);
    } 
    
}