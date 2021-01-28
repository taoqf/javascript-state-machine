import test from 'ava'
import StateMachine from '../dist/state-machine';

//-------------------------------------------------------------------------------------------------

test('state cannot be modified directly', t => {

	var fsm = new StateMachine('none', {
		step: { from: 'none', to: 'complete' }
	})

	t.is(fsm.state, 'none')
	var error = t.throws(() => {
		fsm.state = 'other'
	})
	t.is(error.message, 'Cannot set property state of #<StateMachine> which has only a getter')
	t.is(fsm.state, 'none')

})

//-------------------------------------------------------------------------------------------------

test('fire transition while existing transition is still in process raises an exception', async (t) => {

	var fsm = new StateMachine('none', {
		step: { from: 'none', to: 'A' },
		other: { from: '*', to: 'X' }
		// methods: {
		// 	onBeforeStep: function () { this.other(); },
		// 	onBeforeOther: function () { t.fail('should never happen') },
		// 	onEnterX: function () { t.fail('should never happen') }
		// }
	}, {
		onBefore(transition, from, to) {
			if (transition === 'step') {
				return fsm.fire('other');
			}
		}
	});

	t.is(fsm.state, 'none')
	t.is(fsm.can('step'), true)
	t.is(fsm.can('other'), true)
	try {
		await fsm.fire('step');
	} catch (error) {
		t.is(error.message, 'transition is invalid while previous transition is still in progress')
	}

	t.is(fsm.state, 'none', 'entire transition was cancelled by the exception')

})

//-------------------------------------------------------------------------------------------------

test('pending transition handler can be customized', async (t) => {
	var fsm = new StateMachine('none', {
		step: { from: 'none', to: 'A' },
		other: { from: '*', to: 'X' }
	}, {
		onPendingTransition() {
			throw new Error('custom error');
		},
		onBefore(transition) {
			if (transition === 'step') {
				return fsm.fire('other');
			} else if (transition === 'other') {
				throw new Error('should never happen');
			}
		},
		onEnter() {
			throw new Error('should never happen');
		}
	});

	t.is(fsm.state, 'none')
	t.is(fsm.can('step'), true)
	t.is(fsm.can('other'), true);
	try {
		await fsm.fire('step')
	} catch (error) {
		t.is(error.message, 'custom error')
	}
	t.is(fsm.state, 'none')
})

//-------------------------------------------------------------------------------------------------
