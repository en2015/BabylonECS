import World from '../World';
import { QueryType, Type } from '../utilities/Types';
import { PerformanceTester } from './PerformanceTester';



const world = new World(1e6);

const position = world.schemaManager.register({ x: Type.Int8, y: Type.Int8 });
const velocity = world.schemaManager.register({ x: Type.Int8, y: Type.Int8 });
let updateCount = 0;

function movementSystem(world: World) {
  const entities = world.query.getEntities([position, velocity], QueryType.WITH);

  for(let index = entities.length - 1; index >= 0; index --) {
    
    const archeType = world.entityManager.getArcheType(entities[index]);
    archeType.getColumn(position).x[index] += archeType.getColumn(velocity).x[index];
    updateCount += 1;
  }
}

function archMovementSystem(world: World) {
  const archeTypes = world.query.get([position, velocity], QueryType.WITH);

  for(let index = archeTypes.length - 1; index >= 0; index --) {
    
    const archeType = archeTypes[index];

    for(let index = archeType.getEntities().length() - 1; index >= 0; index --) {
      archeType.getColumn(position).x[index] += archeType.getColumn(velocity).x[index];
      updateCount += 1;
    }
  }
}

PerformanceTester.AddRemove(world, position, velocity, archMovementSystem);
// PerformanceTester.Velocity(world, position, velocity, archMovementSystem);
// PerformanceTester.Addition(world, position, velocity);