import test from 'ava'
import StateMachine from '../dist/state-machine';

//-------------------------------------------------------------------------------------------------

test('github issue #17 - exceptions in lifecycle events are NOT swallowed', async (t) => {

	var fsm = new StateMachine('none', {
		step: { from: 'none', to: 'complete' }
		//		onTransition: function () { throw Error('oops') }
	});

	t.is(fsm.state, 'none')

	try {
		await fsm.fire('step')
	} catch (error) {
		t.is(error.message, 'oops')
	}
})

//-------------------------------------------------------------------------------------------------

test('github issue #64 - double wildcard transition does not change state', async (t) => {

	var fsm = new StateMachine('none', {
		step: { from: '*' /* no-op */ }
	});

	t.is(fsm.state, 'none')

	await fsm.fire('step'); t.is(fsm.state, 'none')
	await fsm.fire('step'); t.is(fsm.state, 'none')
})

//-------------------------------------------------------------------------------------------------
