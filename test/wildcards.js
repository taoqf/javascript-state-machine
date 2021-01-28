import test from 'ava'
import StateMachine from '../dist/state-machine';

//-----------------------------------------------------------------------------

test('wildcard :from allows transition from any state', async (t) => {

	var fsm = new StateMachine('stopped', {
		prepare: { from: 'stopped', to: 'ready' },
		start: { from: 'ready', to: 'running' },
		resume: { from: 'paused', to: 'running' },
		pause: { from: 'running', to: 'paused' },
		stop: { from: '*', to: 'stopped' }
	});

	t.is(fsm.state, 'stopped', "initial state should be stopped");

	await fsm.fire('prepare');
	t.is(fsm.state, 'ready')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')

	await fsm.fire('prepare')
	t.is(fsm.state, 'ready')
	await fsm.fire('start')
	t.is(fsm.state, 'running')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')

	await fsm.fire('prepare')
	t.is(fsm.state, 'ready')
	await fsm.fire('start')
	t.is(fsm.state, 'running')
	await fsm.fire('pause')
	t.is(fsm.state, 'paused')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')

	t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure wildcard transition (stop) is included in available transitions")
	await fsm.fire('prepare')
	t.deepEqual(fsm.transitions(), ["start", "stop"], "ensure wildcard transition (stop) is included in available transitions")
	await fsm.fire('start');
	t.deepEqual(fsm.transitions(), ["pause", "stop"], "ensure wildcard transition (stop) is included in available transitions")
	await fsm.fire('stop')
	t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure wildcard transition (stop) is included in available transitions")

})

//-----------------------------------------------------------------------------

test('missing :from allows transition from any state', async (t) => {

	var fsm = new StateMachine('stopped', {
		prepare: { from: 'stopped', to: 'ready' },
		start: { from: 'ready', to: 'running' },
		resume: { from: 'paused', to: 'running' },
		pause: { from: 'running', to: 'paused' },
		stop: {    /* any from state */  to: 'stopped' }
	});

	t.is(fsm.state, 'stopped', "initial state should be stopped")

	await fsm.fire('prepare')
	t.is(fsm.state, 'ready')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')

	await fsm.fire('prepare')
	t.is(fsm.state, 'ready')
	await fsm.fire('start')
	t.is(fsm.state, 'running')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')

	await fsm.fire('prepare')
	t.is(fsm.state, 'ready')
	await fsm.fire('start')
	t.is(fsm.state, 'running')
	await fsm.fire('pause')
	t.is(fsm.state, 'paused')
	await fsm.fire('stop')
	t.is(fsm.state, 'stopped')

	t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure missing :from transition (stop) is included in available transitions")
	await fsm.fire('prepare')
	t.deepEqual(fsm.transitions(), ["start", "stop"], "ensure missing :from transition (stop) is included in available transitions")
	await fsm.fire('start')
	t.deepEqual(fsm.transitions(), ["pause", "stop"], "ensure missing :from transition (stop) is included in available transitions")
	await fsm.fire('stop')
	t.deepEqual(fsm.transitions(), ["prepare", "stop"], "ensure missing :from transition (stop) is included in available transitions")

})

//-----------------------------------------------------------------------------

test('wildcard :from allows transition to a state that is never declared in any other :from transition ', async (t) => {

	var fsm = new StateMachine('none', {
		step: { from: 'none', to: 'mystery' }, // NOTE: 'mystery' is only ever declared in :to, never :from
		other: { from: '*', to: 'complete' }
	});

	t.is(fsm.state, 'none')
	t.is(fsm.can('step'), true)
	t.is(fsm.can('other'), true)

	await fsm.fire('step')

	t.is(fsm.state, 'mystery')
	t.is(fsm.can('step'), false)
	t.is(fsm.can('other'), true)

})

//-----------------------------------------------------------------------------

test('wildcard :to allows no-op transitions', async (t) => {

	var fsm = new StateMachine('A', {
		stayA: { from: 'A', to: '*' },
		stayB: { from: 'B', to: '*' },
		noop: { from: '*', to: '*' },
		step: { from: 'A', to: 'B' }
	});

	t.is(fsm.state, 'A')
	t.is(fsm.can('noop'), true)
	t.is(fsm.can('step'), true)
	t.is(fsm.can('stayA'), true)
	t.is(fsm.can('stayB'), false)

	await fsm.fire('stayA')
	t.is(fsm.state, 'A')
	await fsm.fire('noop');
	t.is(fsm.state, 'A')

	await fsm.fire('step')

	t.is(fsm.state, 'B')
	t.is(fsm.can('noop'), true)
	t.is(fsm.can('step'), false)
	t.is(fsm.can('stayA'), false)
	t.is(fsm.can('stayB'), true)

	await fsm.fire('stayB')
	t.is(fsm.state, 'B')
	await fsm.fire('noop')
	t.is(fsm.state, 'B')

})

//-----------------------------------------------------------------------------

test('missing :to allows no-op transitions', async (t) => {
	var fsm = new StateMachine('A', {
		stayA: { from: 'A'  /* no-op */ },
		stayB: { from: 'B'  /* no-op */ },
		noop: { from: '*'  /* no-op */ },
		step: { from: 'A', to: 'B' }
	});

	t.is(fsm.state, 'A')
	t.is(fsm.can('noop'), true)
	t.is(fsm.can('step'), true)
	t.is(fsm.can('stayA'), true)
	t.is(fsm.can('stayB'), false)

	await fsm.fire('stayA');
	t.is(fsm.state, 'A')
	await fsm.fire('noop');
	t.is(fsm.state, 'A')

	await fsm.fire('step');

	t.is(fsm.state, 'B')
	t.is(fsm.can('noop'), true)
	t.is(fsm.can('step'), false)
	t.is(fsm.can('stayA'), false)
	t.is(fsm.can('stayB'), true)

	await fsm.fire('stayB');
	t.is(fsm.state, 'B')
	await fsm.fire('noop');
	t.is(fsm.state, 'B')
})

//-----------------------------------------------------------------------------

test('no-op transitions with multiple from states', async (t) => {

	var fsm = new StateMachine('A', {
		step: { from: 'A', to: 'B' },
		noop1: { from: ['A', 'B']  /* no-op */ },
		noop2: { from: '*'         /* no-op */ },
		noop3: { from: ['A', 'B'], to: '*' },
		noop4: { from: '*', to: '*' }
	});

	t.is(fsm.state, 'A')
	t.is(fsm.can('step'), true)
	t.is(fsm.can('noop1'), true)
	t.is(fsm.can('noop2'), true)
	t.is(fsm.can('noop3'), true)
	t.is(fsm.can('noop4'), true)

	await fsm.fire('noop1')
	t.is(fsm.state, 'A')
	await fsm.fire('noop2')
	t.is(fsm.state, 'A')
	await fsm.fire('noop3')
	t.is(fsm.state, 'A')
	await fsm.fire('noop4')
	t.is(fsm.state, 'A')

	await fsm.fire('step')
	t.is(fsm.state, 'B')
	t.is(fsm.can('step'), false)
	t.is(fsm.can('noop1'), true)
	t.is(fsm.can('noop2'), true)
	t.is(fsm.can('noop3'), true)
	t.is(fsm.can('noop4'), true)

	await fsm.fire('noop1')
	t.is(fsm.state, 'B')
	await fsm.fire('noop2')
	t.is(fsm.state, 'B')
	await fsm.fire('noop3')
	t.is(fsm.state, 'B')
	await fsm.fire('noop4')
	t.is(fsm.state, 'B')

})

//-----------------------------------------------------------------------------
