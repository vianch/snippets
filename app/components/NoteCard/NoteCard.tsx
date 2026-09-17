import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

/* Components */
import Trash from "@/components/ui/icons/Trash";
import { setNewOffSet, autoGrow, setZIndex } from "@/utils/notes.utils";

import style from "./noteCard.module.css";

type NoteCard = {
	note: NoteData;
};

const NoteCard = ({ note }: NoteCard): React.ReactElement => {
	const [notePosition, setNotePosition] = useState<NotePosition>(
		JSON.parse(note.position)
	);
	const noteBody = JSON.parse(note.body);

	// references
	const cardRef = useRef<HTMLDivElement | null>(null);
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

	const mouseStartPosition = useRef({ x: 0, y: 0 });
	const isDragging = useRef(false);

	const mouseMoveListener = (mouseEvent: MouseEvent): void => {
		if (!isDragging.current) {
			return;
		}

		const mouseMoveDirection = {
			x: mouseEvent.clientX - mouseStartPosition.current.x,
			y: mouseEvent.clientY - mouseStartPosition.current.y,
		};

		setNotePosition((currentPosition) =>
			setNewOffSet(currentPosition, mouseMoveDirection)
		);

		mouseStartPosition.current = {
			x: mouseEvent.clientX,
			y: mouseEvent.clientY,
		};
	};

	const mouseUpListener = (): void => {
		isDragging.current = false;
	};

	const mouseDownEvent = (
		mouseEvent: React.MouseEvent<HTMLDivElement>
	): void => {
		isDragging.current = true;
		mouseStartPosition.current = {
			x: mouseEvent.clientX,
			y: mouseEvent.clientY,
		};

		if (cardRef.current) {
			setZIndex(cardRef.current);
		}
	};

	useEffect(() => {
		document.addEventListener("mousemove", mouseMoveListener);
		document.addEventListener("mouseup", mouseUpListener);

		return () => {
			document.removeEventListener("mousemove", mouseMoveListener);
			document.removeEventListener("mouseup", mouseUpListener);
		};
	}, []);

	useEffect(() => {
		autoGrow(textAreaRef);
	}, []);

	return (
		<div
			ref={cardRef}
			className={style.card}
			style={{ left: notePosition.x, top: notePosition.y }}
		>
			<div
				className={clsx(style.header, style[note.color])}
				onMouseDown={mouseDownEvent}
			>
				<Trash width={16} />
			</div>
			<div className={clsx(style.body, style[note.color])}>
				<textarea
					ref={textAreaRef}
					className={clsx(style.textarea, style[note.color])}
					defaultValue={noteBody}
					onInput={() => autoGrow(textAreaRef)}
					onFocus={() => (cardRef?.current ? setZIndex(cardRef.current) : null)}
				></textarea>
			</div>
		</div>
	);
};

export default NoteCard;
