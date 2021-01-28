import test from 'ava';
import StateMachine from '../dist/state-machine';

//-----------------------------------------------------------------------------

test('is', async (t) => {

	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' }
	});

	t.is(fsm.state, 'green')

	t.is(fsm.is('green'), true)
	t.is(fsm.is('yellow'), false)
	t.is(fsm.is(['green', 'red']), true, 'current state should match when included in array')
	t.is(fsm.is(['yellow', 'red']), false, 'current state should NOT match when not included in array')

	await fsm.fire('warn');

	t.is(fsm.state, 'yellow')
	t.is(fsm.is('green'), false)
	t.is(fsm.is('yellow'), true)
	t.is(fsm.is(['green', 'red']), false, 'current state should NOT match when not included in array')
	t.is(fsm.is(['yellow', 'red']), true, 'current state should match when included in array')

});

//-----------------------------------------------------------------------------

test('can & cannot', async (t) => {

	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' }
	});

	t.is(fsm.state, 'green')
	t.is(fsm.can('warn'), true)
	t.is(fsm.can('panic'), false)
	t.is(fsm.can('calm'), false)
	t.is(fsm.cannot('warn'), false)
	t.is(fsm.cannot('panic'), true)
	t.is(fsm.cannot('calm'), true)

	await fsm.fire('warn');
	t.is(fsm.state, 'yellow')
	t.is(fsm.can('warn'), false)
	t.is(fsm.can('panic'), true)
	t.is(fsm.can('calm'), false)
	t.is(fsm.cannot('warn'), true)
	t.is(fsm.cannot('panic'), false)
	t.is(fsm.cannot('calm'), true)

	await fsm.fire('panic')
	t.is(fsm.state, 'red')
	t.is(fsm.can('warn'), false)
	t.is(fsm.can('panic'), false)
	t.is(fsm.can('calm'), true)
	t.is(fsm.cannot('warn'), true)
	t.is(fsm.cannot('panic'), true)
	t.is(fsm.cannot('calm'), false)

	t.is(fsm.can('jibber'), false, "unknown event should not crash")
	t.is(fsm.cannot('jabber'), true, "unknown event should not crash")

});

//-----------------------------------------------------------------------------

test('can is always false during lifecycle events', async (t) => {
	t.plan(9);
	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' }
	}, {
		onBefore() {
			assertTransitionsNotAllowed();
		}
	});
	function assertTransitionsNotAllowed() {
		t.false(fsm.can('warn'))
		t.false(fsm.can('panic'))
		t.false(fsm.can('calm'))
	}

	t.is(fsm.state, 'green')
	await fsm.fire('warn');
	t.is(fsm.state, 'yellow')
	await fsm.fire('panic')
	t.is(fsm.state, 'red')

});

//-----------------------------------------------------------------------------

test('all states', t => {

	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' }
	});

	t.deepEqual(fsm.allStates(), ['green', 'yellow', 'red']);
});

//-----------------------------------------------------------------------------

test("all transitions", t => {
	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' },
		finish: { from: 'green', to: 'done' },
	});

	t.deepEqual(fsm.allTransitions(), [
		'warn', 'panic', 'calm', 'clear', 'finish'
	]);
})

//-----------------------------------------------------------------------------

test("valid transitions", async (t) => {
	var fsm = new StateMachine('green', {
		warn: { from: 'green', to: 'yellow' },
		panic: { from: 'yellow', to: 'red' },
		calm: { from: 'red', to: 'yellow' },
		clear: { from: 'yellow', to: 'green' },
		finish: { from: 'green', to: 'done' },
	});

	t.is(fsm.state, 'green')
	t.deepEqual(fsm.transitions(), ['warn', 'finish'])

	await fsm.fire('warn')
	t.is(fsm.state, 'yellow')
	t.deepEqual(fsm.transitions(), ['panic', 'clear'])

	await fsm.fire('panic')
	t.is(fsm.state, 'red')
	t.deepEqual(fsm.transitions(), ['calm'])

	await fsm.fire('calm')
	t.is(fsm.state, 'yellow')
	t.deepEqual(fsm.transitions(), ['panic', 'clear'])

	await fsm.fire('clear')
	t.is(fsm.state, 'green')
	t.deepEqual(fsm.transitions(), ['warn', 'finish'])

	await fsm.fire('finish')
	t.is(fsm.state, 'done')
	t.deepEqual(fsm.transitions(), [])
});

//-----------------------------------------------------------------------------
