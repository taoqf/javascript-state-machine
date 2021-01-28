import test from 'ava'
import StateMachine from '../dist/state-machine';

//-----------------------------------------------------------------------------

test('basic transition from state to state', async (t) => {

	var fsm = new StateMachine('A', {
		step1: { from: 'A', to: 'B' },
		step2: { from: 'B', to: 'C' },
		step3: { from: 'C', to: 'D' }
	});

	t.is(fsm.state, 'A')
	await fsm.fire('step1');
	t.is(fsm.state, 'B')
	await fsm.fire('step2');
	t.is(fsm.state, 'C')
	await fsm.fire('step3');
	t.is(fsm.state, 'D')

})

//-----------------------------------------------------------------------------

test('transitions with multiple from states', async (t) => {

	var fsm = new StateMachine('none', {
		start: { from: 'none', to: 'green' },
		warn: { from: ['green', 'red'], to: 'yellow' },
		panic: { from: ['green', 'yellow'], to: 'red' },
		clear: { from: ['red', 'yellow'], to: 'green' }
	});

	t.deepEqual(fsm.allStates(), ['none', 'green', 'red', 'yellow'])
	t.deepEqual(fsm.allTransitions(), ['start', 'warn', 'panic', 'clear'])

	t.is(fsm.state, 'none')
	t.is(fsm.can('start'), true)
	t.is(fsm.can('warn'), false)
	t.is(fsm.can('panic'), false)
	t.is(fsm.can('clear'), false)
	t.deepEqual(fsm.transitions(), ['start'])

	await fsm.fire('start')
	t.is(fsm.state, 'green')
	t.is(fsm.can('start'), false)
	t.is(fsm.can('warn'), true)
	t.is(fsm.can('panic'), true)
	t.is(fsm.can('clear'), false)
	t.deepEqual(fsm.transitions(), ['warn', 'panic'])

	await fsm.fire('warn')
	t.is(fsm.state, 'yellow')
	t.is(fsm.can('start'), false)
	t.is(fsm.can('warn'), false)
	t.is(fsm.can('panic'), true)
	t.is(fsm.can('clear'), true)
	t.deepEqual(fsm.transitions(), ['panic', 'clear'])

	await fsm.fire('panic')
	t.is(fsm.state, 'red')
	t.is(fsm.can('start'), false)
	t.is(fsm.can('warn'), true)
	t.is(fsm.can('panic'), false)
	t.is(fsm.can('clear'), true)
	t.deepEqual(fsm.transitions(), ['warn', 'clear'])

	await fsm.fire('clear')
	t.is(fsm.state, 'green')
	t.is(fsm.can('start'), false)
	t.is(fsm.can('warn'), true)
	t.is(fsm.can('panic'), true)
	t.is(fsm.can('clear'), false)
	t.deepEqual(fsm.transitions(), ['warn', 'panic'])

})

//-------------------------------------------------------------------------------------------------
