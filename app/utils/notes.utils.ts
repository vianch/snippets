import {
	DefaultNoteSize,
	NewNoteCascadeLength,
	NewNoteCascadeStepPx,
	NewNoteOriginPx,
	NoteResizeAxis,
	NotesColorNames,
	NotesColors,
	NotesZIndex,
} from "@/lib/constants/notes";

/**
 * Applies a pointer movement to the selected resize axes while preserving the minimum note size.
 * @param noteSize - The current dimensions of the note.
 * @param movement - The pointer movement from the resize start.
 * @param resizeAxis - The dimensions that can change.
 * @returns The next note size, clamped to its default dimensions.
 */
export const resizeNote = (
	noteSize: NoteSize,
	movement: NotePosition,
	resizeAxis: NoteResizeAxis
): NoteSize => ({
	height:
		resizeAxis === NoteResizeAxis.Horizontal
			? noteSize.height
			: Math.max(DefaultNoteSize.height, noteSize.height + movement.y),
	width:
		resizeAxis === NoteResizeAxis.Vertical
			? noteSize.width
			: Math.max(DefaultNoteSize.width, noteSize.width + movement.x),
});

/**
 * Checks whether two note sizes have the same dimensions.
 * @param firstSize - The first note size to compare.
 * @param secondSize - The second note size to compare.
 * @returns True when both width and height match.
 */
export const isSameNoteSize = (
	firstSize: NoteSize,
	secondSize: NoteSize
): boolean =>
	firstSize.height === secondSize.height &&
	firstSize.width === secondSize.width;

/**
 * Calculates the new position for a note card after a drag movement,
 * clamping values to prevent the card from moving off-screen.
 *
 * @param card - The current position of the note card.
 * @param mouseMoveDirection - The delta movement from the drag.
 * @returns The new clamped position with non-negative x and y values.
 */
export const setNewOffSet = (
	card: NotePosition,
	mouseMoveDirection: NotePosition
): NotePosition => {
	const offsetLeft = card.x + mouseMoveDirection.x;
	const offsetTop = card.y + mouseMoveDirection.y;

	return {
		x: offsetLeft < 0 ? 0 : offsetLeft,
		y: offsetTop < 0 ? 0 : offsetTop,
	};
};

/**
 * Automatically resizes a textarea's height to fit its content.
 * Resets height to "auto" first, then sets it to the element's scrollHeight.
 *
 * @param textAreaRef - A React ref to the textarea element to resize.
 */
export const autoGrow = (
	textAreaRef: React.RefObject<HTMLTextAreaElement | null>
): void => {
	const { current } = textAreaRef ?? {};

	// resets height
	if (current) {
		current.style.height = "auto";
		current.style.height = `${current.scrollHeight}px`;
	}
};

/**
 * Places the selected note card above the other note cards.
 * @param selectedCard - The note card that should be placed above the others.
 * @returns Nothing.
 */
export const setZIndex = (selectedCard: HTMLDivElement): void => {
	selectedCard.style.zIndex = `${NotesZIndex.Selected}`;

	Array.from(selectedCard.parentElement?.children ?? [])
		.filter(
			(element): element is HTMLDivElement => element instanceof HTMLDivElement
		)
		.forEach((card) => {
			if (card !== selectedCard) {
				card.style.zIndex = `${NotesZIndex.Default}`;
			}
		});
};

/**
 * Picks a note color from the available palette.
 * @param randomFraction - value in [0, 1) choosing the palette slot
 * @returns the chosen note color name
 */
export const pickRandomNoteColor = (randomFraction: number): NoteColorName => {
	const colorIndex = Math.floor(randomFraction * NotesColorNames.length);

	return NotesColorNames[colorIndex] ?? NotesColors.Yellow.name;
};

/**
 * Places a new note on a diagonal cascade so consecutive notes do not fully overlap.
 * @param noteCount - number of notes already on the board
 * @returns the position for the new note
 */
export const getNewNotePosition = (noteCount: number): NotePosition => {
	const cascadeOffset =
		(noteCount % NewNoteCascadeLength) * NewNoteCascadeStepPx;

	return {
		x: NewNoteOriginPx + cascadeOffset,
		y: NewNoteOriginPx + cascadeOffset,
	};
};
