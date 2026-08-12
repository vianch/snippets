/*
 * What the pet says, and the mood it says it in.
 *
 * PetReactions maps every emitted PetEvent to a mode (which selects a
 * spritesheet row / pixel frame) and a pool of lines. The pet picks one at
 * random so repeating the same action doesn't repeat the same joke.
 */

import { PetEvent } from "@/lib/constants/pets.constants";
import { PetModes } from "@/lib/constants/snipPet";
import { ToastType } from "@/lib/constants/toast";

import type { PetMode } from "@/lib/constants/snipPet";

/*
 * While the pet is on screen it speaks the app's toasts instead of the toast
 * strip rendering them, so every toast severity needs a matching mood.
 */
export const PetToastModes: Record<ToastType, PetMode> = {
	[ToastType.Default]: PetModes.Reviewing,
	[ToastType.Error]: PetModes.Afraid,
	[ToastType.Info]: PetModes.Reviewing,
	[ToastType.Success]: PetModes.Celebrating,
	[ToastType.Warning]: PetModes.Afraid,
};

/* Unprompted chatter. Fired on a random 30s-5min timer while the pet wanders. */
export const PetIdlePhrases = [
	"I put the 'pet' in 'repeat'.",
	"Ctrl+S is my love language.",
	"I alphabetized your tags. In my head.",
	"Your indentation is beautiful today.",
	"Somewhere, a semicolon is missing. Not judging.",
	"I once met a bug. We don't talk about it.",
	"Tabs. Obviously. Don't @ me.",
	"That snippet from March? Still thinking about it.",
	"I ran your code in my head. It compiled.",
	"Do you ever just... stare at a regex?",
	"I'm not procrastinating, I'm pre-compiling.",
	"Every folder you make, I name a star after.",
	"Fun fact: I have no hands and I still type faster.",
	"Have you tried turning the bug off and on again?",
	"I would refactor this, but I like the chaos.",
	"Your snippet count is looking dangerously respectable.",
	"I dreamt in YAML. It was mostly indentation.",
	"Stack Overflow is just fan fiction for code.",
	"You've been staring at that line for a while. Same.",
	"Careful, that variable is named 'temp' and it's been 4 years.",
	"I like my code like my snacks: in small pieces.",
	"There are 10 types of pets. I'm both.",
	"That comment says 'TODO'. It has since 2019.",
	"Merge conflicts build character.",
	"I'm 90% snippet, 10% vibes.",
	"Naming things is hard. I'm named after scissors.",
	"Somewhere a linter is very proud of you.",
	"I tried to write a joke about async. It'll land later.",
	"Copy-paste is a design pattern. Fight me.",
	"Your dark theme is doing wonders for my complexion.",
	"I counted your snippets. Then I lost count. Then I napped.",
	"Rubber duck's on break. You've got me.",
	"This code is self-documenting. The docs disagree.",
	"I support your decision to not write tests. Silently.",
	"Consider this a wellness check. You're doing great.",
	"Have you saved recently? Asking for a friend. The friend is me.",
	"I organize snippets the way I organize feelings: badly.",
	"Legacy code is just code that survived.",
	"One does not simply escape a backslash.",
	"I read your notes field. Bold of you to be honest in there.",
	"If it works on your machine, ship your machine.",
	"That function does one thing. Allegedly.",
	"I'd offer to help debug but I'd just walk on the keyboard.",
	"Cache invalidation, naming things, and knowing when to stop scrolling.",
	"Somebody's about to write a regex. I can feel it.",
	"My favorite language is whichever one you're not fighting today.",
	"Your git history reads like a thriller.",
	"I've been trained on 4,000 snippets and one strong opinion.",
	"Deleting code is the highest form of programming.",
	"That's not a bug, that's an undocumented pet feature.",
	"I tried pair programming. My pair was a houseplant.",
	"You know what this snippet needs? Fewer nested ifs.",
	"Boolean flags multiply when unobserved.",
	"I'd explain recursion but first I'd explain recursion.",
	"Your future self called. They want better variable names.",
	"Some snippets are poetry. This one is a grocery list.",
	"I've walked 4,000 pixels today. Fitness pet.",
	"Every language is someone's favorite. Even that one.",
	"Documentation: the code you write for the person you'll become.",
	"I don't have opinions on frameworks. That's a lie.",
	"Whoever wrote this was in a hurry. It was you. Hi.",
	"The best abstraction is the one you didn't build.",
	"That import is unused. It knows. It's fine.",
	"I once ran `rm -rf` in a dream. I woke up sweating.",
	"Coffee is just a compiler for humans.",
	"Two hard things: off-by-one errors.",
	"I gave your snippet a tag. In spirit.",
	"Somewhere in this app, a promise is still pending.",
	"You could refactor that. Or you could pet me.",
	"Comments lie. Code merely misleads.",
	"I've read every snippet here. I have no notes. Mostly.",
	"That's a lot of tabs open, even by my standards.",
	"Is it a feature? Is it a bug? It's a *behavior*.",
	"I hold strong beliefs about trailing commas.",
	"Your snippets are safe. I checked. Twice. I'm anxious.",
	"They said 'move fast'. Nobody said where.",
	"Rewriting it from scratch always works. — Nobody, ever.",
	"That variable is doing four jobs and needs a raise.",
	"Everything is a state machine if you're brave enough.",
	"Sometimes the answer is a smaller function.",
	"I'd say 'it's just CSS' but I'm not a monster.",
	"Your snippet from last Tuesday saved somebody. Probably.",
	"I have a favorite snippet. I'll never tell.",
	"There is no cloud, just someone else's snippet manager.",
	"Deploy on a Friday. Live dangerously. Please don't.",
	"That loop runs once. It's very proud of itself.",
	"I once optimized something by deleting it entirely.",
	"Error messages are just feedback with attitude.",
	"You've been productive. I'll allow one snack break.",
	"I'm not lost, I'm exploring the viewport.",
	"Someone should write a test for that. Someone.",
	"You could name it `data`. You could also name it well.",
	"My hobbies: walking, judging code, napping.",
	"Every great snippet started as a bad one.",
	"If you build it, you will maintain it.",
	"I've seen things. Mostly nested ternaries.",
	"Optimism is assuming the API returns what the docs say.",
	"Take a break. The code will still be wrong later.",
	"You're doing better than the commit message suggests.",
	"Save your work. That's it. That's the message.",
] as const;

export const PetReactions: Record<PetEvent, PetReaction> = {
	[PetEvent.AiCompleted]: {
		mode: PetModes.Excited,
		phrases: [
			"The robot has spoken!",
			"Answer's in. I peeked.",
			"AI done thinking. I never started.",
			"Fresh from the model, still warm.",
			"That was fast. Suspiciously fast.",
			"Response complete! Read it before you paste it.",
		],
	},
	[PetEvent.AiFailed]: {
		mode: PetModes.Afraid,
		phrases: [
			"The model gave up. Relatable.",
			"AI said no. Rude.",
			"Something broke. Not me, though.",
			"Request failed. Try bribing it.",
			"That's an error. A big fancy one.",
		],
	},
	[PetEvent.AiStarted]: {
		mode: PetModes.Working,
		phrases: [
			"Thinking really hard...",
			"Asking the big brain.",
			"Consulting the oracle.",
			"Loading opinions...",
			"Brb, summoning tokens.",
		],
	},
	[PetEvent.CodeCopied]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Copied! Paste responsibly.",
			"It's on your clipboard now. Handle with care.",
			"Ctrl+C achieved. Ctrl+V awaits.",
			"Stolen. Legally. By you. From you.",
		],
	},
	[PetEvent.FavoriteAdded]: {
		mode: PetModes.Celebrating,
		phrases: [
			"A star! It's famous now.",
			"Favorited. Excellent taste.",
			"This one's a keeper.",
			"Added to the hall of fame.",
			"I'd have picked that one too.",
		],
	},
	[PetEvent.FavoriteRemoved]: {
		mode: PetModes.Afraid,
		phrases: [
			"Unstarred? It'll bounce back.",
			"We're just friends now.",
			"Demoted. Harsh but fair.",
			"Off the podium it goes.",
		],
	},
	[PetEvent.FolderChanged]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Filed away. Very tidy.",
			"New folder, new life.",
			"Organization! My favorite genre.",
			"It has a home now.",
		],
	},
	[PetEvent.FontChanged]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Ooh, new letters.",
			"That font has range.",
			"Typography matters. Says the pixel blob.",
			"Kerning approved.",
		],
	},
	[PetEvent.IdleChatter]: {
		mode: PetModes.Celebrating,
		phrases: PetIdlePhrases,
	},
	[PetEvent.LanguageChanged]: {
		mode: PetModes.Reviewing,
		phrases: [
			"New language! Bold move.",
			"Switching syntax. Buckle up.",
			"I liked the old one, but go off.",
			"Rewriting in a new language. Classic.",
			"Highlighting refreshed. You're welcome.",
		],
	},
	[PetEvent.SmartGroupSaved]: {
		mode: PetModes.Celebrating,
		phrases: [
			"Smart group saved. Very smart.",
			"That query works harder than I do.",
			"Saved search! Look at you automating.",
		],
	},
	[PetEvent.SnippetCreated]: {
		mode: PetModes.Excited,
		phrases: [
			"A blank canvas! Terrifying.",
			"New snippet! Name it something brave.",
			"Fresh file smell.",
			"Let's fill this one with genius.",
			"Untitled. For now.",
		],
	},
	[PetEvent.SnippetImported]: {
		mode: PetModes.Excited,
		phrases: [
			"Imported! Welcome to the family.",
			"New arrival. I'll show it around.",
			"Markdown adopted successfully.",
		],
	},
	[PetEvent.SnippetPublished]: {
		mode: PetModes.Celebrating,
		phrases: [
			"It's public! No pressure.",
			"The internet can see it now. Gulp.",
			"Link copied. Go be famous.",
			"Shipped to the world.",
		],
	},
	[PetEvent.SnippetRestored]: {
		mode: PetModes.Celebrating,
		phrases: [
			"Back from the dead!",
			"Rescued from the bin.",
			"I knew you'd miss it.",
			"Undo, but emotionally.",
		],
	},
	[PetEvent.SnippetSaveFailed]: {
		mode: PetModes.Afraid,
		phrases: [
			"It needs a name AND a body!",
			"Can't save an empty thought.",
			"Give it a title first, please.",
			"Half a snippet is no snippet.",
		],
	},
	[PetEvent.SnippetSaved]: {
		mode: PetModes.Celebrating,
		phrases: [
			"Saved! Crisis averted.",
			"Written to disk. Sleep well.",
			"Another one safely stored.",
			"Saved. I felt that in my pixels.",
			"Beautiful. Absolutely saved.",
			"That's the good stuff. Saved.",
		],
	},
	[PetEvent.SnippetShared]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Shared! Spread the knowledge.",
			"Off it goes into the wild.",
			"Sharing is caching.",
		],
	},
	[PetEvent.SnippetTrashed]: {
		mode: PetModes.Afraid,
		phrases: [
			"Into the bin! Bye forever. Probably.",
			"Deleted. I'll say a few words.",
			"That one had potential.",
			"Trashed. The bin is right there if you regret it.",
		],
	},
	[PetEvent.SnippetUnpublished]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Back to private. Cozy.",
			"Hidden from the world again.",
			"Nobody saw anything.",
		],
	},
	[PetEvent.TagAdded]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Tagged! Future you says thanks.",
			"A label! I love labels.",
			"That'll be searchable now.",
			"One more tag closer to order.",
		],
	},
	[PetEvent.TagRemoved]: {
		mode: PetModes.Afraid,
		phrases: [
			"Tag gone. Freedom, I guess.",
			"Untagged. Living dangerously.",
			"We hardly knew that tag.",
		],
	},
	[PetEvent.ThemeChanged]: {
		mode: PetModes.Reviewing,
		phrases: [
			"New colors! I match everything.",
			"Ooh, that palette works on me.",
			"Theme swapped. Very fresh.",
			"I look good in this one.",
		],
	},
	[PetEvent.TrashEmptied]: {
		mode: PetModes.Afraid,
		phrases: [
			"Bin emptied. No takebacks.",
			"Gone. Truly, properly gone.",
			"That was permanent, you know.",
		],
	},
	[PetEvent.UnsavedExit]: {
		mode: PetModes.Afraid,
		phrases: [
			"Wait! Unsaved changes!",
			"You're leaving? It isn't saved!",
			"Ctrl+S before you go, I beg.",
			"Don't do it. Save first!",
			"That escape route leads to lost work.",
		],
	},
	[PetEvent.VersionRestored]: {
		mode: PetModes.Reviewing,
		phrases: [
			"Time travel! Nice.",
			"Old version restored. Hello, past.",
			"Rolled back. Very responsible.",
		],
	},
};
