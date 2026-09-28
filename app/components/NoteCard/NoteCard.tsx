import { useRef, useEffect, useState } from "react";
import clsx from "clsx";

/* Components */
import Loading from "@/components/ui/icons/Loading";
import Trash from "@/components/ui/icons/Trash";
import {
	NoteSaveDebounceMs,
	NotesStackedLayoutQuery,
} from "@/lib/constants/notes";
import { setNewOffSet, autoGrow, setZIndex } from "@/utils/notes.utils";

import style from "./noteCard.module.css";

type NoteCardProps = {
	autoFocus: boolean;
	note: NoteData;
	onDelete: (noteId: UUID) => Promise<boolean>;
	onUpdate: (noteId: UUID, changes: NoteChanges) => Promise<void>;
};

const NoteCard = ({
	autoFocus,
	note,
	onDelete,
	onUpdate,
}: NoteCardProps): React.ReactElement => {
	const [notePosition, setNotePosition] = useState<NotePosition>(note.position);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [isLeaving, setIsLeaving] = useState<boolean>(false);
	const noteBody = note.body ?? "";

	// references
	const cardRef = useRef<HTMLDivElement | null>(null);
	const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
	const pendingBodySaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const latestPositionRef = useRef<NotePosition>(note.position);

	const mouseStartPosition = useRef({ x: 0, y: 0 });
	const isDragging = useRef(false);
	const hasMovedWhileDragging = useRef(false);

	const saveChanges = (changes: NoteChanges): void => {
		setIsSaving(true);
		onUpdate(note.$id, changes).finally(() => setIsSaving(false));
	};

	const cancelPendingBodySave = (): boolean => {
		const hasPendingBodySave = pendingBodySaveRef.current !== null;

		if (pendingBodySaveRef.current) {
			clearTimeout(pendingBodySaveRef.current);
			pendingBodySaveRef.current = null;
		}

		return hasPendingBodySave;
	};

	const flushPendingBodySave = (): void => {
		if (cancelPendingBodySave()) {
			saveChanges({ body: textAreaRef.current?.value ?? "" });
		}
	};

	const scheduleBodySave = (): void => {
		cancelPendingBodySave();
		pendingBodySaveRef.current = setTimeout(
			flushPendingBodySave,
			NoteSaveDebounceMs
		);
	};

	const textAreaInputHandler = (): void => {
		autoGrow(textAreaRef);
		scheduleBodySave();
	};

	const deleteButtonHandler = (): void => {
		cancelPendingBodySave();
		setIsLeaving(true);
	};

	const cardAnimationEndHandler = (
		animationEvent: React.AnimationEvent<HTMLDivElement>
	): void => {
		const hasLeaveAnimationEnded =
			isLeaving && animationEvent.target === animationEvent.currentTarget;

		if (!hasLeaveAnimationEnded) {
			return;
		}

		onDelete(note.$id).then((isDeleted) => {
			if (!isDeleted) {
				setIsLeaving(false);
			}
		});
	};

	const mouseMoveListener = (mouseEvent: MouseEvent): void => {
		if (!isDragging.current) {
			return;
		}

		const mouseMoveDirection = {
			x: mouseEvent.clientX - mouseStartPosition.current.x,
			y: mouseEvent.clientY - mouseStartPosition.current.y,
		};
		const nextPosition = setNewOffSet(
			latestPositionRef.current,
			mouseMoveDirection
		);

		latestPositionRef.current = nextPosition;
		hasMovedWhileDragging.current = true;
		setNotePosition(nextPosition);

		mouseStartPosition.current = {
			x: mouseEvent.clientX,
			y: mouseEvent.clientY,
		};
	};

	const mouseUpListener = (): void => {
		const hasDroppedAfterMoving =
			isDragging.current && hasMovedWhileDragging.current;

		isDragging.current = false;
		hasMovedWhileDragging.current = false;

		if (hasDroppedAfterMoving) {
			saveChanges({ position: latestPositionRef.current });
		}
	};

	const mouseDownEvent = (
		mouseEvent: React.MouseEvent<HTMLDivElement>
	): void => {
		const isStackedLayout = window.matchMedia(NotesStackedLayoutQuery).matches;

		if (isStackedLayout) {
			return;
		}

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
			flushPendingBodySave();
		};
	}, []);

	useEffect(() => {
		autoGrow(textAreaRef);

		if (autoFocus) {
			textAreaRef.current?.focus();
		}
	}, []);

	return (
		<div
			ref={cardRef}
			className={clsx(style.card, isLeaving && style.cardLeaving)}
			style={{ left: notePosition.x, top: notePosition.y }}
			onAnimationEnd={cardAnimationEndHandler}
		>
			<div
				className={clsx(style.header, style[note.color])}
				onMouseDown={mouseDownEvent}
			>
				<button
					type="button"
					className={style.deleteButton}
					aria-label="Delete note"
					onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
					onClick={deleteButtonHandler}
				>
					<Trash width={16} height={16} />
				</button>

				{isSaving && <Loading width={16} height={16} />}
			</div>
			<div className={clsx(style.body, style[note.color])}>
				<textarea
					ref={textAreaRef}
					className={clsx(style.textarea, style[note.color])}
					defaultValue={noteBody}
					onInput={textAreaInputHandler}
					onBlur={flushPendingBodySave}
					onFocus={() => (cardRef?.current ? setZIndex(cardRef.current) : null)}
				></textarea>
			</div>
		</div>
	);
};

export default NoteCard;
