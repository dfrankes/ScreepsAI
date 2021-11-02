import internal from "stream";

export function panel(title: string, visual: RoomVisual, x: number, y: number, lines?: object, width?: number, height?: number, isList?: boolean){

	// Panel title settings
	const textOffsetX = 0.3;
	const textOffsetY = 0.7;
	const panelLength = width || 10;
	const panelTitleHeight = 1;

	// Draw panel title
	visual.rect(x, y, panelLength, 1, {fill: '#636363'});

	visual.line(x, y, x + panelLength, y, {color: 'orange', width: 0.01});
	visual.line(x, y, x, y + panelTitleHeight, {color: 'orange', width: 0.01})
	visual.line(x + panelLength, y, x + panelLength, y + panelTitleHeight, {color: 'orange', width: 0.01})
	visual.line(x, y + panelTitleHeight, x + panelLength, y + panelTitleHeight, {color: 'orange', width: 0.01});

	visual.text(title, x + textOffsetX + (panelLength / 2), y + textOffsetY, {color: 'white', stroke: '3'});



	// Create body based on lines
	const bodyHeight = height as number || Object.keys(lines as any).length;
	visual.rect(x, y + panelTitleHeight, panelLength, bodyHeight * 1.2, {fill: '#636363'});
	Object.keys(lines as any).forEach((item, index) => {

		if(isList){
			// @ts-ignore
			visual.text(`${lines[item]}`, x + 0.3, y + textOffsetY + (index + 1) * 1.1, {color: 'white', stroke: '3', align: 'left'});
		}else{
			// @ts-ignore
			visual.text(`${lines[item]}`, x + (panelLength - 2), y + textOffsetY + (index + 1) * 1.1, {color: 'white', stroke: '3', align: 'left'});
			visual.text(`${item}`, x + 0.3, y + textOffsetY + (index + 1) * 1.1, {color: 'white', stroke: '3', align: 'left'});
		}
	})
}
