# babylon-ecs

entity-component-system for babylonjs


You start by importing the world and Babylon.js. 

import '../../style.css'
import { ArcRotateCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';
import { ExecutionTime, QueryType, Type } from '../utilities/Types';
import World from '../World';


The world class takes the max number of entities as parameter.

const world = new World(10);

You can register components as objects, arrays and single variables from the schemaManager.



const position = world.schemaManager.register({ x: Type.Int8, y: Type.Int8, z: Type.Int8 });

const name = world.schemaManager.register(Type.String);
const health = world.schemaManager.register(Type.Float32);
const rotationY = world.schemaManager.register(Type.Float32);
const camera = world.schemaManager.register(Type.Custom);
const light = world.schemaManager.register(Type.Custom);

const mesh = world.schemaManager.register(Type.Custom);

Entities are numeric identifiers without any data, you can create them from the entityManager.

const entityId = world.entityManager.create();
const entity2Id = world.entityManager.create();
const entity3Id = world.entityManager.create();
const cameraEntity = world.entityManager.create();
const lightEntity = world.entityManager.create();

After registering components, you can apply them to different entities.

// //camera entity
const cameraComponent = world.entityManager.addComponent(cameraEntity, camera, new ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 15, new Vector3(0, 0, 0)));
// //light entity
world.entityManager.addComponent(lightEntity, light, new HemisphericLight("HemiLight", new Vector3(0, 1, 0), world.scene));

// //adding single component to entity
world.entityManager.addComponent(entityId, health, 2000);
world.entityManager.addComponent(entityId, position, 200, 0, 10);


// //setting multiple components to entity
world.entityManager.addComponent(entity2Id, health, 2000);


world.entityManager.setComponents(entity3Id, [position, health, rotationY, mesh]);
world.entityManager.getComponent(entity3Id, mesh)[world.entityManager.getArchTypeId(entity3Id)] = MeshBuilder.CreateBox("box", { size: 2 });
world.entityManager.getComponent(entity3Id, health)[world.entityManager.getArchTypeId(entity3Id)] = 2000.0;


Cloning an entity, clones also it's components.

const entity4 = world.entityManager.clone(entity3Id);

world.entityManager.getComponent(entity4, mesh)[world.entityManager.getArchTypeId(entity4)].position.x = 5;

const entity5 = world.entityManager.clone(entity3Id);

world.entityManager.getComponent(entity5, mesh)[world.entityManager.getArchTypeId(entity5)].position.x = -5;

world.entityManager.removeComponent(entity5, position);


Systems are functions that are registered within Babylon.js when different events happen. 

function destroySystem() {

  //iterating entities directly
  const entities = world.query.getEntities([health], QueryType.WITH);

  for (let index = entities.length - 1; index >= 0; index--) {

    //when iterating entities, you need to retrieve the archeType as you have only their indices.
    const archeType = world.entityManager.getArcheType(entities[index]);

    if (archeType.getColumn(health)[archeType.getEntity(entities[index])] <= 0) {
      console.log("there is a dead entity", entities[index]);
      world.entityManager.destroy(entities[index]);
      // world.systemManager.unregister(rotationSystem);
    }
  }
}

function damageSystem() {

  //getting archetypes and iterating them before entities, generally faster
  const archeTypes = world.query.get([health], QueryType.WITH);

  for (let i = 0; i < archeTypes.length; i++) {

    const archeType = archeTypes[i];

    //for each archetype you can then iterate their entities.
    for (let index = 0; index < archeType.getEntities().length(); index++) {
      archeType.getColumn(health)[index] -= 10;
    }
  }
}

function cameraSystem() {
  const entities = world.query.getEntities([camera], QueryType.ONLY);
}

function rotationSystem() {

  //the only queryType returns a single ArcheType
  const archeType = world.query.get([rotationY, mesh, health, position], QueryType.ONLY);
  
  for (let index = archeType.getEntities().length() - 1; index >= 0; index--) {
    archeType.getColumn(rotationY)[index] += 0.01;
    archeType.getColumn(mesh)[index].rotation.y = archeType.getColumn(rotationY)[index];//archeType.getColumn(rotation)[index]; 
  }
}

function fasterRotationSystem() {

  //the only queryType returns a single ArcheType
  const archeType = world.query.get([rotationY, mesh, health], QueryType.ONLY);
  
  for (let index = archeType.getEntities().length() - 1; index >= 0; index--) {
    archeType.getColumn(rotationY)[index] += 0.05;
    archeType.getColumn(mesh)[index].rotation.y = archeType.getColumn(rotationY)[index];//archeType.getColumn(rotation)[index]; 
  }
}

function initialSystem() {
    console.log("I am being called");
}

After definition, these systems can be registered in the world also with their execution time.

world.systemManager.register(initialSystem, ExecutionTime.SCENE_READY)

function inputSystem() {
    console.log("called");
}

world.systemManager.register(inputSystem, ExecutionTime.POINTER)


world.systemManager.register(destroySystem, ExecutionTime.POST_RENDER);
// world.systemManager.register(cameraSystem);
world.systemManager.register(rotationSystem, ExecutionTime.BEFORE_RENDER);
world.systemManager.register(fasterRotationSystem, ExecutionTime.BEFORE_RENDER);


world.systemManager.register(damageSystem, ExecutionTime.BEFORE_RENDER);

world.initRender();
