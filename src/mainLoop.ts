/**
 * Screeps AI MainLoop
 * All logic is controlled from this file
 */

import RoomManager from "managers/RoomManager";
export const mainLoop = () => {
	// console.log(`Current game tick is ${Game.time}`);
	for(const roomName in Game.rooms){
		if(!Game.rooms[roomName].controller && !Game.rooms[roomName]?.controller?.my)
			continue;

		new RoomManager(roomName);
	}
}
