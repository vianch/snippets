"use client";

import {
	MouseEvent,
	ReactElement,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

/* Constants */
import {
	AsideScrollThreshold,
	AsideSectionKeys,
	MenuItems,
	MenuPrefixes,
} from "@/lib/constants/core";
import { defaultAvatar } from "@/lib/constants/account";

/* Components */
import AsideItem from "@/components/AsideItem/AsideItem";
import SignOut from "@/components/ui/icons/SignOut";
import Settings from "@/components/ui/icons/Settings";
import DotsThree from "@/components/ui/icons/DotsThree";
import Skeleton from "@/components/ui/Skeleton/Skeleton";
import SkeletonAsideTags from "@/components/ui/Skeleton/SkeletonAsideTags";

/* Lib */
import supabase from "@/lib/supabase/client";
import useMenuStore from "@/lib/store/menu.store";
import useViewPortStore from "@/lib/store/viewPort.store";
import useUserStore from "@/lib/store/user.store";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { getUserDataFromSession } from "@/lib/supabase/queries";
import { isValidTheme, ThemeName, ThemeNames } from "@/lib/config/themes";
import { setCookie } from "@/lib/cookies";
import { themeCookieName } from "@/lib/constants/cookies";

/* Utils */
import { useCloseOutsideCodeEditor } from "@/utils/ui.utils";

/* Components */
import Tray from "@/components/ui/icons/Tray";
import Trash from "@/components/ui/icons/Trash";
import Book from "@/components/ui/icons/Book";
import Bookmark from "@/components/ui/icons/Bookmark";
import Folder from "@/components/ui/icons/Folder";
import Floppy from "@/components/ui/icons/Floppy";
import MagnifyingGlass from "@/components/ui/icons/MagnifyingGlass";
import Star from "@/components/ui/icons/Star";
import Loading from "@/components/ui/icons/Loading";
import List from "@/components/ui/icons/List";
import Rows from "@/components/ui/icons/Rows";
import CaretDown from "@/components/ui/icons/CaretDown";
import Globe from "@/components/ui/icons/Globe";
import Keyboard from "@/components/ui/icons/Keyboard";
import Sparkle from "@/components/ui/icons/Sparkle";
import ShieldCheck from "@/components/ui/icons/ShieldCheck";
import ShortcutsModal from "@/components/ShortcutsModal/ShortcutsModal";

/* Styles */
import styles from "./aside.module.css";

type AsideProps = {
	isLoading: boolean;
	codeEditorStates: SnippetEditorStates;
	tags: TagItem[];
	folders: TagItem[];
	smartGroups: SmartGroup[];
	publicCount: number;
	allCount: number;
	uncategorizedCount: number;
	favoritesCount: number;
	onGetAll: () => void;
	onGetUncategorized: () => void;
	onGetPublic: () => void;
	onGetFavorites: () => void;
	onGetTrash: () => void;
	onTagClick: (tag: string) => void;
	onFolderClick: (folder: string) => void;
	onSmartGroupClick: (group: SmartGroup) => void;
	onSmartGroupRemove: (name: string) => void;
	onAccountClick: () => void;
};

const Aside = ({
	isLoading,
	codeEditorStates,
	tags,
	folders,
	smartGroups,
	publicCount,
	allCount,
	uncategorizedCount,
	favoritesCount,
	onGetFavorites,
	onGetAll,
	onGetUncategorized,
	onGetPublic,
	onGetTrash,
	onTagClick,
	onFolderClick,
	onSmartGroupClick,
	onSmartGroupRemove,
	onAccountClick,
}: AsideProps): ReactElement => {
	const { menuType } = codeEditorStates;
	const activeFolderName = menuType?.startsWith(MenuPrefixes.Folder)
		? menuType.slice(MenuPrefixes.Folder.length)
		: null;
	const activeTagName = menuType?.startsWith(MenuPrefixes.Tag)
		? menuType.slice(MenuPrefixes.Tag.length)
		: null;
	const router = useRouter();
	const pathname = usePathname();
	const isOnAiAssistant = pathname?.startsWith("/ai-assistant") ?? false;

	const asideRef = useRef<HTMLDivElement | null>(null);
	const userSectionRef = useRef<HTMLDivElement | null>(null);
	const [isLoginOut, setIsLoginOut] = useState<boolean>(false);
	const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(false);
	const [isFoldersExpanded, setIsFoldersExpanded] = useState<boolean>(true);
	const [isSmartGroupsExpanded, setIsSmartGroupsExpanded] =
		useState<boolean>(true);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
	const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
	const [isMac, setIsMac] = useState<boolean>(true);

	// User store
	const mainMenuOpen = useMenuStore((state) => state.mainMenuOpen);
	const snippetListOpen = useMenuStore((state) => state.snippetListOpen);
	const toggleSnippetList = useMenuStore((state) => state.toggleSnippetList);
	const toggleMainMenu = useMenuStore((state) => state.toggleMainMenu);
	const closeMainMenu = useMenuStore((state) => state.closeMainMenu);
	const closeSnippetList = useMenuStore((state) => state.closeSnippetList);
	const isMobile = useViewPortStore((state) => state.isMobile);
	const userName = useUserStore((state) => state.userName);
	const userAvatar = useUserStore((state) => state.userAvatar);
	const email = useUserStore((state) => state.email);
	const setUserData = useUserStore((state) => state.setUserData);
	const setLoading = useUserStore((state) => state.setLoading);
	const setTheme = useUserStore((state) => state.setTheme);
	const { isAdmin } = useCurrentUser();

	const signOut = async (): Promise<void> => {
		setIsLoginOut(true);

		const { error } = await supabase.auth.signOut();

		// Hard navigation so the proxy re-evaluates auth with the cleared session
		// cookies; a soft router.push can leave the stale page mounted.
		window.location.href = error ? "/login?error=logout_failed" : "/login";
	};

	const openSnippetListMobile = useCallback((): void => {
		if (isMobile) {
			closeMainMenu();
			useMenuStore.setState({ snippetListOpen: true });
		}
	}, [isMobile, closeMainMenu]);

	const clickMenuHandler = (
		event: MouseEvent<HTMLAnchorElement>,
		type: MenuItemType
	): void => {
		event?.preventDefault();

		switch (type) {
			case MenuItems.All:
				onGetAll();
				break;

			case MenuItems.Uncategorized:
				onGetUncategorized();
				break;

			case MenuItems.Public:
				onGetPublic();
				break;

			case MenuItems.Favorites:
				onGetFavorites();
				break;

			case MenuItems.Trash:
				onGetTrash();
				break;

			default:
				break;
		}

		openSnippetListMobile();
	};

	const handlerMobileOpenSnippetList = (): void => {
		closeMainMenu();
		toggleSnippetList();
	};

	const handlerMobileOpenMainMenu = (): void => {
		closeSnippetList();
		toggleMainMenu();
	};

	const handlerTagClick = useCallback(
		(tag: string): void => {
			onTagClick(tag);
			openSnippetListMobile();
		},
		[onTagClick, openSnippetListMobile]
	);

	const handlerFolderClick = useCallback(
		(folder: string): void => {
			onFolderClick(folder);
			openSnippetListMobile();
		},
		[onFolderClick, openSnippetListMobile]
	);

	const toggleTagsExpansion = (): void => {
		const expanded = !isTagsExpanded;

		setIsTagsExpanded(expanded);
		localStorage.setItem(AsideSectionKeys.Tags, String(expanded));
	};

	const toggleFoldersExpansion = (): void => {
		const expanded = !isFoldersExpanded;

		setIsFoldersExpanded(expanded);
		localStorage.setItem(AsideSectionKeys.Folders, String(expanded));
	};

	const toggleSmartGroupsExpansion = (): void => {
		const expanded = !isSmartGroupsExpanded;

		setIsSmartGroupsExpanded(expanded);
		localStorage.setItem(AsideSectionKeys.SmartGroups, String(expanded));
	};

	const handleSettingsClick = (): void => {
		setIsUserMenuOpen(false);
		onAccountClick();
	};

	const handleSignOut = async (): Promise<void> => {
		setIsUserMenuOpen(false);
		await signOut();
	};

	useEffect(() => {
		setLoading(true);
		getUserDataFromSession().then((session) => {
			if (session) {
				const usernameFromEmail = session?.user?.email?.split("@")[0] ?? "";
				const userData = {
					userName: session?.user?.user_metadata?.username ?? usernameFromEmail,
					userAvatar: session.user?.user_metadata?.avatar ?? defaultAvatar,
					email: session?.user?.email ?? null,
				};

				setUserData(userData);

				const savedAutoSave = session?.user?.user_metadata?.auto_save;

				if (savedAutoSave !== undefined) {
					useUserStore.getState().setAutoSave(savedAutoSave);
				}

				const savedTheme = session?.user?.user_metadata?.theme;

				if (savedTheme && isValidTheme(savedTheme as string)) {
					setTheme(savedTheme as ThemeName);
					document.documentElement.dataset.theme = savedTheme as ThemeName;
					setCookie(themeCookieName, savedTheme as ThemeName);
				} else {
					document.documentElement.dataset.theme = ThemeNames.ShadesOfPurple;
					setCookie(themeCookieName, ThemeNames.ShadesOfPurple);
				}
			}

			setLoading(false);
		});
	}, [setUserData, setLoading, setTheme]);

	useEffect(() => {
		setIsMac(window.navigator.userAgent.includes("Mac"));

		const storedTags = localStorage.getItem(AsideSectionKeys.Tags);
		const storedFolders = localStorage.getItem(AsideSectionKeys.Folders);
		const storedSmartGroups = localStorage.getItem(
			AsideSectionKeys.SmartGroups
		);

		if (storedTags !== null) {
			setIsTagsExpanded(storedTags === String(true));
		}

		if (storedFolders !== null) {
			setIsFoldersExpanded(storedFolders === String(true));
		}

		if (storedSmartGroups !== null) {
			setIsSmartGroupsExpanded(storedSmartGroups === String(true));
		}
	}, []);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (event.key === "Escape") {
				setIsUserMenuOpen(false);
			}

			if ((event.metaKey || event.ctrlKey) && event.key === ",") {
				event.preventDefault();
				setIsUserMenuOpen(false);
				onAccountClick();
			}

			if ((event.metaKey || event.ctrlKey) && event.key === "/") {
				event.preventDefault();
				setIsShortcutsOpen((current) => !current);
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onAccountClick]);

	useEffect(() => {
		if (!isUserMenuOpen) return;

		const handleClickOutside = (event: Event): void => {
			if (
				userSectionRef.current &&
				!userSectionRef.current.contains(event.target as Node)
			) {
				setIsUserMenuOpen(false);
			}
		};

		document.addEventListener("click", handleClickOutside);

		return () => document.removeEventListener("click", handleClickOutside);
	}, [isUserMenuOpen]);

	useCloseOutsideCodeEditor(asideRef);

	return (
		<>
			{mainMenuOpen && (
				<div
					className={styles.mobileBackdrop}
					aria-hidden="true"
					onClick={closeMainMenu}
				/>
			)}

			<aside
				id="aside-menu"
				ref={asideRef}
				className={`${styles.container} ${mainMenuOpen ? styles.containerOpen : styles.containerClosed}`}
			>
				<div className={styles.scrollableContent}>
					<section className={styles.section}>
						<a
							className={`${styles.linkItem} green-color ${(menuType === MenuItems.All || menuType === MenuItems.None || !menuType || menuType?.length === 0) && styles.linkItemActive}`}
							onClick={(event: MouseEvent<HTMLAnchorElement>) =>
								clickMenuHandler(event, "all")
							}
						>
							<Book className={styles.icon} width={18} height={18} />
							All Snippets
							<span className={styles.numberOfItems}>{allCount}</span>
						</a>

						<a
							className={`${styles.linkItem} cyan-color ${menuType === MenuItems.Uncategorized && styles.linkItemActive}`}
							onClick={(event: MouseEvent<HTMLAnchorElement>) =>
								clickMenuHandler(event, "uncategorized")
							}
						>
							<Tray className={styles.icon} width={18} height={18} />
							Uncategorized
							<span className={styles.numberOfItems}>{uncategorizedCount}</span>
						</a>

						{publicCount > 0 && (
							<a
								className={`${styles.linkItem} blue-color ${menuType === MenuItems.Public && styles.linkItemActive}`}
								onClick={(event: MouseEvent<HTMLAnchorElement>) =>
									clickMenuHandler(event, "public")
								}
							>
								<Globe className={styles.icon} width={18} height={18} />
								Public
								<span className={styles.numberOfItems}>{publicCount}</span>
							</a>
						)}

						<a
							className={`${styles.linkItem} yellow-color ${menuType === MenuItems.Favorites && styles.linkItemActive}`}
							onClick={(event: MouseEvent<HTMLAnchorElement>) =>
								clickMenuHandler(event, "favorites")
							}
						>
							<Star className={styles.icon} width={18} height={18} />
							Favorites
							<span className={styles.numberOfItems}>{favoritesCount}</span>
						</a>

						<a
							className={`${styles.linkItem} red-color ${menuType === MenuItems.Trash && styles.linkItemActive}`}
							onClick={(event: MouseEvent<HTMLAnchorElement>) =>
								clickMenuHandler(event, "trash")
							}
						>
							<Trash className={styles.icon} height={18} width={18} />
							Trash
						</a>
					</section>

					{!isLoading && smartGroups?.length > 0 && (
						<section className={styles.section}>
							<button
								type="button"
								className={`${styles.title} ${styles.titleClickable} ${styles.titleToggle} cyan-color`}
								aria-expanded={isSmartGroupsExpanded}
								onClick={toggleSmartGroupsExpansion}
							>
								<MagnifyingGlass
									className={styles.icon}
									width={18}
									height={18}
								/>
								Smart Groups
								<CaretDown
									className={`${styles.caretIcon} ${isSmartGroupsExpanded ? styles.caretExpanded : styles.caretCollapsed}`}
									width={12}
									height={12}
								/>
							</button>

							<div
								className={`${styles.collapse} ${isSmartGroupsExpanded ? styles.collapseOpen : ""}`}
								inert={!isSmartGroupsExpanded}
							>
								<div className={styles.collapseInner}>
									<ul>
										{smartGroups.map((group) => (
											<li
												key={`smart-group-${group.name}`}
												className={`${styles.smartGroupItem} ${menuType === `${MenuPrefixes.SmartGroup}${group.name}` ? styles.linkItemActive : ""}`}
												title={group.name}
												onClick={() => onSmartGroupClick(group)}
											>
												<Floppy
													className={styles.icon}
													width={14}
													height={14}
												/>
												<span className={styles.smartGroupName}>
													{group.name}
												</span>
												<button
													type="button"
													className={styles.smartGroupRemove}
													aria-label={`Remove smart group ${group.name}`}
													onClick={(event) => {
														event.stopPropagation();
														onSmartGroupRemove(group.name);
													}}
												>
													×
												</button>
											</li>
										))}
									</ul>
								</div>
							</div>
						</section>
					)}

					{!isLoading && folders?.length > 0 && (
						<section
							className={`${styles.section} ${isFoldersExpanded && folders.length > AsideScrollThreshold ? styles.tagsSection : ""}`}
						>
							<button
								type="button"
								className={`${styles.title} ${styles.titleClickable} ${styles.titleToggle} blue-color`}
								aria-expanded={isFoldersExpanded}
								onClick={toggleFoldersExpansion}
							>
								<Folder className={styles.icon} width={18} height={18} />
								Folders
								<CaretDown
									className={`${styles.caretIcon} ${isFoldersExpanded ? styles.caretExpanded : styles.caretCollapsed}`}
									width={12}
									height={12}
								/>
							</button>

							<div
								className={`${styles.collapse} ${isFoldersExpanded ? styles.collapseOpen : ""}`}
								inert={!isFoldersExpanded}
							>
								<div className={styles.collapseInner}>
									<div
										className={
											folders.length > AsideScrollThreshold
												? styles.tagsListScrollable
												: undefined
										}
									>
										<AsideItem
											active={activeFolderName}
											ItemIcon={Folder}
											items={folders}
											onItemClicked={handlerFolderClick}
										/>
									</div>
								</div>
							</div>
						</section>
					)}

					{isLoading ? (
						<section className={styles.section}>
							<h2 className={`${styles.title} purple-color`}>
								<Bookmark className={styles.icon} width={18} height={18} />
								Tags
							</h2>
							<SkeletonAsideTags />
						</section>
					) : (
						tags?.length > 0 && (
							<section
								className={`${styles.section} ${isTagsExpanded && tags.length > AsideScrollThreshold ? styles.tagsSection : ""}`}
							>
								<button
									type="button"
									className={`${styles.title} ${styles.titleClickable} ${styles.titleToggle} purple-color`}
									aria-expanded={isTagsExpanded}
									onClick={toggleTagsExpansion}
								>
									<Bookmark className={styles.icon} width={18} height={18} />
									Tags
									<CaretDown
										className={`${styles.caretIcon} ${isTagsExpanded ? styles.caretExpanded : styles.caretCollapsed}`}
										width={12}
										height={12}
									/>
								</button>

								<div
									className={`${styles.collapse} ${isTagsExpanded ? styles.collapseOpen : ""}`}
									inert={!isTagsExpanded}
								>
									<div className={styles.collapseInner}>
										<div
											className={
												tags.length > AsideScrollThreshold
													? styles.tagsListScrollable
													: undefined
											}
										>
											<AsideItem
												active={activeTagName}
												items={tags}
												onItemClicked={handlerTagClick}
											/>
										</div>
									</div>
								</div>
							</section>
						)
					)}
				</div>

				<div className={styles.userSection} ref={userSectionRef}>
					<div
						className={`${styles.userMenu} ${isUserMenuOpen ? styles.userMenuOpen : ""}`}
						role="menu"
						aria-label="Account"
					>
						<div className={styles.userMenuHeader}>
							<div className={styles.userMenuName}>{userName}</div>
							{email && <div className={styles.userMenuEmail}>{email}</div>}
						</div>

						<div className={styles.userMenuSep} />

						{isAdmin && (
							<button
								className={styles.userMenuItem}
								role="menuitem"
								onClick={() => {
									setIsUserMenuOpen(false);
									closeMainMenu();
									router.push("/admin");
								}}
							>
								<ShieldCheck
									className={styles.userMenuIco}
									width={16}
									height={16}
								/>
								<span className={styles.userMenuLabel}>Admin</span>
							</button>
						)}

						{isOnAiAssistant ? (
							<button
								className={styles.userMenuItem}
								role="menuitem"
								onClick={() => {
									setIsUserMenuOpen(false);
									closeMainMenu();
									router.push("/snippets");
								}}
							>
								<Book className={styles.userMenuIco} width={16} height={16} />
								<span className={styles.userMenuLabel}>Snippets mode</span>
							</button>
						) : (
							<button
								className={styles.userMenuItem}
								role="menuitem"
								onClick={() => {
									setIsUserMenuOpen(false);
									closeMainMenu();
									router.push("/ai-assistant");
								}}
							>
								<Sparkle
									className={styles.userMenuIco}
									width={16}
									height={16}
								/>
								<span className={styles.userMenuLabel}>AI mode</span>
							</button>
						)}

						<button
							className={styles.userMenuItem}
							role="menuitem"
							onClick={() => {
								setIsUserMenuOpen(false);
								setIsShortcutsOpen(true);
							}}
						>
							<Keyboard className={styles.userMenuIco} width={16} height={16} />
							<span className={styles.userMenuLabel}>Shortcuts</span>
							<span className={styles.userMenuShortcut}>
								{isMac ? "⌘" : "Ctrl"} /
							</span>
						</button>

						<button
							className={styles.userMenuItem}
							role="menuitem"
							onClick={handleSettingsClick}
						>
							<Settings className={styles.userMenuIco} width={16} height={16} />
							<span className={styles.userMenuLabel}>Settings</span>
							<span className={styles.userMenuShortcut}>
								{isMac ? "⌘" : "Ctrl"} ,
							</span>
						</button>

						<button
							className={`${styles.userMenuItem} ${styles.userMenuItemDanger}`}
							role="menuitem"
							onClick={handleSignOut}
						>
							{isLoginOut ? (
								<Loading
									className={styles.userMenuIco}
									width={16}
									height={16}
								/>
							) : (
								<SignOut
									className={styles.userMenuIco}
									width={16}
									height={16}
								/>
							)}
							<span className={styles.userMenuLabel}>Log out</span>
						</button>
					</div>

					{isLoading ? (
						<div className={styles.userCardSkeleton}>
							<Skeleton
								className={styles.userCardAvatarSkeleton}
								width="2rem"
								height="2rem"
								borderRadius="0.5rem"
							/>
							<div className={styles.userCardSkeletonMeta}>
								<Skeleton width="6rem" height="0.625rem" />
								<Skeleton width="4rem" height="0.5rem" />
							</div>
						</div>
					) : (
						<button
							type="button"
							className={`${styles.userCard} ${isUserMenuOpen ? styles.userCardOpen : ""}`}
							aria-haspopup="menu"
							aria-expanded={isUserMenuOpen}
							onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
						>
							{userName && (
								<img
									alt="user avatar"
									className={styles.userCardAvatar}
									src={userAvatar}
									height="32"
									width="32"
								/>
							)}
							<div className={styles.userMeta}>
								<div className={styles.userCardName}>{userName}</div>
								{email && <div className={styles.userCardEmail}>{email}</div>}
							</div>
							<DotsThree
								className={styles.userChevron}
								width={16}
								height={16}
							/>
						</button>
					)}
				</div>
			</aside>

			<aside className={styles.mobileMenuContainer}>
				<ul className={styles.mobileItemList}>
					<li
						id="mobile-icon-main-menu"
						className={`${styles.mobileItem} ${mainMenuOpen ? styles.mobileItemActive : ""}`}
						onClick={handlerMobileOpenMainMenu}
					>
						<List className={styles.mobileIcon} width={22} height={22} />
						<span className={styles.mobileItemLabel}>Menu</span>
					</li>
					{!isOnAiAssistant && (
						<li
							id="mobile-icon-open-list"
							className={`${styles.mobileItem} ${snippetListOpen ? styles.mobileItemActive : ""}`}
							onClick={handlerMobileOpenSnippetList}
						>
							<Rows className={styles.mobileIcon} width={22} height={22} />
							<span className={styles.mobileItemLabel}>Snippets</span>
						</li>
					)}
				</ul>
			</aside>

			<ShortcutsModal
				isOpen={isShortcutsOpen}
				onClose={() => setIsShortcutsOpen(false)}
			/>
		</>
	);
};

export default Aside;
