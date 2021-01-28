import test from 'ava'
import StateMachine from '../dist/state-machine';

//-------------------------------------------------------------------------------------------------

test('empty state machine', t => {

	var fsm = new StateMachine('none', {});

	t.is(fsm.state, 'none')

	t.deepEqual(fsm.allStates(), [])
	t.deepEqual(fsm.allTransitions(), [])
	t.deepEqual(fsm.transitions(), [])

})

//-------------------------------------------------------------------------------------------------

test('empty state machine - but caller forgot new keyword', t => {

	var fsm = new StateMachine() // NOTE: missing 'new'

	t.is(fsm.state, undefined)

	t.deepEqual(fsm.allStates(), [])
	t.deepEqual(fsm.allTransitions(), [])
	t.deepEqual(fsm.transitions(), [])

})

//-------------------------------------------------------------------------------------------------
