import test from 'ava'
import StateMachine from '../dist/state-machine';

//-------------------------------------------------------------------------------------------------

test('singleton construction', t => {

	var fsm = new StateMachine('none', {
		init: { from: 'none', to: 'A' },
		step1: { from: 'A', to: 'B' },
		step2: { from: 'B', to: 'C' }
	});

	t.is(fsm.state, 'none')

	t.deepEqual(fsm.allStates(), ['none', 'A', 'B', 'C'])
	t.deepEqual(fsm.allTransitions(), ['init', 'step1', 'step2'])

})


//-------------------------------------------------------------------------------------------------

test('singleton construction - with init state', t => {

	var fsm = new StateMachine('A', {
		step1: { from: 'A', to: 'B' },
		step2: { from: 'B', to: 'C' }
	});

	t.is(fsm.state, 'A')

	t.deepEqual(fsm.allStates(), ['A', 'B', 'C'])
	t.deepEqual(fsm.allTransitions(), ['step1', 'step2'])

})

//-------------------------------------------------------------------------------------------------

test('factory construction', async (t) => {

	var MyClass = StateMachine.factory('A', {
		step1: { from: 'A', to: 'B' },
		step2: { from: 'B', to: 'C' }
	});

	var fsm1 = MyClass(),
		fsm2 = MyClass(),
		fsm3 = MyClass();

	await fsm2.fire('step1');
	await fsm3.fire('step1');
	await fsm3.fire('step2');

	t.is(fsm1.state, 'A')
	t.is(fsm2.state, 'B')
	t.is(fsm3.state, 'C')

	t.deepEqual(fsm1.allStates(), ['A', 'B', 'C'])
	t.deepEqual(fsm2.allStates(), ['A', 'B', 'C'])
	t.deepEqual(fsm3.allStates(), ['A', 'B', 'C'])

	t.deepEqual(fsm1.allTransitions(), ['step1', 'step2'])
	t.deepEqual(fsm2.allTransitions(), ['step1', 'step2'])
	t.deepEqual(fsm3.allTransitions(), ['step1', 'step2'])

	t.deepEqual(fsm1.transitions(), ['step1'])
	t.deepEqual(fsm2.transitions(), ['step2'])
	t.deepEqual(fsm3.transitions(), [])
})

//-------------------------------------------------------------------------------------------------
