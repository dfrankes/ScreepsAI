import * as roomStages from 'roomStages/roomStages';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';


import CollectorType from 'workers/type.collector';
import TransporterType from 'workers/type.transporter'


import {setupPaths, setupMiningSpots, setupRoomPlanner} from 'room/roomPreloader';
import {panel} from 'utils/UI';

interface RoomState {
	test: Boolean
}

export default class {

	room : Room;
	roomState : RoomMemory;
	spawn_queue: Array<SpawnQueue>;
	logs: Array<any>;

	constructor(roomName: string){
		this.room = Game.rooms[roomName];
		this.roomState = Memory.rooms[roomName] as RoomMemory || {} as RoomMemory;
		this.spawn_queue = this.roomState?.spawn_queue || [];
		this.logs = this.roomState.logs || [];
		console.log(this.logs);

		const controller : any = this.room.find(FIND_MY_STRUCTURES, {filter: { structureType: STRUCTURE_CONTROLLER }})
		const spawn = this.room.find(FIND_MY_SPAWNS).filter(spawn => spawn.name === "Spawn1")[0] as StructureSpawn;
		const energy_sources = this.room.find(FIND_SOURCES);

		if(this.logs.length >= 5){
			this.logs = [];
		}


		panel("Screeps ChainBot", this.room.visual, 1, 1, {
			'Current Room': this.room.name,
			'Current RCL': this.room.controller?.level,
			'Room Step': '1/10'
		}, 10);

		panel("Game Info", this.room.visual, 1, 6, {
			'Game Tick': Game.time
		}, 10);

		panel("Last logs", this.room.visual, 12, 1, this.logs, 11, 5, true);

		// Create roads based on build_planner
		// if(!this.roomState.mining_spots && !this.roomState.mining_paths && !this.roomState.room_planner){

			const room_planner = setupRoomPlanner(this, spawn);
			const mining_spots = setupMiningSpots(this, energy_sources)
			const mining_paths = setupPaths(this, spawn, mining_spots, room_planner);

			this.roomState.mining_paths = mining_paths;
			this.roomState.mining_spots = mining_spots;
			this.roomState.room_planner = room_planner;
		// }

		// Debugg paths and stuff
		for (let index = 0; index < this.roomState.mining_paths.length; index++) {
			const mining_path = this.roomState.mining_paths[index];

			mining_path.path.forEach((path: { x: number; y: number; }) => {
				this.room.visual.circle(path.x, path.y, {fill: 'transparent', radius: 0.2, stroke: 'green'});
			})
		}

		for (let index = 0; index < this.roomState.mining_spots.length; index++) {
			let spot = this.roomState.mining_spots[index] as any;
			this.room.visual.circle(spot.pos.x, spot.pos.y, {fill: 'fill', radius: 0.5, stroke: 'blue'});
		}

		// Build containers based on mining_spots
		if(this.room.controller?.level){
			const maxContainers = CONTROLLER_STRUCTURES['container'][this.room.controller?.level];
		}


		// Build items from mining_spots and mining_paths queue
		for (let index = 0; index < this.roomState.mining_spots.length; index++) {
			let spot = this.roomState.mining_spots[index] as any;
			this.room.visual.circle(spot.pos.x, spot.pos.y, {fill: 'fill', radius: 0.5, stroke: 'blue'});
		}



		// for (let index = 0; index < Test.buildings.extension.pos.length; index++) {
		// 	const pos = Test.buildings.extension.pos[index];

		// 	let offsetX = spawn.pos.x - 7;
		// 	let offsetY = spawn.pos.y - 7;

		// 	this.room.visual.circle(pos.x + offsetX, pos.y + offsetY, {fill: 'fill', radius: 0.5, stroke: 'orange'});
		// }

		// for (let index = 0; index < Test.buildings.tower.pos.length; index++) {
		// 	const pos = Test.buildings.tower.pos[index];

		// 	let offsetX = spawn.pos.x - 7;
		// 	let offsetY = spawn.pos.y - 7;

		// 	this.room.visual.circle(pos.x + offsetX, pos.y + offsetY, {fill: 'fill', radius: 0.5, stroke: 'pink'});
		// }

		// for (let index = 0; index < Test.buildings.link.pos.length; index++) {
		// 	const pos = Test.buildings.link.pos[index];

		// 	let offsetX = spawn.pos.x - 7;
		// 	let offsetY = spawn.pos.y - 7;

		// 	this.room.visual.circle(pos.x + offsetX, pos.y + offsetY, {fill: 'fill', radius: 0.5, stroke: 'pink'});
		// }

		// for (let index = 0; index < Test.buildings.link.pos.length; index++) {
		// 	const pos = Test.buildings.link.pos[index];

		// 	let offsetX = spawn.pos.x - 7;
		// 	let offsetY = spawn.pos.y - 7;

		// 	this.room.visual.circle(pos.x + offsetX, pos.y + offsetY, {fill: 'fill', radius: 0.5, stroke: 'pink'});
		// }

		// let checkerboard = [];
		// let c = 1;
		// checkerboard.push(
		// 	[x -c, y - c],	// TL
		// 	[x, y - c],		// TC
		// 	[x + c, y - c],	// TR

		// 	[x -c, y],		// CL
		// 	[x, y],			// CC
		// 	[x + c, y],		//CR

		// 	[x - c, y + c],	// BL
		// 	[x, y + c],		// BC
		// 	[x + c, y + c]	// BR
		// )

		// checkerboard.forEach(point => {
		// 	this.room.visual.circle(point[0], point[1], {fill: 'fill', radius: 0.5, stroke: 'purple'});
		// })


		// // x-=1;y-=1;
		// checkerboard = [];
		// c = 2;
		// checkerboard.push(
		// 	[x -c, y - c],	// TL
		// 	[x, y - c],		// TC
		// 	[x + c, y - c],	// TR

		// 	[x -c, y],		// CL
		// 	[x, y],			// CC
		// 	[x + c, y],		//CR

		// 	[x - c, y + c],	// BL
		// 	[x, y + c],		// BC
		// 	[x + c, y + c]	// BR
		// )

		// checkerboard.forEach(point => {
		// 	this.room.visual.circle(point[0], point[1], {fill: 'fill', radius: 0.5, stroke: 'purple'});
		// })


		// checkerboard = [];
		// c = 1;
		// checkerboard.push(
		// 	[x -c, y - c],	// TL
		// 	[x, y - c],		// TC
		// 	[x + c, y - c],	// TR

		// 	[x -c, y],		// CL
		// 	[x, y],			// CC
		// 	[x + c, y],		//CR

		// 	[x - c, y + c],	// BL
		// 	[x, y + c],		// BC
		// 	[x + c, y + c]	// BR
		// )

		// checkerboard.forEach(point => {
		// 	this.room.visual.circle(point[0] + c, point[1] + c, {fill: 'fill', radius: 0.5, stroke: 'purple'});
		// })


		// for (let c = 0; c <= 10; c++) {
		// 	let points = [];

		// 	points.push(
		// 		[x -c, y - c],	// TL
		// 		[x, y - c],		// TC
		// 		[x + c, y - c],	// TR

		// 		[x -c, y],		// CL
		// 		[x, y],			// CC
		// 		[x + c, y],		//CR

		// 		[x - c, y + c],	// BL
		// 		[x, y + c],		// BC
		// 		[x + c, y + c]	// BR
		// 	)

		// 	points.forEach((point, index) => {
		// 		console.log(index % 2 === 0);

		// 		if(index % 2 === 0){
		// 			this.room.visual.circle(point[0], point[1], {fill: 'fill', radius: 0.5, stroke: 'purple'});
		// 		}

		// 	})
		// 	console.log("===================");

		// 	//

		// }
		// let path = PathFinder.search(spawn.pos, ( { pos: spawn.pos, range: 10, heuristicWeight: Math.floor(Math.random() * 100) } as any), {flee: true});
		// path.path.forEach((p, i) => {
		// 	if(i % 2 === 1)
		// 		this.room.visual.circle(p.x, p.y, {fill: 'fill', radius: 0.5, stroke: 'purple'});
		// })



		//const tileType = Game.map.getRoomTerrain(roomName).get(x,y);


		// Prepair the mining spots.
		//this.createMiningSpots();

		//this.runQueue();
		//this.createCollectors();
		//this.runCollectors();

		// this.createBuilders();

		// this.distanceTransform(roomName);

		// Every room needs collectors and transpoters
		// So we define this logic in the base class

		// Get bodyPart cost so we can calculate how many workers we can have and how many parts they can hold
		// const bodypart_cost = BODYPART_COST;

		// this.roomState.spawn_queue = this.spawn_queue;
		// this.roomState.logs = this.logs;
		Memory.rooms[roomName] = this.roomState;
	}






	findRoleInQueue(role: string){
		return _.findWhere(this.spawn_queue, {role: role});
	}


	/**
	 * Handles all the queue stuff
	 * Here we will split our queue over all the avaliable spawners that are currently waiting for a job
	 */
	runQueue(){
		const freeSpawners = this.room.find(FIND_MY_SPAWNS).filter(spawn => !spawn.spawning);
		this.room.visual.text(`[⚠️][${this.room.name}] ${this.spawn_queue.length} items in queue, ${freeSpawners.length} spawner(s) waiting for queue`, 1, 49, {align: 'left'});

		const items_to_remove = this.spawn_queue.filter(item => (item && item.removeOnTick ? Game.time >= item.removeOnTick : false));

		for (let i = 0; i < items_to_remove.length; i++) {
			const item = items_to_remove[i];
			let index = _.findIndex(this.spawn_queue, (spawn) => spawn.uuid === item.uuid);
			this.spawn_queue = this.spawn_queue.splice(index, 0);
		}

		// Sort queue by priority
		const queue = this.spawn_queue.sort(item => item.priority).filter(item => !item.removeOnTick ? true : false);
		if(queue.length > 0){
			for (let i = 0; i < freeSpawners.length; i++) {
				const spawn = freeSpawners[i];
				let queue_item = _.first(queue);

				let body = queue_item?.body as unknown as typeof BODYPARTS_ALL;
				if(body){
					let bodyCost = 0;
					for (let index = 0; index < body.length; index++) {
						const part = body[index];
						bodyCost += BODYPART_COST[part];
					}
					if(bodyCost <= spawn.store.energy){
						const sw = spawn.spawnCreep(body, queue_item.name, {memory: {role: queue_item.role, room: this.room.name, working: false}});

						const spawn_time = body.length * 3;
						const willFinishAtTick = Game.time + spawn_time;
						this.spawn_queue[queue.findIndex(item => item.uuid === queue_item.uuid)].removeOnTick = willFinishAtTick;
					}
				}
			}
		}
	}

	/**
	 * This function creates our collectors and transporters
	 */
	createCollectors(){
		const collectors = this.room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role === 'collector'});
		const transpoters = this.room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role === 'transporter'});
		if(!this.spawn_queue) this.spawn_queue = [];

		// Room doesnt have any collectors
		if(collectors.length < CollectorType.min_per_room && !this.findRoleInQueue('collector')){
			const collector : SpawnQueue = {uuid: uuidv4(),body: CollectorType.min_parts, name: `${Game.time}`,role: 'collector',priority: 0};
			this.spawn_queue.push(collector);
		}

		// Room doesnt have transporters
		if(transpoters.length < TransporterType.min_per_room && !this.findRoleInQueue('transporter')){
			const transpoter : SpawnQueue = {uuid: uuidv4(),body: TransporterType.min_parts,name: `${Game.time}`,role: 'transporter',priority: 0};
			this.spawn_queue.push(transpoter);
		}
	}

	runCollectors(){
		const collectors = this.room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role === 'collector'});
		const transpoters = this.room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role === 'transporter'});
		collectors.forEach(worker => {


			// Find empty mining spot for collector if it doesnt have it already
			if(!worker.memory.working && !worker.memory.mining_spot && worker.memory.mining_spot !== 'undefined'){
				const empty_spots = this.roomState?.mining_spots.filter(spot => spot.current_miner === 'none');
				if(empty_spots.length > 0){
					// Get first mining spot
					const collector_spot = _.first(empty_spots);
					const collector_index = _.findIndex(this.roomState.mining_spots, {uuid : collector_spot.uuid});

					if(collector_index > -1){
						this.roomState.mining_spots[collector_index].current_miner = worker.id;
						worker.memory.mining_spot = this.roomState.mining_spots[collector_index].uuid;
					}
				}
			}

			// Do collector stuff
			if(worker.memory.mining_spot){

				const spot = _.findWhere(this.roomState.mining_spots, {uuid: worker.memory.mining_spot}) as MiningSpot;
				const pos = spot.pos as any;


				if(pos.x !== worker.pos.x || pos.y !== worker.pos.y){
					worker.moveTo((spot.pos as any).x, (spot.pos as any).y, {visualizePathStyle: {stroke: 'green'}})
				}

				var sourcess = worker.pos.findClosestByRange(worker.room.find(FIND_SOURCES)) as Source
				const doCollect = worker.harvest(sourcess);
				if(doCollect === 0){
					// worker.say('Collecting');
				}
			}


			if(worker.ticksToLive && worker.ticksToLive <= 1){
				let spot = this.roomState.mining_spots[_.findIndex(this.roomState.mining_spots, {uuid: worker.memory.mining_spot})]
				spot.current_miner = 'none';
				worker.memory.mining_spot = 'undefined';
				console.log("Cleared spawning spot");
			}

		})


		transpoters.forEach(worker => {

			const maxCap = worker.store.getCapacity();
			const usedCap = worker.store.getUsedCapacity();
			console.log(maxCap, usedCap);

			let structures = this.room.find(FIND_MY_STRUCTURES, {
				filter: function (obj) {
					return (obj as any).energy < (obj as any).energyCapacity;;
				}
			});


			if(usedCap === 0 && worker.memory.working === false){
				worker.say('COLLECTING');

				worker.memory.working = true;
				const source = worker.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (item : Resource) => item.amount > 50});
				if(worker.pickup(source as Resource) === ERR_NOT_IN_RANGE){
                    worker.moveTo(source as Resource, {visualizePathStyle: {stroke: '#ff3300'}});
                }
			}

			if(usedCap === maxCap){
				worker.memory.working = false;
			}

			if(usedCap === maxCap){
				// Store energy


				if(worker.transfer(structures[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
					worker.say('E_STORE');
					worker.moveTo(structures[0], {visualizePathStyle: {stroke: '#ff3300'}});
				}else{
					// Move away from spot
					worker.say('E_N_STORE')
                    if(worker.upgradeController(this.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
                        worker.moveTo(this.room.controller as StructureController, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
				}
			}



			// const droppedEnergy = this.room.findClosestByPath(FIND_DROPPED_RESOURCES, {filter: (item : Resource) => {

			// 	console.log(JSON.stringify(item.room));

			// 	item.resourceType === RESOURCE_ENERGY && item.amount > 300
			// }});
			// console.log(JSON.stringify(droppedEnergy), 'dsdd');

			// var dropenergy = worker.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
			// 	filter: (d) => {return (d.mineralType == RESOURCE_ENERGY)}});
			// 	if (dropenergy) {
			// 	if (worker.pickup(dropenergy) == ERR_NOT_IN_RANGE) {
			// 		worker.moveTo(dropenergy)
			// 	}
			// 	}
			// }
			// let structures = this.room.find(FIND_MY_STRUCTURES, {
			// 	filter: function (obj) {
			// 		return (obj as any).energy < (obj as any).energyCapacity;;
			// 	}
			// });

			// if(structures.length === 0){
			// 	// upgrade
			// 	worker.say('E_UPGRADE');
			// 	if(worker.upgradeController(this.room.controller as StructureController) == ERR_NOT_IN_RANGE) {
			// 		worker.moveTo((this.room.controller as StructureController).pos.x, (this.room.controller as StructureController).pos.y, {visualizePathStyle: {stroke: '#ffffff'}});
			// 	}
			// }else{
			// 	worker.say('E_STORE');

			// }

		})
	}

	distanceTransform(roomName: string) {
		const costMatrix = new PathFinder.CostMatrix();
		let visual = new RoomVisual(roomName);


		const roomSpawners = this.room.find(FIND_MY_SPAWNS);

		roomSpawners.forEach(spawn => {


			// Create a hex pattern around spawn
			let points = [];
			let x = spawn.pos.x;
			let y = spawn.pos.y;
			for (let c = 1; c <= 2; c++) {

				points.push([
					[x -c, y - c],	// TL
					[x, y - c],		// TC
					[x + c, y - c],	// TR

					[x -c, y],		// CL
					[x + c, y],		//CR

					[x - c, y + c],	// BL
					[x, y + c],		// BC
					[x + c, y + c],	// BR
				]);
			}

			points.forEach(point => {
				point.forEach(p => {
					visual.circle(p[0], p[1], {radius:0.5, fill: 'green'});
				})
			})


		})

		// const mapSize = [50,50];
		// for (let y = 0; y < mapSize[0]; y++) {
		// 	for (let x = 0; x < mapSize[1]; x++) {
		// 		const tileType = Game.map.getRoomTerrain(roomName).get(x,y);

		// 		// Terrrain is a wall, we wont be able to walk here
		// 		if(tileType === TERRAIN_MASK_WALL){
		// 			visual.circle(x, y, {radius:0.5, fill: '#ff3333'});
		// 		}

		// 		const roomExits = this.room.find(FIND_EXIT);


		// 		const minClearance = 3;
		// 		let borderCheck = [];
		// 		for (let c = 1; c <= minClearance; c++) {
		// 			borderCheck.push(

		// 				Game.map.getRoomTerrain(roomName).get(x -c, y - c), 	// TL
		// 				Game.map.getRoomTerrain(roomName).get(x, y - c), 		// TC
		// 				Game.map.getRoomTerrain(roomName).get(x + c, y - c), 	// TR

		// 				Game.map.getRoomTerrain(roomName).get(x -c, y), 		// CL
		// 				Game.map.getRoomTerrain(roomName).get(x + c, y), 		// CR

		// 				Game.map.getRoomTerrain(roomName).get(x - c, y + c),    // BL
		// 				Game.map.getRoomTerrain(roomName).get(x, y + c),		// BC
		// 				Game.map.getRoomTerrain(roomName).get(x + c, y + c),     // BR,


		// 				roomExits.findIndex(exit => exit.x === x - c && exit.y === y -c) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,
		// 				roomExits.findIndex(exit => exit.x === x && exit.y === y -c) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,
		// 				roomExits.findIndex(exit => exit.x === x + c && exit.y === y - c) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,

		// 				roomExits.findIndex(exit => exit.x === x -c && exit.y === y) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,
		// 				roomExits.findIndex(exit => exit.x === x +c && exit.y === y) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,

		// 				roomExits.findIndex(exit => exit.x === x - c && exit.y === y +c) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,
		// 				roomExits.findIndex(exit => exit.x === x && exit.y === y +c) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,
		// 				roomExits.findIndex(exit => exit.x === x +c && exit.y === y +c) > -1 ? TERRAIN_MASK_WALL : TERRAIN_MASK_SWAMP,

		// 			);
		// 		}
		// 		borderCheck = borderCheck.filter(border => border === TERRAIN_MASK_WALL || border === -1);

		// 		// Check if not an exit or close to a exit
		// 		// const notExit = roomExits.findIndex(exit => exit.x === x && exit.y === y);

		// 		if(borderCheck.length === 0 && tileType !== TERRAIN_MASK_WALL){
		// 			visual.circle(x, y, {radius:0.5, fill: 'green'});
		// 		}

		// 		// if(x > this.roomState.debugStepSize)
		// 			// break;


		// 		// // Check if tile is not next to a wall
		// 		// let top = Game.map.getRoomTerrain(roomName).get(x + 1,y + 1);
		// 		// let bottom = Game.map.getRoomTerrain(roomName).get(x + -1, y - 1);
		// 		// let left = Game.map.getRoomTerrain(roomName).get(x - 1, y);
		// 		// let right = Game.map.getRoomTerrain(roomName).get(x, y - 1);

		// 		// let lefta = Game.map.getRoomTerrain(roomName).get(x + 1, y);
		// 		// let rightb = Game.map.getRoomTerrain(roomName).get(x, y + 1);

		// 		// if(top === TERRAIN_MASK_WALL || bottom === TERRAIN_MASK_WALL || left === TERRAIN_MASK_WALL || right === TERRAIN_MASK_WALL){
		// 		// 	// visual.circle(x, y, {radius:0.5, fill: 'purple'});
		// 		// }else if(tileType !== TERRAIN_MASK_WALL){
		// 		// 	visual.circle(x, y, {radius:0.5, fill: 'green'});
		// 		// }



		// 		// visual.circle(x + 1,y, {radius:0.5, fill: 'blue'});

		// 		// break
		// 		// Terrain is exit
		// 	}
		// }
		return costMatrix;
	}


}
