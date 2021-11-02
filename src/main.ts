import {mainLoop} from './mainLoop';

declare global {
	interface AI {
		randomNumber: number;
	}

	interface Memory {
		uuid: number;
		log: any;
	}

	interface MiningSpot {
		uuid: string;
		current_miner: string;
		pos: object;
		has_container?: boolean;
	}


	interface RoomMemory {
		mining_spots: Array<MiningSpot>;
		spawn_queue: Array<SpawnQueue>;
		mining_paths: Array<any>;
		room_planner: Array<any>;
		logs: Array<any>;
	}

	interface SpawnQueue {
		uuid: string;
		body: Array<String>;
		name: string;
		role: string;
		priority: number;
		removeOnTick?: number;
	}

	interface PathStep {
		mining_spot: string;
		has_road?: boolean;
	}

	interface CreepMemory {
		role: string;
		room: string;
		working: boolean;
		mining_spot?: string;
	}

	namespace NodeJS {
		interface Global {
			log: any;
		}
	}
}

export const loop = mainLoop;
