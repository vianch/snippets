import { create } from "zustand";

/* Constants */
import {
	PetEvent,
	PetEventBubbleDurationMs,
	PetMessageDurationMs,
	PetWorkingDurationMs,
} from "@/lib/constants/pets.constants";
import {
	PetReactions,
	PetToastModes,
} from "@/lib/constants/petReactions.constants";
import { ToastType } from "@/lib/constants/toast";

/* Utils */
import { pickRandomPhrase } from "@/utils/pet.utils";

type PetStoreState = {
	petActive: boolean;
	signal: PetSignal | null;
	emitPetEvent: (event: PetEvent) => void;
	emitPetMessage: (message: string, toastType: ToastType) => void;
	setPetActive: (petActive: boolean) => void;
};

/*
 * One-way channel from anywhere in the app to the pet. Actions emit; the pet is
 * the only subscriber. The nonce increments on every emit so reacting to the
 * same event twice in a row still re-triggers the bubble.
 *
 * `petActive` is written by the pet itself once it knows it is really on screen
 * (desktop viewport, fine pointer, preference on). The toast store reads it to
 * decide whether to render a toast or hand the message to the pet — the two
 * never speak at once.
 */
const usePetStore = create<PetStoreState>((set) => ({
	petActive: false,
	signal: null,
	emitPetEvent: (event: PetEvent) =>
		set((state) => ({
			signal: {
				// "Thinking" holds until the AI answer lands and overrides it.
				durationMs:
					event === PetEvent.AiStarted
						? PetWorkingDurationMs
						: PetEventBubbleDurationMs,
				message: pickRandomPhrase(PetReactions[event].phrases) ?? "",
				mode: PetReactions[event].mode,
				nonce: (state.signal?.nonce ?? 0) + 1,
			},
		})),
	emitPetMessage: (message: string, toastType: ToastType) =>
		set((state) => ({
			signal: {
				// Real copy, not a canned joke: give it longer to be read.
				durationMs: PetMessageDurationMs,
				message,
				mode: PetToastModes[toastType],
				nonce: (state.signal?.nonce ?? 0) + 1,
			},
		})),
	setPetActive: (petActive: boolean) => set({ petActive }),
}));

/* Callable outside React (hooks, async handlers) without subscribing. */
export const emitPetEvent = (event: PetEvent): void =>
	usePetStore.getState().emitPetEvent(event);

export const emitPetMessage = (message: string, toastType: ToastType): void =>
	usePetStore.getState().emitPetMessage(message, toastType);

export default usePetStore;
