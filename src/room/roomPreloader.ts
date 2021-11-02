import RoomManager from "managers/RoomManager";
import { v4 as uuidv4 } from 'uuid';
import roomLayout from './roomLayout';

export const setupRoomPlanner = (roomManager: RoomManager, room_spawn: StructureSpawn) => {
	let offsetX = room_spawn.pos.x - 7;
	let offsetY = room_spawn.pos.y - 7;
	let planner = [];
	for (let index = 0; index < Object.keys(roomLayout.buildings).length; index++) {
		const building = Object.keys(roomLayout.buildings)[index];
		const buildingPos = eval(`roomLayout.buildings.${building}`); // rollup-disable-warning-next-line EVAL
		if(buildingPos && buildingPos.pos){
			for (let i = 0; i < buildingPos.pos.length; i++) {
				const pos = buildingPos.pos[i];
				let color;
				switch (building) {
					case 'extension':
						color = 'yellow';
					break;
					case 'tower':
						color = 'red';
					break;
					case 'road':
						color = 'gray';
					break;
					case 'storage':
						color = 'lightblue';
					break;
					case 'link':
						color = 'lightgreen';
					break;
					default:
						break;
				}

				// console.log(JSON.stringify(buildingPos.pos));
				// if((pos.x === 7 && pos.y === 2) || (pos.x === 7 && pos.y === 12) || (pos.x === 13 && pos.y === 7) || (pos.x === 1 && pos.y === 7)){
				// 	color = 'black';
				// }
				planner.push({building: building, pos: pos, main_road: color === 'black' ? true : false, finished_building: false});
				roomManager.room.visual.circle(pos.x + offsetX, pos.y + offsetY, {fill: 'fill', radius: 0.4, stroke: color});
			}
		}
	}
	return planner;
}

export const setupMiningSpots = (roomManager : RoomManager, energy_sources: Array<any>) => {

	const mining_spots = [];
	for (let i = 0; i < energy_sources.length; i++) {
		const source = energy_sources[i] as Source;
		// Find empty spots arround the area
		const terrains = roomManager.room.lookForAtArea(LOOK_TERRAIN,
			source.pos.y - 1,
			source.pos.x - 1,
			source.pos.y + 1,
			source.pos.x + 1
		, true).filter(terrain => terrain.type === "terrain" && terrain.terrain === "plain");

		// Validate if this terrain is usable
		for (let i = 0; i < terrains.length; i++) {
			const terrain = terrains[i];

			const spot : MiningSpot = {
				uuid: uuidv4(),
				pos: {x: terrain.x, y: terrain.y},
				current_miner: 'none'
			}
			mining_spots.push(spot);
		}
	}

	const energyTotal = _.sum(energy_sources, source => source.energyCapacity);
	console.log(`[⚠️][${roomManager.room.name}] Found ${mining_spots.length} mining spots with a total of ${energyTotal} energy, storing them in memory`);
	return mining_spots as Array<MiningSpot>;
}

export const setupPaths = (roomManager : RoomManager, spawn : StructureSpawn, mining_spots : any, planner: Array<any>) => {
	const paths: { path: PathStep[]; mining_spot: string; }[] = []
	let cm = new PathFinder.CostMatrix();

	planner.forEach(plan => {
		cm.set(plan.pos.x, plan.pos.y, 1000);
	});


	mining_spots.forEach((s: { pos: any; uuid: string }) => {
		cm.set(s.pos.x, s.pos.y, 1000);
	});

	planner = planner.filter(item => item.building === 'road' && item.main_road === true);

	for (let index = 0; index < planner.length; index++) {
		const plan = planner[index];

		mining_spots.forEach((source: { pos: any; uuid: string }) => {
			const pos = source.pos as any;


			let path = new RoomPosition(pos.x, pos.y, roomManager.room.name).findPathTo(spawn.pos.x, spawn.pos.y, {costCallback: (roomName, costMatrix) => {
				cm.set(pos.x, pos.y, 1000);
				costMatrix = cm;
				return cm;
			}});
			paths.push({path: path, mining_spot: source.uuid});
		});
		break;
	}
	return paths;
}
