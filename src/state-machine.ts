export interface Transitions {
	[transition: string]: {
		from: '*' | string | string[];
		to: string;
	}
}

export interface State {
	[transition: string]: {
		from: string;
		to: string;
	}
}

export interface Callbacks<T> {
	onPendingTransition: CallbackWithNoResult<T>;
	onBefore: Callback<T>;
	onLeave: Callback<T>;
	on: Callback<T>;
	onEnter: Callback<T>;
	onAfter: Callback<T>;
}

type Callback<T> = (transition: T, from: string, to: string, ...args: unknown[]) => boolean | Promise<boolean>;
type CallbackWithNoResult<T> = (transition: T, from: string, to: string, ...args: unknown[]) => unknown;

const wildcard = '*';

export default class StateMachine<T extends keyof P, P extends Transitions = Transitions> {
	public async fire(transition: T, ...args: unknown[]) {

		const from = this._state;
		const to = this.seek(transition);
		const changed = (from !== to);

		if (this.isPending()) {
			return this.callbacks.onPendingTransition(transition, from, to);
		}

		this.pending = true;

		try {
			let flag = true;
			flag = await this.callbacks.onBefore(transition, from, to, ...args);
			if (flag === false) {
				return;
			}
			if (changed) {
				flag = await this.callbacks.onLeave(transition, from, to, ...args);
				if (flag === false) {
					return;
				}
			}
			flag = await this.callbacks.on(transition, from, to, ...args);
			if (flag === false) {
				return;
			}
			if (changed) {
				this._state = to;
				flag = await this.callbacks.onEnter(transition, from, to, ...args);
				if (flag === false) {
					this._state = from;
					return;
				}
			}
			flag = await this.callbacks.onAfter(transition, from, to, ...args);
			if (flag === false) {
				this._state = from;
				return;
			}
		} catch (error) {
			this._state = from;
			throw error;
		} finally {
			this.pending = false;
		}
	}
	public is(state: string | string[]) {
		return Array.isArray(state) ? (state.indexOf(this._state) >= 0) : (this._state === state);
	}
	public isPending() {
		return this.pending;
	}
	public can(transition: T | string) {
		return !this.isPending() && !!this.seek(transition);
	}
	public cannot(transition: T | string) {
		return !this.can(transition);
	}
	public allStates() {
		return Array.from(Object.keys(this._transitions).reduce((pre, cur) => {
			const trans = this._transitions[cur];
			if (Array.isArray(trans.from)) {
				trans.from.forEach((it) => {
					pre.add(it);
				});
			} else {
				pre.add(trans.from);
			}
			pre.add(trans.to);
			return pre;
		}, new Set<string>()));
	}
	public allTransitions() {
		return Object.keys(this._transitions) as T[];
	}
	public transitions() {
		const state = this._state;
		return Object.keys(this.getTransMap(state)).concat(Object.keys(this.getTransMap(wildcard)));
	}
	public static factory<T extends keyof P, P extends Transitions = Transitions>(init: string, transitions: P, callbacks = {} as Partial<Callbacks<T>>) {
		return () => {
			return new StateMachine(init, transitions, callbacks);
		};
	}
	public get state() {
		return this._state;
	}
	public constructor(init: string, private _transitions = {} as P, cbs = {} as Partial<Callbacks<T>>) {
		this._state = init;
		this.callbacks = {
			onPendingTransition() { throw new Error('transition is invalid while previous transition is still in progress'); },
			onBefore() { return true; },
			onLeave() { return true; },
			on() { return true; },
			onEnter() { return true; },
			onAfter() { return true; },
			...cbs
		};
		for (const action in this._transitions) {
			if (Object.prototype.hasOwnProperty.call(this._transitions, action)) {
				const transition = this._transitions[action];
				const from = (() => {
					if (!transition.from) {
						return [wildcard];
					}
					if (Array.isArray(transition.from)) {
						return transition.from;
					}
					return [transition.from];
				})();
				const to = transition.to || wildcard;
				from.forEach((it) => {
					this.getTransMap(it)[action] = {
						from: it,
						to
					};
				})
			}
		}
	}
	private seek(transition: T | string) {
		const entry = this.transitionFor(this._state, transition);
		const to = entry && entry.to;
		if (to === wildcard) {
			return this._state;
		} else {
			return to;
		}
	}
	private transitionFor(state: string, transition: T | string) {
		return this.getTransMap(state)[transition as string] ||
			this.getTransMap(wildcard)[transition as string];
	}
	private getTransMap(state: string) {
		if (!this.map.has(state)) {
			this.map.set(state, {});
		}
		return this.map.get(state)!;
	}
	private callbacks = {} as Callbacks<T>;
	private _state: string;
	private map = new Map<string, State>();
	private pending = false;
}
