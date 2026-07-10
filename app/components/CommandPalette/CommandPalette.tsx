"use client";

import { ReactElement, useEffect, useState } from "react";
import { Command } from "cmdk";

import useMenuStore from "@/lib/store/menu.store";

/* Components */
import Book from "@/components/ui/icons/Book";
import Tray from "@/components/ui/icons/Tray";
import Globe from "@/components/ui/icons/Globe";
import Star from "@/components/ui/icons/Star";
import Trash from "@/components/ui/icons/Trash";
import Bookmark from "@/components/ui/icons/Bookmark";
import Settings from "@/components/ui/icons/Settings";
import NewFile from "@/components/ui/icons/NewFile";
import LanguageBadge from "@/components/ui/LanguageBadge/LanguageBadge";

/* Styles */
import styles from "./commandPalette.module.css";

type CommandPaletteProps = {
	snippets: Snippet[];
	tags: TagItem[];
	onActiveSnippet: (snippetId: UUID) => void;
	onNewSnippet: () => void;
	onGetAll: () => void;
	onGetUncategorized: () => void;
	onGetPublic: () => void;
	onGetFavorites: () => void;
	onGetTrash: () => void;
	onTagClick: (tag: string) => void;
	onAccountClick: () => void;
};

const CommandPalette = ({
	snippets,
	tags,
	onActiveSnippet,
	onNewSnippet,
	onGetAll,
	onGetUncategorized,
	onGetPublic,
	onGetFavorites,
	onGetTrash,
	onTagClick,
	onAccountClick,
}: CommandPaletteProps): ReactElement => {
	const open = useMenuStore((store) => store.commandPaletteOpen);
	const setCommandPaletteOpen = useMenuStore(
		(store) => store.setCommandPaletteOpen
	);
	const toggleCommandPalette = useMenuStore(
		(store) => store.toggleCommandPalette
	);
	const [isMac, setIsMac] = useState<boolean>(true);

	useEffect(() => {
		setIsMac(window.navigator.userAgent.includes("Mac"));
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault();
				toggleCommandPalette();
			}

			const isMacPlatform = window.navigator.userAgent.includes("Mac");
			const newSnippetModifier = isMacPlatform
				? event.metaKey && !event.ctrlKey
				: event.ctrlKey && !event.metaKey;

			if (newSnippetModifier && event.code === "KeyM") {
				event.preventDefault();
				setCommandPaletteOpen(false);
				onNewSnippet();
			}
		};

		document.addEventListener("keydown", handleKeyDown, true);

		return () => document.removeEventListener("keydown", handleKeyDown, true);
	}, [onNewSnippet, setCommandPaletteOpen, toggleCommandPalette]);

	const runAction = (action: () => void): void => {
		setCommandPaletteOpen(false);
		action();
	};

	return (
		<Command.Dialog
			open={open}
			onOpenChange={setCommandPaletteOpen}
			label="Command palette"
			className={styles.dialog}
			overlayClassName={styles.overlay}
			contentClassName={styles.content}
		>
			<Command.Input
				placeholder="Search snippets, run a command..."
				className={styles.input}
			/>

			<Command.List className={styles.list}>
				<Command.Empty className={styles.empty}>
					No results found.
				</Command.Empty>

				<Command.Group heading="Actions" className={styles.group}>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onNewSnippet)}
					>
						<NewFile width={16} height={16} />
						<span>New snippet</span>
						<span className={styles.shortcut}>{isMac ? "⌘" : "Ctrl"} m</span>
					</Command.Item>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onAccountClick)}
					>
						<Settings width={16} height={16} />
						<span>Open settings</span>
					</Command.Item>
				</Command.Group>

				<Command.Group heading="Navigate" className={styles.group}>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onGetAll)}
					>
						<Book width={16} height={16} />
						<span>All snippets</span>
					</Command.Item>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onGetUncategorized)}
					>
						<Tray width={16} height={16} />
						<span>Uncategorized</span>
					</Command.Item>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onGetPublic)}
					>
						<Globe width={16} height={16} />
						<span>Public</span>
					</Command.Item>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onGetFavorites)}
					>
						<Star width={16} height={16} />
						<span>Favorites</span>
					</Command.Item>
					<Command.Item
						className={styles.item}
						onSelect={() => runAction(onGetTrash)}
					>
						<Trash width={16} height={16} />
						<span>Trash</span>
					</Command.Item>
				</Command.Group>

				{tags.length > 0 && (
					<Command.Group heading="Tags" className={styles.group}>
						{tags.map((tag) => (
							<Command.Item
								key={tag.name}
								value={`tag-${tag.name}`}
								className={styles.item}
								onSelect={() => runAction(() => onTagClick(tag.name))}
							>
								<Bookmark width={16} height={16} />
								<span>{tag.name}</span>
								<span className={styles.count}>{tag.total}</span>
							</Command.Item>
						))}
					</Command.Group>
				)}

				{snippets.length > 0 && (
					<Command.Group heading="Jump to snippet" className={styles.group}>
						{snippets.map((snippet) => (
							<Command.Item
								key={snippet.snippet_id}
								value={`snippet-${snippet.snippet_id}-${snippet.name}`}
								className={styles.item}
								onSelect={() =>
									runAction(() => onActiveSnippet(snippet.snippet_id))
								}
							>
								<span className={styles.snippetName}>
									{snippet.name || "Untitled"}
								</span>
								<LanguageBadge language={snippet.language} />
							</Command.Item>
						))}
					</Command.Group>
				)}
			</Command.List>

			<div className={styles.footer}>
				<kbd className={styles.kbd}>↑↓</kbd>
				<span>navigate</span>
				<kbd className={styles.kbd}>↵</kbd>
				<span>select</span>
				<kbd className={styles.kbd}>esc</kbd>
				<span>close</span>
			</div>
		</Command.Dialog>
	);
};

export default CommandPalette;
